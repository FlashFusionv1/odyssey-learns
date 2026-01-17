import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImageGenerationRequest {
  imageType: "dashboard" | "subject" | "badge" | "mascot" | "illustration" | "ui";
  imageCategory?: string;
  title: string;
  prompt: string;
  saveToStorage?: boolean;
}

interface BatchGenerationRequest {
  images: ImageGenerationRequest[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const body = await req.json();
    const isBatch = "images" in body;
    const imagesToGenerate: ImageGenerationRequest[] = isBatch 
      ? (body as BatchGenerationRequest).images 
      : [body as ImageGenerationRequest];

    const results = [];

    for (const imageReq of imagesToGenerate) {
      console.log(`Generating image: ${imageReq.title}`);

      // Generate image using Lovable AI Gateway
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: imageReq.prompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for ${imageReq.title}:`, errorText);
        results.push({
          title: imageReq.title,
          success: false,
          error: `AI API error: ${response.status}`,
        });
        continue;
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.error(`No image generated for ${imageReq.title}`);
        results.push({
          title: imageReq.title,
          success: false,
          error: "No image in response",
        });
        continue;
      }

      let storagePath = null;
      let storageUrl = null;

      // Save to storage if requested
      if (imageReq.saveToStorage !== false) {
        try {
          // Extract base64 data
          const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
          const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

          // Generate filename
          const filename = `${imageReq.imageType}/${imageReq.imageCategory || "general"}/${imageReq.title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;

          // Upload to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("platform-images")
            .upload(filename, imageBuffer, {
              contentType: "image/png",
              upsert: true,
            });

          if (uploadError) {
            console.error(`Storage upload error for ${imageReq.title}:`, uploadError);
          } else {
            storagePath = uploadData.path;
            const { data: urlData } = supabase.storage
              .from("platform-images")
              .getPublicUrl(storagePath);
            storageUrl = urlData.publicUrl;
          }
        } catch (storageErr) {
          console.error(`Storage processing error for ${imageReq.title}:`, storageErr);
        }
      }

      // Create a smaller preview (first 1000 chars of base64 for thumbnail purposes)
      const base64Preview = imageUrl.substring(0, 1000);

      // Save to database
      const { data: dbData, error: dbError } = await supabase
        .from("generated_images")
        .insert({
          image_type: imageReq.imageType,
          image_category: imageReq.imageCategory,
          title: imageReq.title,
          prompt: imageReq.prompt,
          storage_path: storagePath,
          storage_url: storageUrl,
          base64_preview: base64Preview,
          metadata: {
            model: "google/gemini-2.5-flash-image-preview",
            generated_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (dbError) {
        console.error(`Database error for ${imageReq.title}:`, dbError);
      }

      results.push({
        id: dbData?.id,
        title: imageReq.title,
        success: true,
        storageUrl,
        storagePath,
      });

      console.log(`Successfully generated: ${imageReq.title}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-platform-images:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
