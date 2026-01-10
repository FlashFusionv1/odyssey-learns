-- ============================================
-- PHASE 1: LEARNING PROFILE ENGINE TABLES
-- ============================================

-- 1. Learning Profiles (Core profile for each child)
CREATE TABLE learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  
  -- Core Analysis (stored as JSONB for flexibility)
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  learning_speed TEXT DEFAULT 'medium' CHECK (learning_speed IN ('very_slow', 'slow', 'medium', 'fast', 'very_fast')),
  preferred_subjects TEXT[] DEFAULT '{}',
  avoided_subjects TEXT[] DEFAULT '{}',
  
  -- Performance Metrics
  overall_completion_rate DECIMAL(5,2) DEFAULT 0,
  average_quiz_score DECIMAL(5,2) DEFAULT 0,
  average_session_minutes DECIMAL(5,2) DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  
  -- Behavioral Patterns
  optimal_session_length INTEGER DEFAULT 20,
  best_time_of_day TEXT DEFAULT 'afternoon' CHECK (best_time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  preferred_difficulty TEXT DEFAULT 'intermediate' CHECK (preferred_difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  help_seeking_frequency TEXT DEFAULT 'sometimes' CHECK (help_seeking_frequency IN ('never', 'rarely', 'sometimes', 'often', 'always')),
  
  -- Velocity & Trajectory
  weekly_lesson_velocity DECIMAL(5,2) DEFAULT 0,
  skill_acquisition_rate DECIMAL(5,2) DEFAULT 0,
  improvement_trend TEXT DEFAULT 'stable' CHECK (improvement_trend IN ('declining', 'stable', 'improving', 'accelerating')),
  
  -- Metadata
  profile_version INTEGER DEFAULT 1,
  last_analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  data_points_analyzed INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(child_id)
);

-- 2. Learning Patterns (Detected patterns from analysis)
CREATE TABLE learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('strength', 'weakness', 'preference', 'velocity', 'time_preference', 'session_length')),
  subject TEXT,
  topic TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Skill Mastery (Track mastery per skill)
CREATE TABLE skill_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  skill_category TEXT,
  
  -- Mastery Tracking
  current_level TEXT DEFAULT 'beginner' CHECK (current_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  mastery_percentage DECIMAL(5,2) DEFAULT 0 CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
  practice_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  
  -- Time Tracking
  total_time_spent_minutes INTEGER DEFAULT 0,
  avg_session_minutes DECIMAL(5,2) DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  
  -- Trajectory
  improvement_rate DECIMAL(6,2) DEFAULT 0,
  projected_mastery_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(child_id, subject, skill_name)
);

-- 4. Lesson Recommendations (AI-generated recommendations)
CREATE TABLE lesson_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  
  -- Recommendation Details
  reason TEXT NOT NULL CHECK (reason IN ('remediation', 'challenge', 'interest', 'next_step', 'review', 'exploration')),
  reason_explanation TEXT,
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),
  
  -- Predictions
  predicted_score DECIMAL(5,2),
  predicted_time_minutes INTEGER,
  predicted_difficulty TEXT CHECK (predicted_difficulty IN ('too_easy', 'appropriate', 'challenging', 'too_hard')),
  predicted_engagement TEXT CHECK (predicted_engagement IN ('low', 'medium', 'high')),
  
  -- State
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  dismissed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Feedback (after completion)
  was_helpful BOOLEAN,
  actual_score DECIMAL(5,2),
  actual_time_minutes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(child_id, lesson_id)
);

-- 5. Recommendation Feedback (Track recommendation effectiveness)
CREATE TABLE recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID NOT NULL REFERENCES lesson_recommendations(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  
  -- Feedback Type
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('completed', 'dismissed', 'skipped', 'reported')),
  
  -- Completion Feedback
  was_helpful BOOLEAN,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5),
  
  -- Dismissal Feedback
  dismissal_reason TEXT CHECK (dismissal_reason IN ('not_interested', 'already_know', 'too_hard', 'too_easy', 'other')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Profile Analysis History (Track AI analysis runs)
CREATE TABLE profile_analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  
  -- Analysis Metadata
  model_used TEXT NOT NULL,
  processing_time_ms INTEGER,
  data_points_analyzed INTEGER,
  confidence_level DECIMAL(3,2),
  
  -- Snapshot of results
  profile_snapshot JSONB NOT NULL,
  patterns_detected INTEGER DEFAULT 0,
  recommendations_generated INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE (without partial index using NOW())
-- ============================================

CREATE INDEX idx_learning_profiles_child ON learning_profiles(child_id);
CREATE INDEX idx_learning_patterns_child ON learning_patterns(child_id);
CREATE INDEX idx_learning_patterns_type ON learning_patterns(pattern_type);
CREATE INDEX idx_skill_mastery_child ON skill_mastery(child_id);
CREATE INDEX idx_skill_mastery_subject ON skill_mastery(subject);
CREATE INDEX idx_lesson_recommendations_child ON lesson_recommendations(child_id);
CREATE INDEX idx_lesson_recommendations_status ON lesson_recommendations(child_id, dismissed_at, completed_at, expires_at);
CREATE INDEX idx_recommendation_feedback_recommendation ON recommendation_feedback(recommendation_id);
CREATE INDEX idx_profile_analysis_history_child ON profile_analysis_history(child_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_analysis_history ENABLE ROW LEVEL SECURITY;

-- Learning Profiles Policies
CREATE POLICY "Parents can view their children's profiles"
ON learning_profiles FOR SELECT
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Service can insert profiles"
ON learning_profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update profiles"
ON learning_profiles FOR UPDATE USING (true);

-- Learning Patterns Policies
CREATE POLICY "Parents can view their children's patterns"
ON learning_patterns FOR SELECT
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Service can insert patterns"
ON learning_patterns FOR INSERT WITH CHECK (true);

-- Skill Mastery Policies
CREATE POLICY "Parents can view their children's skill mastery"
ON skill_mastery FOR SELECT
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Service can insert skill mastery"
ON skill_mastery FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update skill mastery"
ON skill_mastery FOR UPDATE USING (true);

-- Lesson Recommendations Policies
CREATE POLICY "Parents can view their children's recommendations"
ON lesson_recommendations FOR SELECT
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can update recommendation status"
ON lesson_recommendations FOR UPDATE
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Service can insert recommendations"
ON lesson_recommendations FOR INSERT WITH CHECK (true);

-- Recommendation Feedback Policies
CREATE POLICY "Parents can submit feedback for their children"
ON recommendation_feedback FOR INSERT
WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Parents can view their children's feedback"
ON recommendation_feedback FOR SELECT
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Profile Analysis History Policies
CREATE POLICY "Parents can view their children's analysis history"
ON profile_analysis_history FOR SELECT
USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "Service can insert analysis history"
ON profile_analysis_history FOR INSERT WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_learning_profiles_updated_at
  BEFORE UPDATE ON learning_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_mastery_updated_at
  BEFORE UPDATE ON skill_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_active_recommendations(p_child_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  lesson_id UUID,
  lesson_title TEXT,
  lesson_subject TEXT,
  reason TEXT,
  reason_explanation TEXT,
  priority INTEGER,
  predicted_score DECIMAL,
  predicted_time_minutes INTEGER,
  predicted_difficulty TEXT,
  created_at TIMESTAMPTZ
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_active_recommendations TO authenticated;