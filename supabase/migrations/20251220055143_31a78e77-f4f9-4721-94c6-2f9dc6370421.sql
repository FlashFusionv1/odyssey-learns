
-- Fix profiles table: Drop and recreate admin policy with correct role
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop the restrictive policy and recreate as proper deny for anonymous
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Recreate users can view own profile to only allow authenticated users
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Fix insert policy to be authenticated only
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Fix update policy to be authenticated only  
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify emotion_logs doesn't have public role policies - update to authenticated only
DROP POLICY IF EXISTS "Admins can view all emotion logs" ON public.emotion_logs;

CREATE POLICY "Admins can view all emotion logs" 
ON public.emotion_logs 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Parents can view recent emotion logs only" ON public.emotion_logs;

CREATE POLICY "Parents can view recent emotion logs only" 
ON public.emotion_logs 
FOR SELECT 
TO authenticated
USING (
  (child_id IN (SELECT children.id FROM children WHERE children.parent_id = auth.uid()))
  AND (logged_at > (now() - '90 days'::interval))
);

DROP POLICY IF EXISTS "Parents can create children emotion logs" ON public.emotion_logs;

CREATE POLICY "Parents can create children emotion logs" 
ON public.emotion_logs 
FOR INSERT 
TO authenticated
WITH CHECK (child_id IN (SELECT children.id FROM children WHERE children.parent_id = auth.uid()));
