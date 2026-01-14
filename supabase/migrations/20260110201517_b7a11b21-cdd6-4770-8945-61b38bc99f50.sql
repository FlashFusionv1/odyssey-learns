-- =====================================================
-- FIX: Properly recreate view with SECURITY INVOKER
-- Drop dependent function first, then view, then recreate both
-- =====================================================

-- 1. Drop the dependent function first
DROP FUNCTION IF EXISTS audit_admin_child_access(uuid, text);

-- 2. Now drop the view
DROP VIEW IF EXISTS public.children_safe;

-- 3. Recreate the view with SECURITY INVOKER
CREATE VIEW public.children_safe 
WITH (security_invoker = true)
AS
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

-- 4. Recreate the audit function returning the view type
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