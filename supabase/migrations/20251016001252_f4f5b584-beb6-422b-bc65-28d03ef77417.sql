-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a scheduled job to run weekly reports every Monday at 8 AM
SELECT cron.schedule(
  'generate-weekly-reports',
  '0 8 * * 1', -- Every Monday at 8:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://hcsglifjqdmiykrrmncn.supabase.co/functions/v1/generate-weekly-reports',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjc2dsaWZqcWRtaXlrcnJtbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODYxNDEsImV4cCI6MjA3NjA2MjE0MX0.SRbOKjtmF0dYE2Lzmbx1Q-rO360WWMUDVeRLs_Rs4ek"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- View all cron jobs (for verification)
-- SELECT * FROM cron.job;