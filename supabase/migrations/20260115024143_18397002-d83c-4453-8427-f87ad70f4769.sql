-- Add server-side SVG validation constraints to room_decorations table (defense in depth)
-- This prevents malicious SVG data even if client-side sanitization is bypassed

-- First, drop existing constraints if they exist (to make migration idempotent)
ALTER TABLE room_decorations DROP CONSTRAINT IF EXISTS valid_svg_format;
ALTER TABLE room_decorations DROP CONSTRAINT IF EXISTS no_script_tags;

-- Add CHECK constraint to ensure SVG format (starts with <svg and ends with </svg>)
ALTER TABLE room_decorations 
ADD CONSTRAINT valid_svg_format 
CHECK (svg_data ~ '^\s*<svg[^>]*>.*</svg>\s*$');

-- Add CHECK constraint to block dangerous content:
-- - <script> tags
-- - <iframe> tags
-- - Event handlers like onclick=, onload=, etc.
-- - javascript: protocol
-- - data: protocol in hrefs
ALTER TABLE room_decorations 
ADD CONSTRAINT no_malicious_svg_content 
CHECK (
  svg_data !~* '<script' AND
  svg_data !~* '<iframe' AND
  svg_data !~* '\bon[a-z]+\s*=' AND
  svg_data !~* 'javascript\s*:' AND
  svg_data !~* 'data\s*:\s*text/html'
);

-- Add comment for documentation
COMMENT ON CONSTRAINT valid_svg_format ON room_decorations IS 'Ensures SVG data has proper SVG root element';
COMMENT ON CONSTRAINT no_malicious_svg_content ON room_decorations IS 'Blocks script/iframe tags, event handlers, and dangerous protocols (XSS prevention)';