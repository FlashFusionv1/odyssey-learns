-- Add missing RLS policy for user_access_baselines
CREATE POLICY "Admins manage baselines" ON user_access_baselines FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));