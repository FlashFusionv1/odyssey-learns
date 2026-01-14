-- ========================================
-- SECURITY FIX: Three Table/View Access Controls
-- ========================================

-- 1. FIX SCHOOLS TABLE: Remove public SELECT and ensure only teachers/admins can access
-- Drop existing permissive policies and replace with restrictive ones

DROP POLICY IF EXISTS "Teachers can read their school" ON public.schools;
DROP POLICY IF EXISTS "Admins can manage schools" ON public.schools;

-- Create restrictive policies (correct syntax: AS RESTRICTIVE comes after FOR command)
CREATE POLICY "Only teachers can view their school" 
ON public.schools 
AS RESTRICTIVE
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT school_id FROM public.teacher_profiles 
    WHERE user_id = auth.uid()
  )
  OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can insert schools" 
ON public.schools 
AS RESTRICTIVE
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update schools" 
ON public.schools 
AS RESTRICTIVE
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete schools" 
ON public.schools 
AS RESTRICTIVE
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Block anonymous access to schools entirely
CREATE POLICY "Block anon from schools" 
ON public.schools 
AS RESTRICTIVE
FOR ALL 
TO anon
USING (false);

-- 2. FIX PROFILES TABLE: Ensure restrictive SELECT only returns own profile
-- The existing policies should work but let's verify and add explicit anon block

DROP POLICY IF EXISTS "Block anon role from profiles" ON public.profiles;

-- Recreate with proper restrictive behavior for anon role
CREATE POLICY "Block anon role from profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- 3. FIX CHILDREN_SAFE VIEW: Recreate with security_invoker = true
-- This ensures the view respects RLS policies of underlying children table

-- First check if the view exists with old settings and recreate
DROP VIEW IF EXISTS public.children_safe CASCADE;

CREATE VIEW public.children_safe
WITH (security_invoker = true)
AS SELECT 
    id,
    parent_id,
    name,
    grade_level,
    avatar_config,
    total_points,
    daily_screen_time_limit_minutes,
    screen_time_enabled,
    weekly_report_enabled,
    challenge_mode_enabled,
    quest_bonus_points,
    daily_quest_id,
    quest_completed_at,
    created_at,
    deleted_at,
    deletion_reason,
    deletion_scheduled_at
FROM public.children;

-- Grant appropriate access
GRANT SELECT ON public.children_safe TO authenticated;
REVOKE ALL ON public.children_safe FROM anon;

-- Recreate the audit function that was dropped with CASCADE
CREATE OR REPLACE FUNCTION public.audit_admin_child_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    INSERT INTO public.data_access_audit (
      user_id,
      accessed_table,
      access_type,
      accessed_record_id
    ) VALUES (
      auth.uid(),
      'children_safe',
      TG_OP,
      CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END
    );
  END IF;
  RETURN NEW;
END;
$$;