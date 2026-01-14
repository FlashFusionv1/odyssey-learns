
-- ============================================================
-- SECURITY HARDENING: Drop emotion_logs plaintext columns
-- ============================================================

-- Nullify any remaining plaintext data first
UPDATE emotion_logs SET 
  trigger = NULL,
  coping_strategy = NULL,
  reflection_notes = NULL
WHERE trigger IS NOT NULL 
   OR coping_strategy IS NOT NULL 
   OR reflection_notes IS NOT NULL;

-- Drop the plaintext columns permanently
ALTER TABLE emotion_logs 
  DROP COLUMN IF EXISTS trigger,
  DROP COLUMN IF EXISTS coping_strategy,
  DROP COLUMN IF EXISTS reflection_notes;
