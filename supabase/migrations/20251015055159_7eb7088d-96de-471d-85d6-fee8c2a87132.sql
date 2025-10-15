-- ============================================================================
-- COMPLETE ROLE MANAGEMENT SYSTEM
-- Phases 1-5: Cleanup, Management, Hierarchy, Audit Logging, Expiration
-- ============================================================================

-- PHASE 1: Clean Up Dual Role Storage
-- Remove role column from profiles (single source of truth: user_roles)
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Update handle_new_user() to only write to user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert into profiles (no role column)
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Parent')
  );
  
  -- Insert into user_roles table for proper role management
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'parent');
  
  RETURN NEW;
END;
$function$;

-- PHASE 2: Role Management Policies
-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Drop existing policies on user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;

-- Recreate SELECT policy
CREATE POLICY "Users can view own roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Add role management policies for admins
CREATE POLICY "Admins can assign roles"
ON user_roles FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can revoke roles"
ON user_roles FOR DELETE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
ON user_roles FOR UPDATE
USING (public.is_admin(auth.uid()));

-- PHASE 3: Role Hierarchy Support
-- Create hierarchical permission checking function
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _required_role app_role
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id
    AND (
      role = _required_role
      OR (role = 'admin' AND _required_role != 'admin')
      OR (role = 'moderator' AND _required_role = 'parent')
    )
  )
$$;

-- Update children table policies to support hierarchy
DROP POLICY IF EXISTS "Parents can SELECT own children" ON children;
DROP POLICY IF EXISTS "Parents can manage own children" ON children;
DROP POLICY IF EXISTS "Parents can view own children" ON children;

CREATE POLICY "Parents and admins can view children"
ON children FOR SELECT
USING (
  auth.uid() = parent_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Parents and admins can insert children"
ON children FOR INSERT
WITH CHECK (
  auth.uid() = parent_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Parents and admins can update children"
ON children FOR UPDATE
USING (
  auth.uid() = parent_id
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = parent_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Parents and admins can delete children"
ON children FOR DELETE
USING (
  auth.uid() = parent_id
  OR public.has_role(auth.uid(), 'admin')
);

-- PHASE 4: Audit Logging
-- Create audit log table
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('assigned', 'revoked', 'updated')),
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT,
  previous_value TEXT,
  new_value TEXT
);

ALTER TABLE role_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
ON role_audit_log FOR SELECT
USING (public.is_admin(auth.uid()));

-- Create audit logging trigger function
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO role_audit_log (user_id, role, action, performed_by)
    VALUES (NEW.user_id, NEW.role, 'assigned', auth.uid());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO role_audit_log (user_id, role, action, performed_by)
    VALUES (OLD.user_id, OLD.role, 'revoked', auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO role_audit_log (
      user_id, role, action, performed_by, 
      previous_value, new_value
    )
    VALUES (
      NEW.user_id, NEW.role, 'updated', auth.uid(),
      OLD.role::text, NEW.role::text
    );
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger on user_roles
DROP TRIGGER IF EXISTS role_change_audit ON user_roles;
CREATE TRIGGER role_change_audit
AFTER INSERT OR DELETE OR UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION log_role_change();

-- PHASE 5: Role Expiration Support
-- Add expiration column to user_roles
ALTER TABLE user_roles
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;

-- Update has_role() to check expiration
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Add index for expired role cleanup
CREATE INDEX IF NOT EXISTS idx_user_roles_expiration 
ON user_roles(expires_at) 
WHERE expires_at IS NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON role_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON role_audit_log(performed_by);

-- Verification query
SELECT 
  'user_roles policies' as category,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'user_roles'
UNION ALL
SELECT 
  'children policies' as category,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'children'
UNION ALL
SELECT 
  'audit_log policies' as category,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'role_audit_log'
ORDER BY category, operation;