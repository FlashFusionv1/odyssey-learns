-- Create function to add admin role to a user
CREATE OR REPLACE FUNCTION public.add_admin_role(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO _user_id
  FROM auth.users
  WHERE email = _email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _email;
  END IF;
  
  -- Insert admin role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users (so we can call it from edge function)
GRANT EXECUTE ON FUNCTION public.add_admin_role(text) TO authenticated;

COMMENT ON FUNCTION public.add_admin_role IS 'Adds admin role to a user by email. For initial setup only.';