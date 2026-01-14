
-- Fix children_safe to use security_invoker instead of security_barrier
-- First drop the dependent function
DROP FUNCTION IF EXISTS audit_admin_child_access(uuid, text);

-- Recreate children_safe with security_invoker
DROP VIEW IF EXISTS children_safe;
CREATE VIEW children_safe 
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
  admin_id := auth.uid();
  IF NOT has_role(admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
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
  
  RETURN QUERY
  SELECT * FROM children_safe WHERE id = target_child_id;
END;
$function$;

GRANT SELECT ON children_safe TO authenticated;
COMMENT ON VIEW children_safe IS 'Secure view of children table excluding pin_hash. Uses security_invoker to respect calling users RLS policies.';
