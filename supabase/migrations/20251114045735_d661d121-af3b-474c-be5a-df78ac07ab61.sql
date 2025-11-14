-- ========================================
-- LESSON SHARING APPROVAL FLOW SCHEMA
-- ========================================

-- Add approval tracking columns to child_generated_lessons
ALTER TABLE child_generated_lessons 
ADD COLUMN IF NOT EXISTS parent_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS parent_approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for efficient filtering of pending approvals
CREATE INDEX IF NOT EXISTS idx_child_generated_lessons_pending 
ON child_generated_lessons(share_status, created_at DESC) 
WHERE share_status = 'pending_approval';

-- ========================================
-- LESSON ANALYTICS SCHEMA
-- ========================================

CREATE TABLE IF NOT EXISTS lesson_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES child_generated_lessons(id) ON DELETE CASCADE,
  total_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  avg_time_seconds INTEGER DEFAULT 0,
  engagement_score NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id)
);

-- Analytics events tracking
CREATE TABLE IF NOT EXISTS lesson_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES child_generated_lessons(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'save', 'share')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_lesson_analytics_lesson 
ON lesson_analytics(lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_analytics_events_lesson 
ON lesson_analytics_events(lesson_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_analytics_events_child 
ON lesson_analytics_events(child_id, created_at DESC);

-- ========================================
-- CREATOR REWARDS SCHEMA
-- ========================================

CREATE TABLE IF NOT EXISTS creator_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_reward_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  lesson_id UUID REFERENCES child_generated_lessons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rewards
CREATE INDEX IF NOT EXISTS idx_creator_rewards_child 
ON creator_rewards(child_id);

CREATE INDEX IF NOT EXISTS idx_creator_rewards_leaderboard 
ON creator_rewards(total_points DESC, level DESC);

CREATE INDEX IF NOT EXISTS idx_creator_reward_history_child 
ON creator_reward_history(child_id, created_at DESC);

-- ========================================
-- FUNCTIONS FOR ANALYTICS
-- ========================================

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  p_views INTEGER,
  p_saves INTEGER,
  p_shares INTEGER,
  p_unique_viewers INTEGER
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_unique_viewers = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ((p_views + (p_saves * 2) + (p_shares * 3))::NUMERIC / p_unique_viewers::NUMERIC);
END;
$$;

-- Function to update analytics
CREATE OR REPLACE FUNCTION update_lesson_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_views INTEGER;
  v_unique_viewers INTEGER;
  v_total_saves INTEGER;
  v_total_shares INTEGER;
  v_engagement NUMERIC;
BEGIN
  -- Count events
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'view'),
    COUNT(DISTINCT child_id) FILTER (WHERE event_type = 'view'),
    COUNT(*) FILTER (WHERE event_type = 'save'),
    COUNT(*) FILTER (WHERE event_type = 'share')
  INTO v_total_views, v_unique_viewers, v_total_saves, v_total_shares
  FROM lesson_analytics_events
  WHERE lesson_id = NEW.lesson_id;
  
  -- Calculate engagement
  v_engagement := calculate_engagement_score(
    v_total_views, 
    v_total_saves, 
    v_total_shares, 
    v_unique_viewers
  );
  
  -- Upsert analytics
  INSERT INTO lesson_analytics (
    lesson_id, 
    total_views, 
    unique_viewers, 
    total_saves, 
    total_shares, 
    engagement_score,
    updated_at
  ) VALUES (
    NEW.lesson_id,
    v_total_views,
    v_unique_viewers,
    v_total_saves,
    v_total_shares,
    v_engagement,
    NOW()
  )
  ON CONFLICT (lesson_id) DO UPDATE SET
    total_views = v_total_views,
    unique_viewers = v_unique_viewers,
    total_saves = v_total_saves,
    total_shares = v_total_shares,
    engagement_score = v_engagement,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-update analytics
CREATE TRIGGER trigger_update_lesson_analytics
AFTER INSERT ON lesson_analytics_events
FOR EACH ROW
EXECUTE FUNCTION update_lesson_analytics();

-- ========================================
-- FUNCTIONS FOR CREATOR REWARDS
-- ========================================

-- Function to calculate level from points
CREATE OR REPLACE FUNCTION calculate_creator_level(p_points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;

-- Function to award points
CREATE OR REPLACE FUNCTION award_creator_points(
  p_child_id UUID,
  p_points INTEGER,
  p_reason TEXT,
  p_lesson_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_total INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
  v_new_badges TEXT[];
BEGIN
  -- Initialize creator rewards if not exists
  INSERT INTO creator_rewards (child_id, total_points, level)
  VALUES (p_child_id, 0, 1)
  ON CONFLICT (child_id) DO NOTHING;
  
  -- Get current level
  SELECT level INTO v_old_level
  FROM creator_rewards
  WHERE child_id = p_child_id;
  
  -- Update points
  UPDATE creator_rewards
  SET total_points = total_points + p_points,
      updated_at = NOW()
  WHERE child_id = p_child_id
  RETURNING total_points INTO v_new_total;
  
  -- Calculate new level
  v_new_level := calculate_creator_level(v_new_total);
  
  -- Update level and check for badges
  UPDATE creator_rewards
  SET level = v_new_level
  WHERE child_id = p_child_id;
  
  -- Award badges based on milestones
  IF v_new_level = 2 AND v_old_level < 2 THEN
    UPDATE creator_rewards
    SET badges = array_append(badges, 'Rising Creator')
    WHERE child_id = p_child_id AND NOT ('Rising Creator' = ANY(badges));
  END IF;
  
  IF v_new_level = 3 AND v_old_level < 3 THEN
    UPDATE creator_rewards
    SET badges = array_append(badges, 'Top Educator')
    WHERE child_id = p_child_id AND NOT ('Top Educator' = ANY(badges));
  END IF;
  
  IF v_new_level = 4 AND v_old_level < 4 THEN
    UPDATE creator_rewards
    SET badges = array_append(badges, 'Master Instructor')
    WHERE child_id = p_child_id AND NOT ('Master Instructor' = ANY(badges));
  END IF;
  
  -- Log the reward
  INSERT INTO creator_reward_history (child_id, points_change, reason, lesson_id)
  VALUES (p_child_id, p_points, p_reason, p_lesson_id);
END;
$$;

-- Trigger to award points when lesson is approved
CREATE OR REPLACE FUNCTION trigger_award_approval_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.share_status = 'public' AND OLD.share_status = 'pending_approval' THEN
    PERFORM award_creator_points(
      NEW.creator_child_id,
      10,
      'Lesson approved for public sharing',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_lesson_approval_rewards
AFTER UPDATE ON child_generated_lessons
FOR EACH ROW
WHEN (NEW.share_status = 'public' AND OLD.share_status = 'pending_approval')
EXECUTE FUNCTION trigger_award_approval_points();

-- Trigger to award points on analytics events
CREATE OR REPLACE FUNCTION trigger_award_analytics_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_creator_id UUID;
  v_points INTEGER;
  v_reason TEXT;
BEGIN
  -- Get lesson creator
  SELECT creator_child_id INTO v_creator_id
  FROM child_generated_lessons
  WHERE id = NEW.lesson_id;
  
  -- Determine points and reason
  IF NEW.event_type = 'view' THEN
    v_points := 1;
    v_reason := 'Lesson viewed';
  ELSIF NEW.event_type = 'save' THEN
    v_points := 3;
    v_reason := 'Lesson saved';
  ELSIF NEW.event_type = 'share' THEN
    v_points := 5;
    v_reason := 'Lesson shared';
  END IF;
  
  -- Award points
  IF v_creator_id IS NOT NULL THEN
    PERFORM award_creator_points(v_creator_id, v_points, v_reason, NEW.lesson_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_analytics_rewards
AFTER INSERT ON lesson_analytics_events
FOR EACH ROW
EXECUTE FUNCTION trigger_award_analytics_points();

-- ========================================
-- RLS POLICIES
-- ========================================

-- Analytics RLS
ALTER TABLE lesson_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own lesson analytics"
ON lesson_analytics FOR SELECT
USING (
  lesson_id IN (
    SELECT id FROM child_generated_lessons 
    WHERE creator_child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  )
);

-- Analytics events RLS
ALTER TABLE lesson_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can track analytics"
ON lesson_analytics_events FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can view their lesson analytics events"
ON lesson_analytics_events FOR SELECT
USING (
  lesson_id IN (
    SELECT id FROM child_generated_lessons 
    WHERE creator_child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  )
);

-- Creator rewards RLS
ALTER TABLE creator_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children's rewards"
ON creator_rewards FOR SELECT
USING (
  child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  )
);

CREATE POLICY "Public leaderboard access"
ON creator_rewards FOR SELECT
USING (true);

-- Reward history RLS
ALTER TABLE creator_reward_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children's reward history"
ON creator_reward_history FOR SELECT
USING (
  child_id IN (
    SELECT id FROM children WHERE parent_id = auth.uid()
  )
);