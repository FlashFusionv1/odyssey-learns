-- ============================================================================
-- TEACHER PROFILES: Fix the safe view
-- ============================================================================

-- Drop the existing view and recreate with correct columns
DROP VIEW IF EXISTS public.teacher_profiles_safe;

CREATE VIEW public.teacher_profiles_safe 
WITH (security_invoker = true)
AS SELECT 
  id,
  user_id,
  full_name,
  school_id,
  subjects,
  department,
  bio,
  avatar_url,
  grade_levels,
  is_verified,
  verification_date,
  settings,
  created_at,
  updated_at
  -- EXCLUDES: email, employee_id (PII that could enable phishing/identity theft)
FROM teacher_profiles;

GRANT SELECT ON public.teacher_profiles_safe TO authenticated;

-- Drop the old permissive policy that exposes sensitive data to parents
DROP POLICY IF EXISTS "Parents can view enrolled teachers safe data" ON teacher_profiles;