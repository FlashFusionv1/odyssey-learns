-- Fix security: Explicitly deny anonymous access to children table
CREATE POLICY "Deny anonymous access to children"
ON children
FOR SELECT
USING (auth.role() = 'authenticated');

-- Add standards alignment and differentiation support to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS standards_alignment text,
ADD COLUMN IF NOT EXISTS differentiation jsonb DEFAULT '{"support": "", "extension": ""}'::jsonb;

-- Update lessons for 3rd grade structure
COMMENT ON COLUMN lessons.standards_alignment IS 'Common Core or state standards code (e.g., 3.NBT.A.2)';
COMMENT ON COLUMN lessons.differentiation IS 'JSON with support and extension strategies for differentiated instruction';