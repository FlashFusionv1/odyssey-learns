-- Fix remaining overly permissive RLS policies

-- 1. Fix profile_analysis_history: Only for child's parent (using child_id directly)
DROP POLICY IF EXISTS "Service can insert analysis history" ON profile_analysis_history;
CREATE POLICY "Parents can insert analysis history for their children"
ON profile_analysis_history FOR INSERT
TO authenticated
WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Fix skill_mastery: INSERT - Only for child's parent
DROP POLICY IF EXISTS "Service can insert skill mastery" ON skill_mastery;
CREATE POLICY "Parents can insert skill mastery for their children"
ON skill_mastery FOR INSERT
TO authenticated
WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Fix skill_mastery: UPDATE - Only for child's parent
DROP POLICY IF EXISTS "Service can update skill mastery" ON skill_mastery;
CREATE POLICY "Parents can update skill mastery for their children"
ON skill_mastery FOR UPDATE
TO authenticated
USING (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);