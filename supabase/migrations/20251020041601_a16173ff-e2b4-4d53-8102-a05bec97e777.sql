-- Security Enhancement: Refactor admin check to prevent information disclosure
-- Remove user_id parameter to ensure only current user's admin status can be checked

-- First, drop policies that depend on is_admin()
DROP POLICY IF EXISTS "Admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can revoke roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view audit log" ON public.role_audit_log;

-- Now we can drop the old function
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Create new function that only checks the current authenticated user
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

COMMENT ON FUNCTION public.is_current_user_admin() IS 
'Checks if the currently authenticated user has admin role. Returns false for unauthenticated users. Does not accept parameters to prevent information disclosure attacks.';

-- Keep the parameterized version for internal use only (renamed for clarity)
CREATE OR REPLACE FUNCTION public.internal_is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
$$;

COMMENT ON FUNCTION public.internal_is_admin(uuid) IS 
'INTERNAL USE ONLY: Checks admin status for any user ID. Should only be called from SECURITY DEFINER functions, not client code.';

-- Recreate the policies using the new function
CREATE POLICY "Admins can assign roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Admins can revoke roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can view audit log"
  ON public.role_audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());