
-- Migration: Fix search_path security warnings
-- Date: 2025-01-16
-- Purpose: Add SET search_path TO 'public' to 4 functions missing this security setting
-- Affected functions: auto_assign_pending_reviews, calculate_creator_level, calculate_engagement_score, update_updated_at_column

-- Function 1: auto_assign_pending_reviews
-- Add search_path to SECURITY DEFINER function to prevent search_path hijacking
CREATE OR REPLACE FUNCTION public.auto_assign_pending_reviews()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_pending_reviews UUID[];
  v_reviewers UUID[];
  v_reviewer_index INTEGER := 0;
  v_assigned_count INTEGER := 0;
  v_current_review UUID;
  v_current_reviewer UUID;
BEGIN
  -- Get pending reviews ordered by priority
  SELECT ARRAY_AGG(id ORDER BY 
    CASE priority 
      WHEN 'urgent' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'normal' THEN 3 
      ELSE 4 
    END, 
    assigned_at ASC
  ) INTO v_pending_reviews
  FROM lesson_reviews
  WHERE status = 'pending' AND reviewer_id IS NULL;
  
  -- Get active reviewers ordered by workload (least reviews assigned)
  SELECT ARRAY_AGG(reviewer_id ORDER BY total_reviews ASC)
  INTO v_reviewers
  FROM reviewer_performance
  WHERE total_reviews < 20; -- Cap at 20 active reviews per reviewer
  
  -- If no reviewers available, return error
  IF v_reviewers IS NULL OR array_length(v_reviewers, 1) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No reviewers available',
      'assigned_count', 0
    );
  END IF;
  
  -- Round-robin assignment
  FOREACH v_current_review IN ARRAY v_pending_reviews LOOP
    v_current_reviewer := v_reviewers[(v_reviewer_index % array_length(v_reviewers, 1)) + 1];
    
    UPDATE lesson_reviews
    SET reviewer_id = v_current_reviewer,
        auto_assigned_at = NOW(),
        status = 'in_review'
    WHERE id = v_current_review;
    
    v_assigned_count := v_assigned_count + 1;
    v_reviewer_index := v_reviewer_index + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Reviews assigned successfully',
    'assigned_count', v_assigned_count
  );
END;
$function$;

-- Function 2: calculate_creator_level
-- Add search_path to IMMUTABLE function for security consistency
CREATE OR REPLACE FUNCTION public.calculate_creator_level(p_points integer)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_points >= 5000 THEN
    RETURN 4;
  ELSIF p_points >= 1500 THEN
    RETURN 3;
  ELSIF p_points >= 500 THEN
    RETURN 2;
  ELSE
    RETURN 1;
  END IF;
END;
$function$;

-- Function 3: calculate_engagement_score
-- Add search_path to IMMUTABLE function for security consistency
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(p_views integer, p_saves integer, p_shares integer, p_unique_viewers integer)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_unique_viewers = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ((p_views + (p_saves * 2) + (p_shares * 3))::NUMERIC / p_unique_viewers::NUMERIC);
END;
$function$;

-- Function 4: update_updated_at_column
-- Add search_path to trigger function to prevent search_path hijacking
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Verification: These functions should no longer appear in linter warnings
-- Run: SELECT * FROM pg_proc WHERE proname IN ('auto_assign_pending_reviews', 'calculate_creator_level', 'calculate_engagement_score', 'update_updated_at_column');
