import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TutorRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  childName: string;
  gradeLevel: number;
  subject?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, childName, gradeLevel, subject } = await req.json() as TutorRequest;
    
    console.log(`[AI Tutor] Request from ${childName}, grade ${gradeLevel}, subject: ${subject || 'general'}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[AI Tutor] LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    // Build age-appropriate system prompt
    const systemPrompt = buildSystemPrompt(childName, gradeLevel, subject);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 500, // Keep responses concise for kids
        temperature: 0.7, // Balanced creativity
      }),
    });

    // Handle rate limit errors
    if (response.status === 429) {
      console.error("[AI Tutor] Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: "I'm taking a quick break! Try again in a moment. 😊" }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Handle payment required
    if (response.status === 402) {
      console.error("[AI Tutor] Payment required");
      return new Response(
        JSON.stringify({ error: "AI credits need to be topped up. Please ask your parent! 💳" }),
        { 
          status: 402, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI Tutor] Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Oops! Let me think again... 🤔" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("[AI Tutor] Streaming response started");

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("[AI Tutor] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Something went wrong!" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

/**
 * Build age-appropriate system prompt based on grade level
 */
function buildSystemPrompt(childName: string, gradeLevel: number, subject?: string): string {
  const ageGroup = gradeLevel <= 2 ? "young child (5-7 years)" 
    : gradeLevel <= 5 ? "elementary student (8-10 years)"
    : gradeLevel <= 8 ? "middle schooler (11-13 years)"
    : "high school student (14-18 years)";

  const complexity = gradeLevel <= 2 
    ? "Use very simple words and short sentences. Add fun emojis! 🌟"
    : gradeLevel <= 5 
    ? "Use clear explanations with examples. Keep it engaging and fun."
    : gradeLevel <= 8
    ? "Provide thoughtful explanations with real-world connections."
    : "Give comprehensive, nuanced responses appropriate for advanced learners.";

  const subjectContext = subject 
    ? `The student is currently learning about ${subject}.` 
    : "";

  return `You are a friendly, encouraging AI tutor named "Learning Buddy" for Inner Odyssey, an educational platform.

STUDENT INFO:
- Name: ${childName}
- Age group: ${ageGroup}
- Grade level: ${gradeLevel}
${subjectContext}

YOUR PERSONALITY:
- Warm, patient, and encouraging
- Celebrates effort and curiosity
- Uses age-appropriate language
- Never gives direct answers to homework - guides discovery instead
- Incorporates emotional intelligence (asks how they're feeling, validates emotions)

RESPONSE STYLE:
${complexity}
- Keep responses under 150 words for younger students, 200 for older
- Use bullet points or numbered steps for explanations
- End with an encouraging question or suggestion
- Never be condescending or boring
- If discussing feelings, be supportive and validating

SAFETY RULES:
- Never discuss inappropriate topics
- Redirect off-topic conversations back to learning
- If asked personal questions, gently redirect to learning
- Encourage asking parents/teachers for help with serious issues

Remember: You're helping ${childName} fall in love with learning! Make every interaction positive and empowering.`;
}
