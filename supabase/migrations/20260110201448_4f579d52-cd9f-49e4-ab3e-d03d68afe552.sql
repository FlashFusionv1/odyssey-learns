-- =====================================================
-- SECURITY FIX: Restrict profiles and children RLS policies
-- Addresses: profiles_table_public_exposure, children_table_public_exposure
-- =====================================================

-- 1. Remove overly permissive admin SELECT policy on profiles table
DROP POLICY IF EXISTS "Verified admins can view all profiles" ON profiles;

-- 2. Remove overly permissive admin policies on children table
DROP POLICY IF EXISTS "Admins can view all children" ON children;
DROP POLICY IF EXISTS "Admins can manage all children" ON children;

-- 3. Create a secure view for children that NEVER exposes pin_hash
-- This view should be used by admins instead of direct table access
DROP VIEW IF EXISTS public.children_safe;
CREATE VIEW public.children_safe AS
SELECT 
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
  -- DELIBERATELY EXCLUDING: pin_hash
FROM children;

-- Grant access to the safe view
GRANT SELECT ON public.children_safe TO authenticated;

-- 4. Create restricted admin policy for children
-- Admins can only access via RPC functions for specific operations, not bulk SELECT
-- This ensures audit logging and prevents mass data extraction
CREATE POLICY "Admins can manage children via audit"
ON children FOR ALL
USING (
  -- Only allow admin access when called from specific audited functions
  has_role(auth.uid(), 'admin'::app_role) 
  AND (
    -- Parent of the child (normal access)
    parent_id = auth.uid()
    OR
    -- Accessing from an audited context (set by edge function)
    current_setting('app.admin_audit_context', true) = 'verified'
  )
);

-- 5. Create audit function for admin child access
CREATE OR REPLACE FUNCTION audit_admin_child_access(
  target_child_id UUID,
  access_reason TEXT
)
RETURNS SETOF children_safe
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Verify admin role
  admin_id := auth.uid();
  IF NOT has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log the access
  INSERT INTO data_access_audit (
    user_id,
    access_type,
    accessed_table,
    accessed_record_id,
    access_count
  ) VALUES (
    admin_id,
    'admin_child_view:' || COALESCE(access_reason, 'unspecified'),
    'children',
    target_child_id::text,
    1
  );
  
  -- Return the child data (safe view, no pin_hash)
  RETURN QUERY
  SELECT * FROM children_safe WHERE id = target_child_id;
END;
$$;

-- 6. Create audit function for admin profile access
CREATE OR REPLACE FUNCTION audit_admin_profile_access(
  target_user_id UUID,
  access_reason TEXT
)
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Verify admin role
  admin_id := auth.uid();
  IF NOT has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log the access
  INSERT INTO data_access_audit (
    user_id,
    access_type,
    accessed_table,
    accessed_record_id,
    access_count
  ) VALUES (
    admin_id,
    'admin_profile_view:' || COALESCE(access_reason, 'unspecified'),
    'profiles',
    target_user_id::text,
    1
  );
  
  -- Return the profile data
  RETURN QUERY
  SELECT * FROM profiles WHERE id = target_user_id;
END;
$$;