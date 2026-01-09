import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VideoAnalyticsEvent {
  video_id: string;
  child_id: string;
  event_type: 'view' | 'play' | 'pause' | 'complete' | 'quiz_answer' | 'chapter_view';
  event_data?: {
    timestamp?: number;
    quiz_correct?: boolean;
    chapter_index?: number;
    watch_duration?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { video_id, child_id, event_type, event_data }: VideoAnalyticsEvent = await req.json();

    if (!video_id || !child_id || !event_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the analytics event
    const { error: eventError } = await supabase
      .from('video_analytics')
      .insert({
        video_id,
        child_id,
        event_type,
        event_data: event_data || {},
        created_at: new Date().toISOString(),
      });

    if (eventError) {
      console.error("Error recording event:", eventError);
      throw eventError;
    }

    // Update video-level aggregates based on event type
    if (event_type === 'view') {
      await supabase
        .from('video_lessons')
        .update({ 
          view_count: supabase.rpc('coalesce_increment', { 
            current_val: 'view_count', 
            increment: 1 
          })
        })
        .eq('id', video_id);
    }

    // Update watch progress if we have duration data
    if (event_data?.watch_duration && event_data.watch_duration > 0) {
      // Get video duration for completion percentage
      const { data: videoData } = await supabase
        .from('video_lessons')
        .select('duration_seconds')
        .eq('id', video_id)
        .single();

      if (videoData) {
        const completionPercentage = Math.min(
          100,
          (event_data.watch_duration / (videoData.duration_seconds || 1)) * 100
        );

        await supabase
          .from('video_watch_progress')
          .upsert({
            video_id,
            child_id,
            total_watch_time_seconds: event_data.watch_duration,
            completion_percentage: completionPercentage,
            last_watched_at: new Date().toISOString(),
          }, {
            onConflict: 'video_id,child_id',
          });
      }
    }

    // Handle completion events
    if (event_type === 'complete') {
      // Mark as completed
      await supabase
        .from('video_watch_progress')
        .upsert({
          video_id,
          child_id,
          is_completed: true,
          completed_at: new Date().toISOString(),
          completion_percentage: 100,
          last_watched_at: new Date().toISOString(),
        }, {
          onConflict: 'video_id,child_id',
        });

      // Award points for completion
      const { data: childData } = await supabase
        .from('children')
        .select('total_points')
        .eq('id', child_id)
        .single();

      if (childData) {
        await supabase
          .from('children')
          .update({ total_points: (childData.total_points || 0) + 25 })
          .eq('id', child_id);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in track-video-analytics:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
