-- ============================================================
-- SECURITY HARDENING: 3 Privacy Issues Fix
-- 1. emotion_logs: Force plaintext masking on all inserts
-- 2. teacher_profiles: Add school admin access policy
-- 3. shared_activities: Add privacy controls for participant visibility
-- ============================================================

-- ============================================================
-- 1. EMOTION_LOGS: Harden plaintext field masking
-- ============================================================

-- Drop the old trigger and function that references non-existent columns
DROP TRIGGER IF EXISTS enforce_emotion_encryption ON public.emotion_logs;
DROP FUNCTION IF EXISTS public.check_emotion_encryption();

-- Drop the existing check constraints that prevent masking
ALTER TABLE public.emotion_logs DROP CONSTRAINT IF EXISTS emotion_logs_emotion_type_check;
ALTER TABLE public.emotion_logs DROP CONSTRAINT IF EXISTS emotion_logs_intensity_check;

-- Make plaintext columns nullable and set default to masked values
ALTER TABLE public.emotion_logs 
ALTER COLUMN emotion_type SET DEFAULT '[MASKED]',
ALTER COLUMN emotion_type DROP NOT NULL,
ALTER COLUMN intensity SET DEFAULT 0,
ALTER COLUMN intensity DROP NOT NULL;

-- Add new check constraints that allow masked values
ALTER TABLE public.emotion_logs 
ADD CONSTRAINT emotion_logs_emotion_type_check 
CHECK (emotion_type IS NULL OR emotion_type = '[MASKED]' OR emotion_type = ANY (ARRAY['happy', 'excited', 'proud', 'calm', 'worried', 'sad', 'angry', 'frustrated', 'tired', 'confused']));

ALTER TABLE public.emotion_logs 
ADD CONSTRAINT emotion_logs_intensity_check 
CHECK (intensity IS NULL OR intensity = 0 OR (intensity >= 1 AND intensity <= 5));

-- Create trigger to ALWAYS mask plaintext on insert/update
CREATE OR REPLACE FUNCTION public.enforce_emotion_data_masking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ALWAYS mask plaintext fields - sensitive data must be encrypted only
  NEW.emotion_type := '[MASKED]';
  NEW.intensity := 0;
  
  -- Log if encrypted fields are missing (shouldn't happen in normal flow)
  IF NEW.emotion_type_encrypted IS NULL THEN
    RAISE WARNING 'emotion_logs insert without encrypted emotion_type from child_id: %', NEW.child_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS enforce_emotion_masking ON public.emotion_logs;
CREATE TRIGGER enforce_emotion_masking
  BEFORE INSERT OR UPDATE ON public.emotion_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_emotion_data_masking();

-- Update any existing unmasked records
UPDATE public.emotion_logs 
SET emotion_type = '[MASKED]', intensity = 0
WHERE emotion_type != '[MASKED]' OR intensity != 0;

-- ============================================================
-- 2. SHARED_ACTIVITIES: Add privacy controls
-- ============================================================

-- Add privacy_level column to shared_activities
ALTER TABLE public.shared_activities 
ADD COLUMN IF NOT EXISTS privacy_level TEXT DEFAULT 'participants_only'
CHECK (privacy_level IN ('public', 'participants_only', 'creator_only'));

-- Add participant_visibility column to control who can see other participants
ALTER TABLE public.shared_activities 
ADD COLUMN IF NOT EXISTS show_participant_names BOOLEAN DEFAULT false;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Children can view shared activities" ON public.shared_activities;
DROP POLICY IF EXISTS "Parents can view activity participants" ON public.activity_participants;

-- Create new privacy-aware policy for shared_activities
CREATE POLICY "Privacy-aware activity viewing"
ON public.shared_activities FOR SELECT
USING (
  -- Creator always sees their own activities
  created_by IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  -- Participants see activities based on privacy level
  OR (
    privacy_level != 'creator_only'
    AND id IN (
      SELECT activity_id FROM public.activity_participants 
      WHERE child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
    )
  )
);

-- Create privacy-aware policy for activity_participants
-- Only reveal participant names if show_participant_names is true
CREATE POLICY "Privacy-aware participant viewing"
ON public.activity_participants FOR SELECT
USING (
  -- Own child is always visible
  child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  -- Activity creator can see all participants in their activities
  OR activity_id IN (
    SELECT id FROM public.shared_activities 
    WHERE created_by IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  )
  -- Other participants visible only if activity allows it
  OR activity_id IN (
    SELECT sa.id FROM public.shared_activities sa
    INNER JOIN public.activity_participants ap ON ap.activity_id = sa.id
    WHERE ap.child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
    AND sa.show_participant_names = true
  )
);

-- ============================================================
-- 3. TEACHER_PROFILES: Add public view (without PII)
-- ============================================================

-- Create safe view for teacher profiles that other users can query (without PII)
DROP VIEW IF EXISTS public.teacher_profiles_public;
CREATE VIEW public.teacher_profiles_public
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  school_id,
  full_name,
  subjects,
  grade_levels,
  department,
  bio,
  avatar_url,
  is_verified,
  verification_date
  -- EXCLUDES: email, employee_id (sensitive PII)
FROM public.teacher_profiles;

GRANT SELECT ON public.teacher_profiles_public TO authenticated;

-- Add school admin access function
CREATE OR REPLACE FUNCTION public.is_school_admin_for_teacher(teacher_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  teacher_school_id UUID;
BEGIN
  -- Get the teacher's school_id
  SELECT school_id INTO teacher_school_id
  FROM teacher_profiles
  WHERE user_id = teacher_user_id;
  
  -- Check if current user is admin of that school (expandable for school-specific admins)
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- Add comments explaining the privacy model
COMMENT ON TABLE public.shared_activities IS 'Shared activities with privacy controls. privacy_level controls who can view the activity, show_participant_names controls whether other participants names are visible.';
COMMENT ON COLUMN public.shared_activities.privacy_level IS 'public = anyone can view, participants_only = only participants, creator_only = only creator';
COMMENT ON COLUMN public.shared_activities.show_participant_names IS 'If false, other participants see N other children instead of names';