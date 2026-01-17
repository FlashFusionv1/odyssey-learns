-- =====================================================
-- ONBOARDING SYSTEM DATABASE SCHEMA
-- Comprehensive onboarding, tutorial progress, and AI nudges
-- =====================================================

-- 1. ONBOARDING PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.onboarding_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Onboarding Mode
  onboarding_mode TEXT DEFAULT 'full' CHECK (onboarding_mode IN ('full', 'quick_start')),
  
  -- Learning Preferences
  preferred_subjects TEXT[] DEFAULT '{}',
  difficulty_preference TEXT DEFAULT 'adaptive' CHECK (difficulty_preference IN ('easy', 'moderate', 'challenging', 'adaptive')),
  session_length_minutes INTEGER DEFAULT 30 CHECK (session_length_minutes BETWEEN 10 AND 120),
  learning_style TEXT DEFAULT 'balanced' CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading', 'balanced')),
  
  -- Goals
  primary_goal TEXT DEFAULT 'academic_growth' CHECK (primary_goal IN ('academic_growth', 'emotional_intelligence', 'life_skills', 'balanced_development')),
  target_lessons_per_week INTEGER DEFAULT 5 CHECK (target_lessons_per_week BETWEEN 1 AND 21),
  focus_areas TEXT[] DEFAULT '{}',
  
  -- Community Preferences
  community_interest TEXT DEFAULT 'moderate' CHECK (community_interest IN ('networking', 'learning', 'both', 'minimal', 'moderate')),
  share_progress_publicly BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('realtime', 'daily', 'weekly', 'minimal')),
  
  -- Completion Status
  wizard_completed BOOLEAN DEFAULT false,
  wizard_completed_at TIMESTAMPTZ,
  quick_start_completed BOOLEAN DEFAULT false,
  deferred_setup_items TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- 2. TUTORIAL PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  
  tutorial_id TEXT NOT NULL,
  tutorial_type TEXT NOT NULL CHECK (tutorial_type IN ('onboarding_wizard', 'feature_spotlight', 'contextual_walkthrough', 'quick_tour')),
  
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER NOT NULL,
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped', 'deferred')),
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  steps_skipped INTEGER DEFAULT 0,
  interactions_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index instead of constraint for nullable column
CREATE UNIQUE INDEX IF NOT EXISTS idx_tutorial_progress_unique 
  ON public.tutorial_progress(user_id, tutorial_id, child_id) 
  WHERE child_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tutorial_progress_unique_no_child 
  ON public.tutorial_progress(user_id, tutorial_id) 
  WHERE child_id IS NULL;

-- 3. AI NUDGES TABLE
CREATE TABLE IF NOT EXISTS public.ai_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('preference_based', 'activity_based', 'incomplete_setup', 'feature_discovery', 'celebration', 'reminder')),
  trigger_reason TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  icon TEXT DEFAULT 'lightbulb',
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  display_location TEXT DEFAULT 'dashboard' CHECK (display_location IN ('dashboard', 'banner', 'modal', 'sidebar', 'toast')),
  display_after TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  max_impressions INTEGER DEFAULT 3,
  
  impressions_count INTEGER DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  
  generated_by TEXT DEFAULT 'system',
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  context_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FEATURE DISCOVERY LOG
CREATE TABLE IF NOT EXISTS public.feature_discovery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  
  feature_id TEXT NOT NULL,
  feature_category TEXT NOT NULL,
  
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  tutorial_triggered BOOLEAN DEFAULT false,
  tutorial_completed BOOLEAN DEFAULT false
);

-- Create unique indexes for feature discovery
CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_discovery_unique 
  ON public.feature_discovery_log(user_id, feature_id, child_id) 
  WHERE child_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_feature_discovery_unique_no_child 
  ON public.feature_discovery_log(user_id, feature_id) 
  WHERE child_id IS NULL;

-- Enable RLS
ALTER TABLE public.onboarding_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_discovery_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_preferences
CREATE POLICY "Users can view own onboarding preferences"
  ON public.onboarding_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding preferences"
  ON public.onboarding_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding preferences"
  ON public.onboarding_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tutorial_progress
CREATE POLICY "Users can view own tutorial progress"
  ON public.tutorial_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tutorial progress"
  ON public.tutorial_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tutorial progress"
  ON public.tutorial_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_nudges
CREATE POLICY "Users can view own nudges"
  ON public.ai_nudges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert nudges"
  ON public.ai_nudges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nudges"
  ON public.ai_nudges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nudges"
  ON public.ai_nudges FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for feature_discovery_log
CREATE POLICY "Users can view own feature discovery"
  ON public.feature_discovery_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feature discovery"
  ON public.feature_discovery_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feature discovery"
  ON public.feature_discovery_log FOR UPDATE
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_preferences_user ON public.onboarding_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user ON public.tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_status ON public.tutorial_progress(status);
CREATE INDEX IF NOT EXISTS idx_ai_nudges_user ON public.ai_nudges(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_nudges_display ON public.ai_nudges(display_after, expires_at, dismissed_at);
CREATE INDEX IF NOT EXISTS idx_feature_discovery_user ON public.feature_discovery_log(user_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_onboarding_preferences_updated
  BEFORE UPDATE ON public.onboarding_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_updated_at();

CREATE TRIGGER trigger_tutorial_progress_updated
  BEFORE UPDATE ON public.tutorial_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_updated_at();

CREATE TRIGGER trigger_ai_nudges_updated
  BEFORE UPDATE ON public.ai_nudges
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_updated_at();