-- Fix function search_path for security
CREATE OR REPLACE FUNCTION check_emotion_encryption()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Block any attempt to store plaintext sensitive data
  IF NEW.trigger IS NOT NULL OR NEW.coping_strategy IS NOT NULL OR NEW.reflection_notes IS NOT NULL THEN
    RAISE EXCEPTION 'Plaintext sensitive data not allowed. Use encrypted columns (trigger_encrypted, coping_strategy_encrypted, reflection_notes_encrypted)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;