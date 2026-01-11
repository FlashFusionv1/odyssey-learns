-- Fix the overloaded function that's missing search_path
CREATE OR REPLACE FUNCTION public.get_active_recommendations(p_child_id uuid, p_limit integer DEFAULT 5)
 RETURNS TABLE(id uuid, lesson_id uuid, lesson_title text, lesson_subject text, reason text, reason_explanation text, priority integer, predicted_score numeric, predicted_time_minutes integer, predicted_difficulty text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    lr.id,
    lr.lesson_id,
    l.title as lesson_title,
    l.subject as lesson_subject,
    lr.reason,
    lr.reason_explanation,
    lr.priority,
    lr.predicted_score,
    lr.predicted_time_minutes,
    lr.predicted_difficulty,
    lr.created_at
  FROM lesson_recommendations lr
  JOIN lessons l ON l.id = lr.lesson_id
  WHERE lr.child_id = p_child_id
    AND lr.dismissed_at IS NULL
    AND lr.completed_at IS NULL
    AND lr.expires_at > NOW()
    AND l.is_active = true
  ORDER BY lr.priority DESC, lr.created_at DESC
  LIMIT p_limit;
END;
$function$;