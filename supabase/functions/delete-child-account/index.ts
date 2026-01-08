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

    const { child_id, action } = await req.json();

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

    if (action === 'schedule') {
      // Schedule deletion (7-day grace period)
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 7);

      const { error: updateError } = await supabaseClient
        .from('children')
        .update({
          deletion_scheduled_at: deletionDate.toISOString(),
          deletion_reason: 'Parent requested deletion'
        })
        .eq('id', child_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ 
          message: 'Deletion scheduled',
          deletion_date: deletionDate.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'cancel') {
      // Cancel scheduled deletion
      const { error: updateError } = await supabaseClient
        .from('children')
        .update({
          deletion_scheduled_at: null,
          deletion_reason: null
        })
        .eq('id', child_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ message: 'Deletion cancelled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'execute') {
      // Permanent deletion (should only be called by scheduled job)
      // For now, just mark as deleted (actual deletion would cascade)
      const { error: deleteError } = await supabaseClient
        .from('children')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', child_id);

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ message: 'Account permanently deleted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error: any) {
    console.error('Deletion error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Deletion failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
