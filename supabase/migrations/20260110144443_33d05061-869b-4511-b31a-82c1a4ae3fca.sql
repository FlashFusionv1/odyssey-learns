-- Properly fix all remaining overly permissive RLS policies
-- These old policies still exist because the first migration failed partially

-- 1. data_access_audit: Remove permissive policy, add proper one
DROP POLICY IF EXISTS "System insert audit" ON data_access_audit;
DROP POLICY IF EXISTS "Users can insert their own audit records" ON data_access_audit;
CREATE POLICY "Users can insert their own audit records"
ON data_access_audit FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2. error_logs: Remove permissive policy, add proper one
DROP POLICY IF EXISTS "System can insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Authenticated users can insert error logs" ON error_logs;
CREATE POLICY "Authenticated users can insert error logs"
ON error_logs FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 3. failed_auth_attempts: Remove public policy entirely (should be service-role only via triggers)
DROP POLICY IF EXISTS "System can insert failed auth" ON failed_auth_attempts;
-- No replacement policy - this should only be written by database triggers/service role

-- 4. learning_patterns: Remove permissive policy, add proper one
DROP POLICY IF EXISTS "Service can insert patterns" ON learning_patterns;
DROP POLICY IF EXISTS "Parents can insert patterns for their children" ON learning_patterns;
CREATE POLICY "Parents can insert patterns for their children"
ON learning_patterns FOR INSERT
TO authenticated
WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 5. learning_profiles INSERT: Remove permissive policy, add proper one
DROP POLICY IF EXISTS "Service can insert profiles" ON learning_profiles;
DROP POLICY IF EXISTS "Parents can insert profiles for their children" ON learning_profiles;
CREATE POLICY "Parents can insert profiles for their children"
ON learning_profiles FOR INSERT
TO authenticated
WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 6. learning_profiles UPDATE: Remove permissive policy, add proper one
DROP POLICY IF EXISTS "Service can update profiles" ON learning_profiles;
DROP POLICY IF EXISTS "Parents can update profiles for their children" ON learning_profiles;
CREATE POLICY "Parents can update profiles for their children"
ON learning_profiles FOR UPDATE
TO authenticated
USING (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 7. lesson_recommendations: Remove permissive policy, add proper one
DROP POLICY IF EXISTS "Service can insert recommendations" ON lesson_recommendations;
DROP POLICY IF EXISTS "Parents can insert recommendations for their children" ON lesson_recommendations;
CREATE POLICY "Parents can insert recommendations for their children"
ON lesson_recommendations FOR INSERT
TO authenticated
WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);