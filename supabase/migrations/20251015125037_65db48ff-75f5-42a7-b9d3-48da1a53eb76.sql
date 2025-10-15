-- Enable RLS on collaboration_rate_limit table
ALTER TABLE collaboration_rate_limit ENABLE ROW LEVEL SECURITY;

-- Add policy (only system can manage this table via triggers)
CREATE POLICY "System only access"
ON collaboration_rate_limit
FOR ALL
USING (false)
WITH CHECK (false);