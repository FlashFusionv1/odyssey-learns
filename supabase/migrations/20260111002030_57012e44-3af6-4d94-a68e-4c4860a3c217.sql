-- 1. Fix profiles RLS - ensure RESTRICTIVE policy blocks cross-user access
-- Drop existing permissive policy and replace with restrictive
DROP POLICY IF EXISTS "Users can view own profile only" ON profiles;

-- Create RESTRICTIVE policy that ensures ONLY own profile can be viewed
CREATE POLICY "Users can ONLY view own profile"
ON profiles
AS RESTRICTIVE
FOR SELECT
USING (id = auth.uid());

-- 2. For emotion_logs - clear existing plaintext sensitive data 
-- and ensure only encrypted columns are used going forward
-- First, null out any existing plaintext sensitive data
UPDATE emotion_logs
SET 
  trigger = NULL,
  coping_strategy = NULL,
  reflection_notes = NULL
WHERE trigger IS NOT NULL 
   OR coping_strategy IS NOT NULL 
   OR reflection_notes IS NOT NULL;

-- 3. Add a check constraint to prevent future plaintext storage
-- (using a function to validate on insert/update)
CREATE OR REPLACE FUNCTION check_emotion_encryption()
RETURNS TRIGGER AS $$
BEGIN
  -- Block any attempt to store plaintext sensitive data
  IF NEW.trigger IS NOT NULL OR NEW.coping_strategy IS NOT NULL OR NEW.reflection_notes IS NOT NULL THEN
    RAISE EXCEPTION 'Plaintext sensitive data not allowed. Use encrypted columns (trigger_encrypted, coping_strategy_encrypted, reflection_notes_encrypted)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS enforce_emotion_encryption ON emotion_logs;

CREATE TRIGGER enforce_emotion_encryption
BEFORE INSERT OR UPDATE ON emotion_logs
FOR EACH ROW
EXECUTE FUNCTION check_emotion_encryption();