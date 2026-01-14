-- =============================================================================
-- COMPREHENSIVE SECURITY FIX: Functions, RLS policies, and table access
-- =============================================================================

-- =============================================================================
-- 1. FIX FUNCTIONS MISSING search_path
-- =============================================================================

-- Fix get_active_recommendations - add SET search_path
CREATE OR REPLACE FUNCTION public.get_active_recommendations(p_child_id uuid)
RETURNS TABLE(
  id uuid,
  lesson_id uuid,
  title text,
  subject text,
  reason text,
  confidence_score numeric,
  priority integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lr.id,
    lr.lesson_id,
    l.title,
    l.subject,
    lr.reason,
    lr.confidence_score,
    lr.priority
  FROM lesson_recommendations lr
  JOIN lessons l ON lr.lesson_id = l.id
  WHERE lr.child_id = p_child_id
    AND lr.is_dismissed = false
    AND (lr.expires_at IS NULL OR lr.expires_at > NOW())
  ORDER BY lr.priority DESC, lr.confidence_score DESC
  LIMIT 10;
END;
$$;

-- Fix update_video_watch_progress_updated_at - add SET search_path
CREATE OR REPLACE FUNCTION public.update_video_watch_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 2. FIX room_decorations - Restrict to authenticated users only
-- =============================================================================

DROP POLICY IF EXISTS "view_decorations" ON room_decorations;

CREATE POLICY "Authenticated users can view decorations"
ON room_decorations FOR SELECT
TO authenticated
USING (true);

-- =============================================================================
-- 3. FIX power_ups - Restrict to authenticated users only  
-- =============================================================================

DROP POLICY IF EXISTS "Anyone can view power-ups" ON power_ups;

CREATE POLICY "Authenticated users can view power-ups"
ON power_ups FOR SELECT
TO authenticated
USING (is_active = true);

-- =============================================================================
-- 4. FIX interactive_content - Restrict to authenticated users only
-- =============================================================================

DROP POLICY IF EXISTS "Anyone can view active interactive content" ON interactive_content;

CREATE POLICY "Authenticated users can view active content"
ON interactive_content FOR SELECT
TO authenticated
USING (is_active = true);

-- =============================================================================
-- 5. STRENGTHEN emotion_logs RLS
-- =============================================================================

DROP POLICY IF EXISTS "Parents can create children emotion logs" ON emotion_logs;

CREATE POLICY "Parents can create children emotion logs"
ON emotion_logs FOR INSERT
TO authenticated
WITH CHECK (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

-- Add RESTRICTIVE base policy for emotion_logs
DROP POLICY IF EXISTS "Require authentication for emotion logs" ON emotion_logs;

CREATE POLICY "Require authentication for emotion logs"
ON emotion_logs AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- 6. Add security documentation comments
-- =============================================================================

COMMENT ON TABLE room_decorations IS 'Virtual room decoration items. Access restricted to authenticated users only.';
COMMENT ON TABLE power_ups IS 'In-game power-up items. Access restricted to authenticated users only.';
COMMENT ON TABLE interactive_content IS 'Educational interactive content. Access restricted to authenticated users only.';
COMMENT ON TABLE emotion_logs IS 'Child emotion check-in data with field-level encryption. 90-day retention via RLS.';
COMMENT ON TABLE children IS 'Child profiles with strict parent-only access. PIN hashes secured, use children_safe view for queries.';