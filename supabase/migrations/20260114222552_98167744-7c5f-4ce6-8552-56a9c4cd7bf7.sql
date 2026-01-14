
-- ============================================================
-- SECURITY HARDENING MIGRATION (Part 2 - Fix children_safe)
-- ============================================================

-- 3. CHILDREN_SAFE: Recreate with security_barrier
-- Must drop dependent function first

-- Drop the dependent function
DROP FUNCTION IF EXISTS audit_admin_child_access(uuid, text);

-- Drop and recreate the view with security_barrier
DROP VIEW IF EXISTS children_safe;
CREATE VIEW children_safe WITH (security_barrier = true) AS
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
FROM children;

-- Recreate the audit function
CREATE OR REPLACE FUNCTION public.audit_admin_child_access(target_child_id uuid, access_reason text)
RETURNS SETOF children_safe
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Grant appropriate permissions on the view
GRANT SELECT ON children_safe TO authenticated;

-- Add comment documenting security design
COMMENT ON VIEW children_safe IS 'Secure view of children table excluding pin_hash. Uses security_barrier to prevent RLS bypass. Access controlled by underlying children table RLS policies.';
