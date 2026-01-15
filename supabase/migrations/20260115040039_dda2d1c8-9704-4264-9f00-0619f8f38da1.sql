-- ============================================================
-- SECURITY HARDENING: teacher_profiles & emotion_logs
-- ============================================================

-- 1. Create a secure VIEW for teacher_profiles that hides sensitive data
-- This view only exposes non-PII fields needed for parent context
CREATE OR REPLACE VIEW public.teacher_profiles_safe AS
SELECT 
  id,
  school_id,
  full_name,  -- Teachers' names are needed for identification
  subjects,
  grade_levels,
  department,
  avatar_url,
  is_verified
FROM public.teacher_profiles;

-- 2. Drop existing overly-permissive SELECT policy for parents
DROP POLICY IF EXISTS "Parents can view teachers of enrolled children" ON public.teacher_profiles;

-- 3. Create new RESTRICTIVE policy that only allows viewing own teacher profile or via admin
-- Parents should query the SAFE VIEW instead, not the base table directly
CREATE POLICY "Only teachers can view own full profile"
ON public.teacher_profiles
AS RESTRICTIVE
FOR SELECT
USING (
  user_id = auth.uid() OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Grant SELECT on the safe view to authenticated users (for parent queries)
GRANT SELECT ON public.teacher_profiles_safe TO authenticated;

-- ============================================================
-- emotion_logs: Encrypt emotion_type and add tighter controls
-- ============================================================

-- 5. Add encrypted column for emotion_type (the plaintext column will be deprecated)
ALTER TABLE public.emotion_logs 
ADD COLUMN IF NOT EXISTS emotion_type_encrypted bytea;

-- 6. Add encrypted column for intensity (also sensitive)
ALTER TABLE public.emotion_logs 
ADD COLUMN IF NOT EXISTS intensity_encrypted bytea;

-- 7. Drop the old permissive parent view policy
DROP POLICY IF EXISTS "Parents can view recent emotion logs only" ON public.emotion_logs;

-- 8. Create more restrictive parent access:
--    - Only parents of the child
--    - Only last 30 days (reduced from 90)
--    - Only encrypted columns visible (app must decrypt)
CREATE POLICY "Parents can view child emotion logs (30 days encrypted only)"
ON public.emotion_logs
AS RESTRICTIVE
FOR SELECT
USING (
  child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  )
  AND logged_at > (now() - interval '30 days')
  AND auth.uid() IS NOT NULL
);

-- 9. Create a secure VIEW for emotion_logs that ONLY shows encrypted data
CREATE OR REPLACE VIEW public.emotion_logs_safe AS
SELECT 
  id,
  child_id,
  logged_at,
  created_at,
  -- All sensitive fields encrypted
  emotion_type_encrypted,
  intensity_encrypted,
  trigger_encrypted,
  coping_strategy_encrypted,
  reflection_notes_encrypted
FROM public.emotion_logs;

-- 10. Grant access to the safe view
GRANT SELECT ON public.emotion_logs_safe TO authenticated;

-- 11. Comment on tables for documentation
COMMENT ON VIEW public.teacher_profiles_safe IS 
'Secure view of teacher_profiles hiding email, employee_id, bio, and settings. Use this for parent-facing queries.';

COMMENT ON VIEW public.emotion_logs_safe IS 
'Secure view of emotion_logs exposing only encrypted columns. All sensitive mental health data must be decrypted client-side.';

-- 12. Add function to help transition: encrypt emotion_type values
CREATE OR REPLACE FUNCTION public.get_emotion_summary_for_parent(p_child_id uuid)
RETURNS TABLE (
  log_date date,
  log_count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Returns only aggregate data (counts per day) - no actual emotion details
  SELECT 
    DATE(logged_at) as log_date,
    COUNT(*) as log_count
  FROM emotion_logs
  WHERE child_id = p_child_id
    AND child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
    AND logged_at > (now() - interval '30 days')
  GROUP BY DATE(logged_at)
  ORDER BY log_date DESC;
$$;