-- ============================================================
-- FIX: Convert SECURITY DEFINER views to SECURITY INVOKER
-- This ensures RLS policies of the querying user apply, not the view creator
-- ============================================================

-- 1. Recreate teacher_profiles_safe with SECURITY INVOKER
DROP VIEW IF EXISTS public.teacher_profiles_safe;

CREATE VIEW public.teacher_profiles_safe 
WITH (security_invoker = on) AS
SELECT 
  id,
  school_id,
  full_name,
  subjects,
  grade_levels,
  department,
  avatar_url,
  is_verified
FROM public.teacher_profiles;

-- Re-grant access
GRANT SELECT ON public.teacher_profiles_safe TO authenticated;

COMMENT ON VIEW public.teacher_profiles_safe IS 
'Secure view of teacher_profiles hiding email, employee_id, bio, and settings. Uses SECURITY INVOKER to respect RLS.';

-- 2. Recreate emotion_logs_safe with SECURITY INVOKER
DROP VIEW IF EXISTS public.emotion_logs_safe;

CREATE VIEW public.emotion_logs_safe 
WITH (security_invoker = on) AS
SELECT 
  id,
  child_id,
  logged_at,
  created_at,
  emotion_type_encrypted,
  intensity_encrypted,
  trigger_encrypted,
  coping_strategy_encrypted,
  reflection_notes_encrypted
FROM public.emotion_logs;

-- Re-grant access
GRANT SELECT ON public.emotion_logs_safe TO authenticated;

COMMENT ON VIEW public.emotion_logs_safe IS 
'Secure view of emotion_logs exposing only encrypted columns. Uses SECURITY INVOKER to respect RLS.';

-- 3. Since teacher_profiles_safe uses SECURITY INVOKER, we need a SELECT policy
--    that allows parents to see enrolled teachers via the safe view
--    Create a permissive policy for the safe columns only
CREATE POLICY "Parents can view enrolled teachers safe data"
ON public.teacher_profiles
AS PERMISSIVE
FOR SELECT
USING (
  id IN (
    SELECT c.teacher_id
    FROM classes c
    JOIN class_roster cr ON c.id = cr.class_id
    JOIN children ch ON cr.child_id = ch.id
    WHERE ch.parent_id = auth.uid()
  )
);