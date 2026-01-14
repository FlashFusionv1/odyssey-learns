import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { child_id, format = 'json' } = await req.json();

    // Verify parent owns child
    const { data: child, error: childError } = await supabaseClient
      .from('children')
      .select('*')
      .eq('id', child_id)
      .eq('parent_id', user.id)
      .single();

    if (childError || !child) {
      return new Response(JSON.stringify({ error: 'Child not found or access denied' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Gather all child data
    const exportData: any = {
      export_date: new Date().toISOString(),
      child_profile: child,
    };

    // User progress
    const { data: progress } = await supabaseClient
      .from('user_progress')
      .select('*')
      .eq('child_id', child_id);
    exportData.learning_progress = progress || [];

    // Emotion logs (sensitive fields are encrypted - export includes encrypted bytea columns)
    // Note: Plaintext trigger/coping_strategy/reflection_notes have been removed for security
    const { data: emotions } = await supabaseClient
      .from('emotion_logs')
      .select('id, child_id, emotion_type, intensity, logged_at, created_at, trigger_encrypted, coping_strategy_encrypted, reflection_notes_encrypted')
      .eq('child_id', child_id);
    exportData.emotion_logs = emotions || [];

    // Screen time sessions
    const { data: screenTime } = await supabaseClient
      .from('screen_time_sessions')
      .select('*')
      .eq('child_id', child_id);
    exportData.screen_time_history = screenTime || [];

    // Analytics events
    const { data: analytics } = await supabaseClient
      .from('analytics_events')
      .select('*')
      .eq('child_id', child_id);
    exportData.activity_events = analytics || [];

    // Messages
    const { data: messages } = await supabaseClient
      .from('parent_child_messages')
      .select('*')
      .eq('child_id', child_id);
    exportData.messages = messages || [];

    // Generated lessons
    const { data: lessons } = await supabaseClient
      .from('child_generated_lessons')
      .select('*')
      .eq('child_id', child_id);
    exportData.created_lessons = lessons || [];

    // Log export
    await supabaseClient.from('data_export_log').insert({
      parent_id: user.id,
      child_id: child_id,
      export_format: format,
      export_size_bytes: JSON.stringify(exportData).length,
    });

    if (format === 'json') {
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${child.name}_data.json"`
        },
      });
    } else {
      // For CSV, return a simple message (full CSV generation would require more complex logic)
      return new Response(
        JSON.stringify({ message: 'CSV export coming soon. Please use JSON for now.' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Export failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
