-- Strengthen profiles table RLS policies to prevent UUID enumeration attacks
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate with RESTRICTIVE policies for defense in depth

-- 1. Base policy: Must be authenticated (RESTRICTIVE - applies to all operations)
CREATE POLICY "Deny anonymous access to profiles"
ON profiles AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- 2. Users can only view their own profile (strict ownership check)
CREATE POLICY "Users can view own profile only"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 3. Users can only update their own profile (strict ownership check)
CREATE POLICY "Users can update own profile only"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. Users can only insert their own profile (strict ownership check)
CREATE POLICY "Users can insert own profile only"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 5. Admins can view all profiles (uses internal function to prevent bypass)
-- This policy is additive with the user's own profile policy
CREATE POLICY "Verified admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  -- Use internal_is_admin which has SET search_path for security
  internal_is_admin(auth.uid())
);

-- 6. Prevent any DELETE operations (profiles should never be deleted directly)
-- No DELETE policy means DELETE is denied by default with RLS enabled

-- Add comment for documentation
COMMENT ON TABLE profiles IS 'User profiles with strict RLS: users can only access their own profile, admins can view all. No enumeration possible - querying other UUIDs returns empty results.';