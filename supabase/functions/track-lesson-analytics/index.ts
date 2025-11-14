import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { lessonId, childId, eventType } = await req.json();

    // Validate input
    if (!lessonId || !childId || !eventType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: lessonId, childId, eventType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['view', 'save', 'share'].includes(eventType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid eventType. Must be: view, save, or share' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert analytics event
    const { error } = await supabase
      .from('lesson_analytics_events')
      .insert({
        lesson_id: lessonId,
        child_id: childId,
        event_type: eventType,
      });

    if (error) {
      console.error('Error tracking analytics:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to track analytics event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Analytics tracked successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-lesson-analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});