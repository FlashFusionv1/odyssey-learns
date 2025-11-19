import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Placeholder for external alerting (would be configured via secrets)
const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL');
const SECURITY_EMAIL = Deno.env.get('SECURITY_TEAM_EMAIL');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { severity, type, message, metadata } = await req.json();

    // Log to database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient.from('security_alerts').insert({
      severity,
      alert_type: type,
      message,
      metadata,
    });

    // Send to Slack for high/critical alerts
    if ((severity === 'high' || severity === 'critical') && SLACK_WEBHOOK_URL) {
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${severity.toUpperCase()}: ${type}`,
          blocks: [
            {
              type: 'section',
              text: { type: 'mrkdwn', text: message },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `\`\`\`${JSON.stringify(metadata, null, 2)}\`\`\``,
                },
              ],
            },
          ],
        }),
      });
    }

    // Send email for critical alerts
    if (severity === 'critical' && SECURITY_EMAIL) {
      console.log(`Would send email to ${SECURITY_EMAIL}: ${message}`);
      // In production, integrate with email service
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Alert sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Alert error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Alert failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
