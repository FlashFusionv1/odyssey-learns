# AI-Powered Adaptive Learning Path - Complete Implementation Guide

**Version:** 1.0.0  
**Date:** January 10, 2026  
**Priority:** High  
**Estimated Effort:** 3 weeks (15 working days)  
**Status:** Ready for Implementation

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1: Learning Profile Engine](#phase-1-learning-profile-engine)
3. [Phase 2: AI Recommendation Engine](#phase-2-ai-recommendation-engine)
4. [Phase 3: UI Integration](#phase-3-ui-integration)
5. [Database Schemas](#database-schemas)
6. [Component Specifications](#component-specifications)
7. [Success Metrics](#success-metrics)
8. [Risk Mitigation](#risk-mitigation)
9. [Implementation Checklist](#implementation-checklist)

---

## 📊 Executive Summary

### Vision
Transform Inner Odyssey from a static lesson platform into an intelligent learning companion that understands each child's unique learning patterns, strengths, and challenges—adapting in real-time to maximize engagement and educational outcomes.

### Core Capabilities

| Capability | Description | User Benefit |
|------------|-------------|--------------|
| **Learning Profile Analysis** | Analyzes patterns from activity sessions, quiz scores, time spent | Parents see clear picture of child's learning style |
| **AI-Powered Recommendations** | Uses Lovable AI (gemini-3-flash-preview) to generate personalized lesson suggestions | Children always have engaging, appropriately-challenging content |
| **Difficulty Adaptation** | Automatically adjusts lesson difficulty based on performance | Prevents frustration and boredom |
| **Strength/Weakness Detection** | Identifies subjects and skills where child excels or struggles | Teachers/parents can provide targeted support |
| **Learning Velocity Tracking** | Measures improvement speed over time | Celebrates progress and identifies when child is stuck |

### Technical Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ RecommendedLessons │  │ LearningProfileCard │  │ StrengthsChart │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                              │                                    │
│  ┌─────────────────┐  ┌─────────────────┐                        │
│  │ useRecommendations │  │ useLearningProfile │                        │
│  └─────────────────┘  └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EDGE FUNCTIONS                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────┐  ┌───────────────────────────┐   │
│  │ analyze-learning-profile  │  │ generate-recommendations  │   │
│  │ (Lovable AI Integration)  │  │ (Priority Algorithm)      │   │
│  └───────────────────────────┘  └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ learning_profiles │  │ learning_patterns │  │ lesson_recommendations │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
│  ┌────────────────┐  ┌────────────────┐                         │
│  │ skill_mastery   │  │ recommendation_feedback │                         │
│  └────────────────┘  └────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Phase 1: Learning Profile Engine

**Duration:** 5 days  
**Goal:** Build the data analysis foundation that powers all AI recommendations

### Day 1: Type Definitions & Database Schema

#### Task 1.1: Extend Type Definitions

**File:** `src/types/adaptive.ts`

```typescript
// Existing types remain...

// NEW: Learning Profile Types
export type LearningSpeed = 'very_slow' | 'slow' | 'medium' | 'fast' | 'very_fast';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type RecommendationReason = 'remediation' | 'challenge' | 'interest' | 'next_step' | 'review' | 'exploration';
export type PatternType = 'strength' | 'weakness' | 'preference' | 'velocity' | 'time_preference' | 'session_length';
export type SubjectArea = 'math' | 'reading' | 'science' | 'social_studies' | 'emotional_intelligence' | 'life_skills' | 'art' | 'music';

export interface SubjectStrength {
  subject: SubjectArea;
  skill: string;
  masteryLevel: DifficultyLevel;
  confidenceScore: number; // 0.0 to 1.0
  lastDemonstrated: string; // ISO date
}

export interface SubjectWeakness {
  subject: SubjectArea;
  skill: string;
  currentLevel: DifficultyLevel;
  struggleIndicators: string[];
  suggestedRemediation: string[];
  lastAttempted: string; // ISO date
}

export interface LearningProfile {
  id: string;
  childId: string;
  
  // Core Analysis
  strengths: SubjectStrength[];
  weaknesses: SubjectWeakness[];
  learningSpeed: LearningSpeed;
  preferredSubjects: SubjectArea[];
  avoidedSubjects: SubjectArea[];
  
  // Performance Metrics
  overallCompletionRate: number; // 0-100
  averageQuizScore: number; // 0-100
  averageSessionMinutes: number;
  totalLessonsCompleted: number;
  currentStreak: number;
  
  // Behavioral Patterns
  optimalSessionLength: number; // minutes
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  preferredDifficulty: DifficultyLevel;
  helpSeekingFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'always';
  
  // Velocity & Trajectory
  weeklyLessonVelocity: number; // lessons per week
  skillAcquisitionRate: number; // new skills per month
  improvementTrend: 'declining' | 'stable' | 'improving' | 'accelerating';
  
  // Metadata
  profileVersion: number;
  lastAnalyzedAt: string;
  dataPointsAnalyzed: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPattern {
  id: string;
  childId: string;
  patternType: PatternType;
  subject: SubjectArea | null;
  topic: string | null;
  confidenceScore: number; // 0.0 to 1.0
  data: Record<string, unknown>;
  detectedAt: string;
}

export interface LessonRecommendationFull {
  id: string;
  childId: string;
  lessonId: string;
  lessonTitle: string;
  lessonSubject: SubjectArea;
  lessonDifficulty: DifficultyLevel;
  
  // Recommendation Details
  reason: RecommendationReason;
  reasonExplanation: string; // Human-readable explanation
  priority: number; // 1-100
  
  // Predictions
  predictedScore: number; // 0-100
  predictedTimeMinutes: number;
  predictedDifficulty: 'too_easy' | 'appropriate' | 'challenging' | 'too_hard';
  predictedEngagement: 'low' | 'medium' | 'high';
  
  // State
  expiresAt: string;
  dismissedAt: string | null;
  completedAt: string | null;
  
  // Feedback (after completion)
  wasHelpful: boolean | null;
  actualScore: number | null;
  actualTimeMinutes: number | null;
  
  createdAt: string;
}

export interface SkillMastery {
  id: string;
  childId: string;
  subject: SubjectArea;
  skillName: string;
  skillCategory: string;
  
  // Mastery Tracking
  currentLevel: DifficultyLevel;
  masteryPercentage: number; // 0-100
  practiceCount: number;
  successRate: number; // 0-100
  
  // Time Tracking
  totalTimeSpentMinutes: number;
  avgSessionMinutes: number;
  lastPracticedAt: string;
  
  // Trajectory
  improvementRate: number; // -100 to +100 (percentage change per week)
  projectedMasteryDate: string | null;
  
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationFeedback {
  id: string;
  recommendationId: string;
  childId: string;
  
  // Feedback Type
  feedbackType: 'completed' | 'dismissed' | 'skipped' | 'reported';
  
  // Completion Feedback
  wasHelpful: boolean | null;
  difficultyRating: 1 | 2 | 3 | 4 | 5 | null; // 1=too easy, 5=too hard
  enjoymentRating: 1 | 2 | 3 | 4 | 5 | null;
  
  // Dismissal Feedback
  dismissalReason: 'not_interested' | 'already_know' | 'too_hard' | 'too_easy' | 'other' | null;
  
  createdAt: string;
}

// AI Analysis Request/Response Types
export interface ProfileAnalysisRequest {
  childId: string;
  includePatterns?: boolean;
  forceRefresh?: boolean;
}

export interface ProfileAnalysisResponse {
  profile: LearningProfile;
  patterns: LearningPattern[];
  recommendations: LessonRecommendationFull[];
  analysisMetadata: {
    modelUsed: string;
    processingTimeMs: number;
    dataPointsAnalyzed: number;
    confidenceLevel: number;
  };
}

export interface RecommendationRequest {
  childId: string;
  count?: number; // Default 5
  filterSubjects?: SubjectArea[];
  filterDifficulty?: DifficultyLevel[];
  excludeLessonIds?: string[];
}
```

#### Task 1.2: Database Schema Migration

**Migration SQL:**

```sql
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
  optimal_session_length INTEGER DEFAULT 20, -- minutes
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
  subject TEXT, -- Nullable for non-subject patterns
  topic TEXT, -- Nullable for general patterns
  confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate patterns
  UNIQUE(child_id, pattern_type, subject, topic)
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
  improvement_rate DECIMAL(6,2) DEFAULT 0, -- Can be negative
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
  
  -- Prevent duplicate recommendations for same lesson
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
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_learning_profiles_child ON learning_profiles(child_id);
CREATE INDEX idx_learning_patterns_child ON learning_patterns(child_id);
CREATE INDEX idx_learning_patterns_type ON learning_patterns(pattern_type);
CREATE INDEX idx_skill_mastery_child ON skill_mastery(child_id);
CREATE INDEX idx_skill_mastery_subject ON skill_mastery(subject);
CREATE INDEX idx_lesson_recommendations_child ON lesson_recommendations(child_id);
CREATE INDEX idx_lesson_recommendations_active ON lesson_recommendations(child_id) 
  WHERE dismissed_at IS NULL AND completed_at IS NULL AND expires_at > NOW();
CREATE INDEX idx_recommendation_feedback_recommendation ON recommendation_feedback(recommendation_id);
CREATE INDEX idx_profile_analysis_history_child ON profile_analysis_history(child_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_analysis_history ENABLE ROW LEVEL SECURITY;

-- Learning Profiles Policies
CREATE POLICY "Parents can view their children's profiles"
ON learning_profiles FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

CREATE POLICY "System can manage profiles"
ON learning_profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Learning Patterns Policies
CREATE POLICY "Parents can view their children's patterns"
ON learning_patterns FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

CREATE POLICY "System can manage patterns"
ON learning_patterns FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Skill Mastery Policies
CREATE POLICY "Parents can view their children's skill mastery"
ON skill_mastery FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

CREATE POLICY "System can manage skill mastery"
ON skill_mastery FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Lesson Recommendations Policies
CREATE POLICY "Parents can view their children's recommendations"
ON lesson_recommendations FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

CREATE POLICY "Parents can update recommendation status"
ON lesson_recommendations FOR UPDATE
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
))
WITH CHECK (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

CREATE POLICY "System can manage recommendations"
ON lesson_recommendations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Recommendation Feedback Policies
CREATE POLICY "Parents can submit feedback for their children"
ON recommendation_feedback FOR INSERT
WITH CHECK (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

CREATE POLICY "Parents can view their children's feedback"
ON recommendation_feedback FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

-- Profile Analysis History Policies
CREATE POLICY "Parents can view their children's analysis history"
ON profile_analysis_history FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

CREATE POLICY "System can manage analysis history"
ON profile_analysis_history FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_learning_profiles_updated_at
  BEFORE UPDATE ON learning_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_mastery_updated_at
  BEFORE UPDATE ON skill_mastery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get active recommendations for a child
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_active_recommendations TO authenticated;
```

### Day 2-3: Learning Profile Hook

#### Task 1.3: Create useLearningProfile Hook

**File:** `src/hooks/useLearningProfile.tsx`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LearningProfile, 
  LearningPattern, 
  SkillMastery,
  SubjectArea,
  DifficultyLevel,
  LearningSpeed
} from '@/types/adaptive';
import { toast } from 'sonner';

interface UseLearningProfileOptions {
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

interface ProfileAnalysisResult {
  profile: LearningProfile;
  patterns: LearningPattern[];
  skills: SkillMastery[];
}

export function useLearningProfile(
  childId: string | null,
  options: UseLearningProfileOptions = {}
) {
  const { autoRefresh = false, refreshIntervalMs = 300000 } = options; // 5 min default
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch existing profile
  const profileQuery = useQuery({
    queryKey: ['learning-profile', childId],
    queryFn: async (): Promise<LearningProfile | null> => {
      if (!childId) return null;
      
      const { data, error } = await supabase
        .from('learning_profiles')
        .select('*')
        .eq('child_id', childId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform DB row to LearningProfile type
      return {
        id: data.id,
        childId: data.child_id,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        learningSpeed: data.learning_speed as LearningSpeed,
        preferredSubjects: (data.preferred_subjects || []) as SubjectArea[],
        avoidedSubjects: (data.avoided_subjects || []) as SubjectArea[],
        overallCompletionRate: Number(data.overall_completion_rate) || 0,
        averageQuizScore: Number(data.average_quiz_score) || 0,
        averageSessionMinutes: Number(data.average_session_minutes) || 0,
        totalLessonsCompleted: data.total_lessons_completed || 0,
        currentStreak: data.current_streak || 0,
        optimalSessionLength: data.optimal_session_length || 20,
        bestTimeOfDay: data.best_time_of_day as 'morning' | 'afternoon' | 'evening' | 'night',
        preferredDifficulty: data.preferred_difficulty as DifficultyLevel,
        helpSeekingFrequency: data.help_seeking_frequency as 'never' | 'rarely' | 'sometimes' | 'often' | 'always',
        weeklyLessonVelocity: Number(data.weekly_lesson_velocity) || 0,
        skillAcquisitionRate: Number(data.skill_acquisition_rate) || 0,
        improvementTrend: data.improvement_trend as 'declining' | 'stable' | 'improving' | 'accelerating',
        profileVersion: data.profile_version || 1,
        lastAnalyzedAt: data.last_analyzed_at,
        dataPointsAnalyzed: data.data_points_analyzed || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    enabled: !!childId,
    staleTime: 60000, // 1 minute
    refetchInterval: autoRefresh ? refreshIntervalMs : false,
  });

  // Fetch patterns
  const patternsQuery = useQuery({
    queryKey: ['learning-patterns', childId],
    queryFn: async (): Promise<LearningPattern[]> => {
      if (!childId) return [];
      
      const { data, error } = await supabase
        .from('learning_patterns')
        .select('*')
        .eq('child_id', childId)
        .order('confidence_score', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        childId: row.child_id,
        patternType: row.pattern_type as LearningPattern['patternType'],
        subject: row.subject as SubjectArea | null,
        topic: row.topic,
        confidenceScore: Number(row.confidence_score),
        data: row.data as Record<string, unknown>,
        detectedAt: row.detected_at,
      }));
    },
    enabled: !!childId,
    staleTime: 60000,
  });

  // Fetch skill mastery
  const skillsQuery = useQuery({
    queryKey: ['skill-mastery', childId],
    queryFn: async (): Promise<SkillMastery[]> => {
      if (!childId) return [];
      
      const { data, error } = await supabase
        .from('skill_mastery')
        .select('*')
        .eq('child_id', childId)
        .order('mastery_percentage', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        childId: row.child_id,
        subject: row.subject as SubjectArea,
        skillName: row.skill_name,
        skillCategory: row.skill_category || '',
        currentLevel: row.current_level as DifficultyLevel,
        masteryPercentage: Number(row.mastery_percentage),
        practiceCount: row.practice_count,
        successRate: Number(row.success_rate),
        totalTimeSpentMinutes: row.total_time_spent_minutes,
        avgSessionMinutes: Number(row.avg_session_minutes),
        lastPracticedAt: row.last_practiced_at,
        improvementRate: Number(row.improvement_rate),
        projectedMasteryDate: row.projected_mastery_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    },
    enabled: !!childId,
    staleTime: 60000,
  });

  // Trigger AI analysis
  const analyzeProfile = useMutation({
    mutationFn: async (forceRefresh: boolean = false) => {
      if (!childId) throw new Error('No child selected');
      
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-learning-profile', {
        body: { childId, forceRefresh },
      });

      if (error) throw error;
      return data as ProfileAnalysisResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-profile', childId] });
      queryClient.invalidateQueries({ queryKey: ['learning-patterns', childId] });
      queryClient.invalidateQueries({ queryKey: ['skill-mastery', childId] });
      toast.success('Learning profile updated!');
    },
    onError: (error) => {
      console.error('Profile analysis failed:', error);
      toast.error('Failed to analyze learning profile');
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  // Check if profile needs refresh (>24 hours since last analysis)
  const needsRefresh = useCallback(() => {
    if (!profileQuery.data?.lastAnalyzedAt) return true;
    
    const lastAnalysis = new Date(profileQuery.data.lastAnalyzedAt);
    const hoursSinceAnalysis = (Date.now() - lastAnalysis.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceAnalysis > 24;
  }, [profileQuery.data?.lastAnalyzedAt]);

  // Auto-analyze if profile is stale
  useEffect(() => {
    if (childId && profileQuery.data === null && !profileQuery.isLoading && !isAnalyzing) {
      analyzeProfile.mutate(false);
    }
  }, [childId, profileQuery.data, profileQuery.isLoading, isAnalyzing]);

  // Computed values
  const topStrengths = profileQuery.data?.strengths?.slice(0, 3) || [];
  const topWeaknesses = profileQuery.data?.weaknesses?.slice(0, 3) || [];
  const subjectProgress = skillsQuery.data?.reduce((acc, skill) => {
    if (!acc[skill.subject]) {
      acc[skill.subject] = { total: 0, mastered: 0 };
    }
    acc[skill.subject].total += 1;
    if (skill.masteryPercentage >= 80) {
      acc[skill.subject].mastered += 1;
    }
    return acc;
  }, {} as Record<SubjectArea, { total: number; mastered: number }>);

  return {
    // Data
    profile: profileQuery.data,
    patterns: patternsQuery.data || [],
    skills: skillsQuery.data || [],
    
    // Computed
    topStrengths,
    topWeaknesses,
    subjectProgress,
    
    // State
    isLoading: profileQuery.isLoading || patternsQuery.isLoading || skillsQuery.isLoading,
    isAnalyzing,
    needsRefresh: needsRefresh(),
    error: profileQuery.error || patternsQuery.error || skillsQuery.error,
    
    // Actions
    refreshProfile: () => analyzeProfile.mutate(true),
    analyzeProfile: (forceRefresh?: boolean) => analyzeProfile.mutate(forceRefresh ?? false),
  };
}
```

### Day 4-5: Profile Analyzer Library

#### Task 1.4: Create Profile Analyzer

**File:** `src/lib/ai/profileAnalyzer.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';
import {
  LearningProfile,
  SubjectStrength,
  SubjectWeakness,
  LearningSpeed,
  DifficultyLevel,
  SubjectArea,
} from '@/types/adaptive';

interface RawActivityData {
  activity_type: string;
  score: number | null;
  max_score: number | null;
  time_spent_seconds: number | null;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
}

interface RawProgressData {
  lesson_id: string;
  score: number | null;
  completed: boolean;
  time_spent_seconds: number | null;
  attempts_count: number;
}

interface AnalysisInput {
  activities: RawActivityData[];
  progress: RawProgressData[];
  childGradeLevel: number;
}

export class ProfileAnalyzer {
  /**
   * Fetch all relevant data for profile analysis
   */
  static async fetchAnalysisData(childId: string): Promise<AnalysisInput | null> {
    // Fetch child info
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('grade_level')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      console.error('Failed to fetch child:', childError);
      return null;
    }

    // Fetch activity sessions (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: activities, error: activitiesError } = await supabase
      .from('activity_sessions')
      .select('activity_type, score, max_score, time_spent_seconds, completed_at, metadata')
      .eq('child_id', childId)
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (activitiesError) {
      console.error('Failed to fetch activities:', activitiesError);
      return null;
    }

    // Fetch user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('lesson_id, score, completed, time_spent_seconds, attempts_count')
      .eq('child_id', childId);

    if (progressError) {
      console.error('Failed to fetch progress:', progressError);
      return null;
    }

    return {
      activities: activities || [],
      progress: progress || [],
      childGradeLevel: child.grade_level,
    };
  }

  /**
   * Analyze raw data to compute learning metrics
   */
  static computeMetrics(data: AnalysisInput): Partial<LearningProfile> {
    const { activities, progress } = data;

    // Completion rate
    const completedActivities = activities.filter(a => a.completed_at);
    const overallCompletionRate = activities.length > 0
      ? (completedActivities.length / activities.length) * 100
      : 0;

    // Average quiz score
    const scoredActivities = activities.filter(a => 
      a.score !== null && a.max_score !== null && a.max_score > 0
    );
    const averageQuizScore = scoredActivities.length > 0
      ? scoredActivities.reduce((sum, a) => sum + ((a.score! / a.max_score!) * 100), 0) / scoredActivities.length
      : 0;

    // Average session time
    const sessionTimes = activities
      .filter(a => a.time_spent_seconds !== null && a.time_spent_seconds > 0)
      .map(a => a.time_spent_seconds!);
    const averageSessionMinutes = sessionTimes.length > 0
      ? (sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length) / 60
      : 0;

    // Total lessons completed
    const totalLessonsCompleted = progress.filter(p => p.completed).length;

    // Learning speed calculation (based on time vs expected)
    const learningSpeed = this.calculateLearningSpeed(activities);

    // Weekly velocity (lessons per week, last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentCompletions = completedActivities.filter(
      a => new Date(a.completed_at!) >= fourWeeksAgo
    );
    const weeklyLessonVelocity = recentCompletions.length / 4;

    // Improvement trend (compare last 2 weeks vs 2 weeks before)
    const improvementTrend = this.calculateImprovementTrend(activities);

    // Best time of day
    const bestTimeOfDay = this.calculateBestTimeOfDay(activities);

    // Optimal session length
    const optimalSessionLength = this.calculateOptimalSessionLength(activities);

    return {
      overallCompletionRate,
      averageQuizScore,
      averageSessionMinutes,
      totalLessonsCompleted,
      learningSpeed,
      weeklyLessonVelocity,
      improvementTrend,
      bestTimeOfDay,
      optimalSessionLength,
      dataPointsAnalyzed: activities.length + progress.length,
    };
  }

  private static calculateLearningSpeed(activities: RawActivityData[]): LearningSpeed {
    const timedActivities = activities.filter(
      a => a.time_spent_seconds !== null && a.metadata?.expected_minutes
    );

    if (timedActivities.length < 5) return 'medium';

    const speedRatios = timedActivities.map(a => {
      const expectedSeconds = (a.metadata!.expected_minutes as number) * 60;
      return expectedSeconds / (a.time_spent_seconds || expectedSeconds);
    });

    const avgRatio = speedRatios.reduce((a, b) => a + b, 0) / speedRatios.length;

    if (avgRatio >= 1.5) return 'very_fast';
    if (avgRatio >= 1.2) return 'fast';
    if (avgRatio >= 0.8) return 'medium';
    if (avgRatio >= 0.5) return 'slow';
    return 'very_slow';
  }

  private static calculateImprovementTrend(
    activities: RawActivityData[]
  ): 'declining' | 'stable' | 'improving' | 'accelerating' {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentScores = activities
      .filter(a => a.completed_at && new Date(a.completed_at) >= twoWeeksAgo && a.score !== null && a.max_score)
      .map(a => (a.score! / a.max_score!) * 100);

    const olderScores = activities
      .filter(a => {
        if (!a.completed_at || a.score === null || !a.max_score) return false;
        const date = new Date(a.completed_at);
        return date >= fourWeeksAgo && date < twoWeeksAgo;
      })
      .map(a => (a.score! / a.max_score!) * 100);

    if (recentScores.length < 3 || olderScores.length < 3) return 'stable';

    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    const diff = recentAvg - olderAvg;

    if (diff >= 15) return 'accelerating';
    if (diff >= 5) return 'improving';
    if (diff <= -5) return 'declining';
    return 'stable';
  }

  private static calculateBestTimeOfDay(
    activities: RawActivityData[]
  ): 'morning' | 'afternoon' | 'evening' | 'night' {
    const completedWithScores = activities.filter(
      a => a.completed_at && a.score !== null && a.max_score
    );

    if (completedWithScores.length < 5) return 'afternoon';

    const timeGroups: Record<string, number[]> = {
      morning: [],    // 5-11
      afternoon: [],  // 12-16
      evening: [],    // 17-20
      night: [],      // 21-4
    };

    completedWithScores.forEach(a => {
      const hour = new Date(a.completed_at!).getHours();
      const score = (a.score! / a.max_score!) * 100;

      if (hour >= 5 && hour < 12) timeGroups.morning.push(score);
      else if (hour >= 12 && hour < 17) timeGroups.afternoon.push(score);
      else if (hour >= 17 && hour < 21) timeGroups.evening.push(score);
      else timeGroups.night.push(score);
    });

    let best = 'afternoon';
    let bestAvg = 0;

    Object.entries(timeGroups).forEach(([time, scores]) => {
      if (scores.length >= 2) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          best = time;
        }
      }
    });

    return best as 'morning' | 'afternoon' | 'evening' | 'night';
  }

  private static calculateOptimalSessionLength(activities: RawActivityData[]): number {
    const completedWithGoodScores = activities.filter(
      a => a.completed_at && 
           a.score !== null && 
           a.max_score && 
           (a.score / a.max_score) >= 0.7 &&
           a.time_spent_seconds
    );

    if (completedWithGoodScores.length < 5) return 20;

    const sessionLengths = completedWithGoodScores
      .map(a => a.time_spent_seconds! / 60)
      .filter(m => m >= 5 && m <= 60); // Filter outliers

    if (sessionLengths.length === 0) return 20;

    // Return median session length
    sessionLengths.sort((a, b) => a - b);
    const mid = Math.floor(sessionLengths.length / 2);
    const median = sessionLengths.length % 2 !== 0
      ? sessionLengths[mid]
      : (sessionLengths[mid - 1] + sessionLengths[mid]) / 2;

    return Math.round(median);
  }

  /**
   * Detect strengths and weaknesses from activity patterns
   */
  static detectStrengthsWeaknesses(
    activities: RawActivityData[],
    progress: RawProgressData[]
  ): { strengths: SubjectStrength[]; weaknesses: SubjectWeakness[] } {
    // Group by subject (from metadata)
    const subjectStats: Record<string, {
      scores: number[];
      completions: number;
      attempts: number;
      skills: Set<string>;
    }> = {};

    activities.forEach(a => {
      const subject = (a.metadata?.subject as string) || 'general';
      const skill = (a.metadata?.skill as string) || 'general';

      if (!subjectStats[subject]) {
        subjectStats[subject] = { scores: [], completions: 0, attempts: 0, skills: new Set() };
      }

      subjectStats[subject].attempts += 1;
      subjectStats[subject].skills.add(skill);

      if (a.completed_at) {
        subjectStats[subject].completions += 1;
      }

      if (a.score !== null && a.max_score) {
        subjectStats[subject].scores.push((a.score / a.max_score) * 100);
      }
    });

    const strengths: SubjectStrength[] = [];
    const weaknesses: SubjectWeakness[] = [];

    Object.entries(subjectStats).forEach(([subject, stats]) => {
      if (stats.scores.length < 3) return; // Need enough data

      const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
      const completionRate = (stats.completions / stats.attempts) * 100;

      // Determine mastery level
      const masteryLevel: DifficultyLevel = avgScore >= 90 ? 'expert'
        : avgScore >= 75 ? 'advanced'
        : avgScore >= 60 ? 'intermediate'
        : 'beginner';

      // Confidence based on sample size
      const confidenceScore = Math.min(stats.scores.length / 20, 1);

      if (avgScore >= 75 && completionRate >= 70) {
        strengths.push({
          subject: subject as SubjectArea,
          skill: Array.from(stats.skills).join(', '),
          masteryLevel,
          confidenceScore,
          lastDemonstrated: new Date().toISOString(),
        });
      } else if (avgScore < 60 || completionRate < 50) {
        weaknesses.push({
          subject: subject as SubjectArea,
          skill: Array.from(stats.skills).join(', '),
          currentLevel: masteryLevel,
          struggleIndicators: [
            avgScore < 60 ? 'Low quiz scores' : '',
            completionRate < 50 ? 'Low completion rate' : '',
          ].filter(Boolean),
          suggestedRemediation: [
            'Review foundational concepts',
            'Practice with easier materials',
          ],
          lastAttempted: new Date().toISOString(),
        });
      }
    });

    // Sort by confidence
    strengths.sort((a, b) => b.confidenceScore - a.confidenceScore);
    weaknesses.sort((a, b) => a.currentLevel === 'beginner' ? -1 : 1);

    return { strengths: strengths.slice(0, 5), weaknesses: weaknesses.slice(0, 5) };
  }
}
```

---

## 🤖 Phase 2: AI Recommendation Engine

**Duration:** 5 days  
**Goal:** Generate personalized recommendations using Lovable AI

### Day 6-7: Edge Function for Profile Analysis

#### Task 2.1: Create analyze-learning-profile Edge Function

**File:** `supabase/functions/analyze-learning-profile/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  childId: string;
  forceRefresh?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { childId, forceRefresh = false } = await req.json() as AnalysisRequest;

    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'childId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if analysis is needed
    if (!forceRefresh) {
      const { data: existingProfile } = await supabase
        .from('learning_profiles')
        .select('last_analyzed_at')
        .eq('child_id', childId)
        .single();

      if (existingProfile?.last_analyzed_at) {
        const hoursSinceAnalysis = (Date.now() - new Date(existingProfile.last_analyzed_at).getTime()) / (1000 * 60 * 60);
        if (hoursSinceAnalysis < 6) {
          return new Response(
            JSON.stringify({ message: 'Profile is up to date', skipped: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Fetch child data
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, name, grade_level, parent_id')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      return new Response(
        JSON.stringify({ error: 'Child not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch activity data (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: activities } = await supabase
      .from('activity_sessions')
      .select('*')
      .eq('child_id', childId)
      .gte('created_at', ninetyDaysAgo.toISOString());

    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('child_id', childId);

    // Prepare analysis prompt for AI
    const analysisContext = {
      childName: child.name,
      gradeLevel: child.grade_level,
      totalActivities: activities?.length || 0,
      totalProgress: progress?.length || 0,
      recentScores: (activities || [])
        .filter(a => a.score !== null && a.max_score)
        .slice(0, 20)
        .map(a => ({
          subject: a.metadata?.subject || 'unknown',
          score: Math.round((a.score / a.max_score) * 100),
          timeSpent: a.time_spent_seconds,
          type: a.activity_type,
        })),
      completionRate: activities?.length 
        ? ((activities.filter(a => a.completed_at).length / activities.length) * 100).toFixed(1)
        : 0,
    };

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are an educational AI analyzing a child's learning patterns. 
Analyze the data and return a structured assessment.
Be encouraging but honest about areas needing improvement.
Focus on actionable insights for parents and educators.`
          },
          {
            role: 'user',
            content: `Analyze this learning data for a Grade ${analysisContext.gradeLevel} student:

${JSON.stringify(analysisContext, null, 2)}

Provide analysis as JSON with these fields:
- learningSpeed: "very_slow" | "slow" | "medium" | "fast" | "very_fast"
- preferredSubjects: array of subjects they excel in
- avoidedSubjects: array of subjects they struggle with
- strengths: array of { subject, skill, masteryLevel, confidenceScore (0-1) }
- weaknesses: array of { subject, skill, currentLevel, struggleIndicators, suggestedRemediation }
- preferredDifficulty: "beginner" | "intermediate" | "advanced" | "expert"
- improvementTrend: "declining" | "stable" | "improving" | "accelerating"
- keyInsights: array of 3 short insights for parents
- recommendedFocus: 2-3 areas to focus on next`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'submit_analysis',
              description: 'Submit the learning profile analysis',
              parameters: {
                type: 'object',
                properties: {
                  learningSpeed: {
                    type: 'string',
                    enum: ['very_slow', 'slow', 'medium', 'fast', 'very_fast']
                  },
                  preferredSubjects: { type: 'array', items: { type: 'string' } },
                  avoidedSubjects: { type: 'array', items: { type: 'string' } },
                  strengths: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        subject: { type: 'string' },
                        skill: { type: 'string' },
                        masteryLevel: { type: 'string' },
                        confidenceScore: { type: 'number' }
                      }
                    }
                  },
                  weaknesses: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        subject: { type: 'string' },
                        skill: { type: 'string' },
                        currentLevel: { type: 'string' },
                        struggleIndicators: { type: 'array', items: { type: 'string' } },
                        suggestedRemediation: { type: 'array', items: { type: 'string' } }
                      }
                    }
                  },
                  preferredDifficulty: {
                    type: 'string',
                    enum: ['beginner', 'intermediate', 'advanced', 'expert']
                  },
                  improvementTrend: {
                    type: 'string',
                    enum: ['declining', 'stable', 'improving', 'accelerating']
                  },
                  keyInsights: { type: 'array', items: { type: 'string' } },
                  recommendedFocus: { type: 'array', items: { type: 'string' } }
                },
                required: ['learningSpeed', 'preferredSubjects', 'strengths', 'weaknesses', 'preferredDifficulty', 'improvementTrend']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'submit_analysis' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Calculate additional metrics from raw data
    const completedActivities = (activities || []).filter(a => a.completed_at);
    const scoredActivities = (activities || []).filter(a => a.score !== null && a.max_score);
    
    const overallCompletionRate = activities?.length 
      ? (completedActivities.length / activities.length) * 100 
      : 0;
    
    const averageQuizScore = scoredActivities.length
      ? scoredActivities.reduce((sum, a) => sum + ((a.score / a.max_score) * 100), 0) / scoredActivities.length
      : 0;

    const sessionTimes = (activities || [])
      .filter(a => a.time_spent_seconds > 0)
      .map(a => a.time_spent_seconds);
    
    const averageSessionMinutes = sessionTimes.length
      ? (sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length) / 60
      : 0;

    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentCompletions = completedActivities.filter(
      a => new Date(a.completed_at) >= fourWeeksAgo
    );
    const weeklyLessonVelocity = recentCompletions.length / 4;

    // Upsert learning profile
    const profileData = {
      child_id: childId,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      learning_speed: analysis.learningSpeed,
      preferred_subjects: analysis.preferredSubjects,
      avoided_subjects: analysis.avoidedSubjects || [],
      overall_completion_rate: overallCompletionRate,
      average_quiz_score: averageQuizScore,
      average_session_minutes: averageSessionMinutes,
      total_lessons_completed: (progress || []).filter(p => p.completed).length,
      preferred_difficulty: analysis.preferredDifficulty,
      improvement_trend: analysis.improvementTrend,
      weekly_lesson_velocity: weeklyLessonVelocity,
      last_analyzed_at: new Date().toISOString(),
      data_points_analyzed: (activities?.length || 0) + (progress?.length || 0),
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error: upsertError } = await supabase
      .from('learning_profiles')
      .upsert(profileData, { onConflict: 'child_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('Failed to upsert profile:', upsertError);
      throw upsertError;
    }

    // Store patterns
    const patterns = [
      ...analysis.strengths.map((s: any) => ({
        child_id: childId,
        pattern_type: 'strength',
        subject: s.subject,
        topic: s.skill,
        confidence_score: s.confidenceScore,
        data: s,
      })),
      ...analysis.weaknesses.map((w: any) => ({
        child_id: childId,
        pattern_type: 'weakness',
        subject: w.subject,
        topic: w.skill,
        confidence_score: 0.7,
        data: w,
      })),
    ];

    // Clear old patterns and insert new
    await supabase
      .from('learning_patterns')
      .delete()
      .eq('child_id', childId);

    if (patterns.length > 0) {
      await supabase
        .from('learning_patterns')
        .insert(patterns);
    }

    // Log analysis history
    await supabase
      .from('profile_analysis_history')
      .insert({
        child_id: childId,
        model_used: 'google/gemini-3-flash-preview',
        processing_time_ms: Date.now() - startTime,
        data_points_analyzed: (activities?.length || 0) + (progress?.length || 0),
        confidence_level: 0.85,
        profile_snapshot: profile,
        patterns_detected: patterns.length,
        status: 'completed',
      });

    return new Response(
      JSON.stringify({
        success: true,
        profile,
        patterns,
        insights: analysis.keyInsights,
        recommendedFocus: analysis.recommendedFocus,
        processingTimeMs: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Profile analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Analysis failed',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Day 8-9: Recommendation Generation Edge Function

#### Task 2.2: Create generate-recommendations Edge Function

**File:** `supabase/functions/generate-recommendations/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  childId: string;
  count?: number;
  filterSubjects?: string[];
  excludeLessonIds?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { 
      childId, 
      count = 5, 
      filterSubjects = [], 
      excludeLessonIds = [] 
    } = await req.json() as RecommendationRequest;

    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'childId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get child and profile
    const { data: child } = await supabase
      .from('children')
      .select('id, name, grade_level')
      .eq('id', childId)
      .single();

    if (!child) {
      return new Response(
        JSON.stringify({ error: 'Child not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('child_id', childId)
      .single();

    // Get completed lesson IDs
    const { data: completedProgress } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('child_id', childId)
      .eq('completed', true);

    const completedLessonIds = (completedProgress || []).map(p => p.lesson_id);

    // Get existing active recommendations
    const { data: existingRecs } = await supabase
      .from('lesson_recommendations')
      .select('lesson_id')
      .eq('child_id', childId)
      .is('dismissed_at', null)
      .is('completed_at', null)
      .gt('expires_at', new Date().toISOString());

    const existingRecLessonIds = (existingRecs || []).map(r => r.lesson_id);

    // Build exclusion list
    const allExcludedIds = [
      ...completedLessonIds,
      ...existingRecLessonIds,
      ...excludeLessonIds,
    ];

    // Fetch candidate lessons
    let query = supabase
      .from('lessons')
      .select('*')
      .eq('is_active', true)
      .eq('grade_level', child.grade_level);

    if (filterSubjects.length > 0) {
      query = query.in('subject', filterSubjects);
    }

    const { data: candidateLessons } = await query;

    // Filter out excluded lessons
    const availableLessons = (candidateLessons || []).filter(
      l => !allExcludedIds.includes(l.id)
    );

    if (availableLessons.length === 0) {
      return new Response(
        JSON.stringify({ 
          recommendations: [], 
          message: 'No new lessons available for recommendation' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to select best lessons
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const profileContext = profile ? {
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
      preferredSubjects: profile.preferred_subjects,
      preferredDifficulty: profile.preferred_difficulty,
      averageScore: profile.average_quiz_score,
      improvementTrend: profile.improvement_trend,
    } : null;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are an educational AI recommending lessons for a student.
Select the best lessons based on the student's learning profile.
Balance between:
- Remediation (40%): Address weak areas
- Challenge (30%): Push strong areas further
- Interest (20%): Engage preferred subjects
- Exploration (10%): Introduce new topics

Provide clear, encouraging explanations for each recommendation.`
          },
          {
            role: 'user',
            content: `Student: Grade ${child.grade_level}
Profile: ${JSON.stringify(profileContext)}

Available Lessons:
${availableLessons.slice(0, 20).map((l, i) => 
  `${i + 1}. [${l.id}] "${l.title}" - ${l.subject} (${l.estimated_minutes || 15} min)`
).join('\n')}

Select the best ${count} lessons and explain why each is recommended.`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'recommend_lessons',
              description: 'Submit lesson recommendations',
              parameters: {
                type: 'object',
                properties: {
                  recommendations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        lessonId: { type: 'string' },
                        reason: { 
                          type: 'string', 
                          enum: ['remediation', 'challenge', 'interest', 'next_step', 'exploration'] 
                        },
                        explanation: { type: 'string' },
                        priority: { type: 'number', minimum: 1, maximum: 100 },
                        predictedDifficulty: { 
                          type: 'string', 
                          enum: ['too_easy', 'appropriate', 'challenging', 'too_hard'] 
                        },
                        predictedEngagement: { 
                          type: 'string', 
                          enum: ['low', 'medium', 'high'] 
                        }
                      },
                      required: ['lessonId', 'reason', 'explanation', 'priority']
                    }
                  }
                },
                required: ['recommendations']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'recommend_lessons' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Fallback to simple recommendation
      const fallbackRecs = availableLessons.slice(0, count).map((lesson, i) => ({
        lessonId: lesson.id,
        reason: i === 0 ? 'next_step' : 'exploration',
        explanation: `Continue your learning journey with ${lesson.title}`,
        priority: 80 - (i * 10),
        predictedDifficulty: 'appropriate',
        predictedEngagement: 'medium',
      }));

      const insertData = fallbackRecs.map(rec => {
        const lesson = availableLessons.find(l => l.id === rec.lessonId);
        return {
          child_id: childId,
          lesson_id: rec.lessonId,
          reason: rec.reason,
          reason_explanation: rec.explanation,
          priority: rec.priority,
          predicted_difficulty: rec.predictedDifficulty,
          predicted_engagement: rec.predictedEngagement,
          predicted_time_minutes: lesson?.estimated_minutes || 15,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
      });

      await supabase.from('lesson_recommendations').insert(insertData);

      return new Response(
        JSON.stringify({ 
          recommendations: insertData, 
          fallback: true,
          processingTimeMs: Date.now() - startTime 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const { recommendations: aiRecs } = JSON.parse(toolCall.function.arguments);

    // Validate and enrich recommendations
    const validRecs = aiRecs
      .filter((rec: any) => availableLessons.some(l => l.id === rec.lessonId))
      .slice(0, count);

    // Insert recommendations
    const insertData = validRecs.map((rec: any) => {
      const lesson = availableLessons.find(l => l.id === rec.lessonId);
      return {
        child_id: childId,
        lesson_id: rec.lessonId,
        reason: rec.reason,
        reason_explanation: rec.explanation,
        priority: rec.priority,
        predicted_difficulty: rec.predictedDifficulty || 'appropriate',
        predicted_engagement: rec.predictedEngagement || 'medium',
        predicted_time_minutes: lesson?.estimated_minutes || 15,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    });

    if (insertData.length > 0) {
      const { error: insertError } = await supabase
        .from('lesson_recommendations')
        .insert(insertData);

      if (insertError) {
        console.error('Failed to insert recommendations:', insertError);
      }
    }

    // Fetch full recommendation data with lesson details
    const { data: fullRecs } = await supabase
      .from('lesson_recommendations')
      .select(`
        *,
        lessons:lesson_id (
          id, title, subject, description, estimated_minutes, 
          points_value, thumbnail_url, grade_level
        )
      `)
      .eq('child_id', childId)
      .is('dismissed_at', null)
      .is('completed_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(count);

    return new Response(
      JSON.stringify({
        recommendations: fullRecs || [],
        processingTimeMs: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Recommendation generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Generation failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Day 10: Recommendations Hook

#### Task 2.3: Create useRecommendations Hook

**File:** `src/hooks/useRecommendations.tsx`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LessonRecommendationFull, SubjectArea, RecommendationFeedback } from '@/types/adaptive';
import { toast } from 'sonner';

interface UseRecommendationsOptions {
  count?: number;
  filterSubjects?: SubjectArea[];
  autoGenerate?: boolean;
}

interface RecommendationWithLesson extends LessonRecommendationFull {
  lesson: {
    id: string;
    title: string;
    subject: string;
    description: string | null;
    estimated_minutes: number;
    points_value: number;
    thumbnail_url: string | null;
    grade_level: number;
  };
}

export function useRecommendations(
  childId: string | null,
  options: UseRecommendationsOptions = {}
) {
  const { count = 5, filterSubjects = [], autoGenerate = true } = options;
  const queryClient = useQueryClient();

  // Fetch active recommendations
  const recommendationsQuery = useQuery({
    queryKey: ['recommendations', childId, filterSubjects],
    queryFn: async (): Promise<RecommendationWithLesson[]> => {
      if (!childId) return [];

      let query = supabase
        .from('lesson_recommendations')
        .select(`
          *,
          lesson:lessons!lesson_id (
            id, title, subject, description, estimated_minutes, 
            points_value, thumbnail_url, grade_level
          )
        `)
        .eq('child_id', childId)
        .is('dismissed_at', null)
        .is('completed_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('priority', { ascending: false })
        .limit(count);

      if (filterSubjects.length > 0) {
        // Filter by lesson subject (need to adjust query)
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        childId: row.child_id,
        lessonId: row.lesson_id,
        lessonTitle: row.lesson?.title || '',
        lessonSubject: row.lesson?.subject as SubjectArea,
        lessonDifficulty: 'intermediate',
        reason: row.reason,
        reasonExplanation: row.reason_explanation,
        priority: row.priority,
        predictedScore: row.predicted_score,
        predictedTimeMinutes: row.predicted_time_minutes,
        predictedDifficulty: row.predicted_difficulty,
        predictedEngagement: row.predicted_engagement,
        expiresAt: row.expires_at,
        dismissedAt: row.dismissed_at,
        completedAt: row.completed_at,
        wasHelpful: row.was_helpful,
        actualScore: row.actual_score,
        actualTimeMinutes: row.actual_time_minutes,
        createdAt: row.created_at,
        lesson: row.lesson,
      })) as RecommendationWithLesson[];
    },
    enabled: !!childId,
    staleTime: 60000, // 1 minute
  });

  // Generate new recommendations
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!childId) throw new Error('No child selected');

      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { childId, count, filterSubjects },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', childId] });
      toast.success('New recommendations generated!');
    },
    onError: (error) => {
      console.error('Failed to generate recommendations:', error);
      toast.error('Failed to generate recommendations');
    },
  });

  // Dismiss a recommendation
  const dismissMutation = useMutation({
    mutationFn: async ({ 
      recommendationId, 
      reason 
    }: { 
      recommendationId: string; 
      reason?: RecommendationFeedback['dismissalReason'];
    }) => {
      // Update recommendation
      const { error: updateError } = await supabase
        .from('lesson_recommendations')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', recommendationId);

      if (updateError) throw updateError;

      // Record feedback
      if (reason) {
        await supabase
          .from('recommendation_feedback')
          .insert({
            recommendation_id: recommendationId,
            child_id: childId,
            feedback_type: 'dismissed',
            dismissal_reason: reason,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', childId] });
    },
  });

  // Mark recommendation as completed with feedback
  const completeMutation = useMutation({
    mutationFn: async ({
      recommendationId,
      actualScore,
      actualTimeMinutes,
      wasHelpful,
      difficultyRating,
      enjoymentRating,
    }: {
      recommendationId: string;
      actualScore?: number;
      actualTimeMinutes?: number;
      wasHelpful?: boolean;
      difficultyRating?: 1 | 2 | 3 | 4 | 5;
      enjoymentRating?: 1 | 2 | 3 | 4 | 5;
    }) => {
      // Update recommendation
      const { error: updateError } = await supabase
        .from('lesson_recommendations')
        .update({
          completed_at: new Date().toISOString(),
          actual_score: actualScore,
          actual_time_minutes: actualTimeMinutes,
          was_helpful: wasHelpful,
        })
        .eq('id', recommendationId);

      if (updateError) throw updateError;

      // Record feedback
      await supabase
        .from('recommendation_feedback')
        .insert({
          recommendation_id: recommendationId,
          child_id: childId,
          feedback_type: 'completed',
          was_helpful: wasHelpful,
          difficulty_rating: difficultyRating,
          enjoyment_rating: enjoymentRating,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', childId] });
    },
  });

  // Auto-generate if no recommendations exist
  const hasRecommendations = (recommendationsQuery.data?.length || 0) > 0;
  const shouldAutoGenerate = autoGenerate && 
    !hasRecommendations && 
    !recommendationsQuery.isLoading && 
    !generateMutation.isPending &&
    childId;

  // Effect to auto-generate (only once)
  // This should be handled by a useEffect in the component using this hook

  return {
    // Data
    recommendations: recommendationsQuery.data || [],
    
    // State
    isLoading: recommendationsQuery.isLoading,
    isGenerating: generateMutation.isPending,
    error: recommendationsQuery.error,
    hasRecommendations,
    shouldAutoGenerate,
    
    // Actions
    generateRecommendations: () => generateMutation.mutate(),
    dismissRecommendation: (id: string, reason?: RecommendationFeedback['dismissalReason']) => 
      dismissMutation.mutate({ recommendationId: id, reason }),
    completeRecommendation: completeMutation.mutate,
    refetch: () => recommendationsQuery.refetch(),
  };
}
```

---

## 🎨 Phase 3: UI Integration

**Duration:** 5 days  
**Goal:** Surface recommendations in dashboards with age-adaptive design

### Day 11-12: RecommendedLessons Component

#### Task 3.1: Create RecommendedLessons Component

**File:** `src/components/learning/RecommendedLessons.tsx`

```typescript
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Clock, 
  Star, 
  X, 
  ChevronRight,
  Brain,
  Target,
  Heart,
  Compass,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { cn } from '@/lib/utils';

interface RecommendedLessonsProps {
  childId: string;
  gradeLevel: number;
  maxItems?: number;
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
}

const reasonIcons = {
  remediation: Brain,
  challenge: Target,
  interest: Heart,
  next_step: ChevronRight,
  exploration: Compass,
  review: BookOpen,
};

const reasonLabels = {
  remediation: 'Build Skills',
  challenge: 'Challenge',
  interest: 'You\'ll Love',
  next_step: 'Next Step',
  exploration: 'Discover',
  review: 'Review',
};

const reasonColors = {
  remediation: 'bg-amber-500/10 text-amber-600 border-amber-200',
  challenge: 'bg-purple-500/10 text-purple-600 border-purple-200',
  interest: 'bg-pink-500/10 text-pink-600 border-pink-200',
  next_step: 'bg-blue-500/10 text-blue-600 border-blue-200',
  exploration: 'bg-green-500/10 text-green-600 border-green-200',
  review: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

export function RecommendedLessons({
  childId,
  gradeLevel,
  maxItems = 5,
  showTitle = true,
  compact = false,
  className,
}: RecommendedLessonsProps) {
  const navigate = useNavigate();
  const { 
    recommendations, 
    isLoading, 
    isGenerating,
    hasRecommendations,
    shouldAutoGenerate,
    generateRecommendations,
    dismissRecommendation,
  } = useRecommendations(childId, { count: maxItems });

  // Age tier for styling
  const ageTier = gradeLevel <= 2 ? 'K-2' 
    : gradeLevel <= 5 ? '3-5' 
    : gradeLevel <= 8 ? '6-8' 
    : '9-12';

  // Auto-generate on first load if needed
  useEffect(() => {
    if (shouldAutoGenerate) {
      generateRecommendations();
    }
  }, [shouldAutoGenerate]);

  const handleStartLesson = (lessonId: string) => {
    navigate(`/child/lessons/${lessonId}`);
  };

  const handleDismiss = (e: React.MouseEvent, recommendationId: string) => {
    e.stopPropagation();
    dismissRecommendation(recommendationId, 'not_interested');
  };

  // Loading state
  if (isLoading || isGenerating) {
    return (
      <Card className={cn('', className)} data-tour="recommendations">
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Finding perfect lessons for you...
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!hasRecommendations) {
    return (
      <Card className={cn('', className)} data-tour="recommendations">
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommended for You
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground mb-4">
            {ageTier === 'K-2' ? (
              <p className="text-lg">Let's find some fun lessons! 🎉</p>
            ) : (
              <p>No recommendations yet. Complete more lessons to get personalized suggestions!</p>
            )}
          </div>
          <Button 
            onClick={generateRecommendations}
            disabled={isGenerating}
            variant="outline"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
            Get Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  // K-2: Large, colorful cards
  if (ageTier === 'K-2') {
    return (
      <Card className={cn('bg-gradient-to-br from-primary/5 to-secondary/5', className)} data-tour="recommendations">
        {showTitle && (
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-6 w-6 text-primary" />
              ✨ Just for You! ✨
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {recommendations.slice(0, 3).map((rec, index) => {
                const ReasonIcon = reasonIcons[rec.reason as keyof typeof reasonIcons] || Sparkles;
                return (
                  <motion.div
                    key={rec.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleStartLesson(rec.lessonId)}
                    className="relative cursor-pointer"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-primary/20 hover:border-primary/40">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-3 rounded-xl",
                            reasonColors[rec.reason as keyof typeof reasonColors]
                          )}>
                            <ReasonIcon className="h-8 w-8" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate">
                              {rec.lesson?.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {rec.reasonExplanation}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {rec.lesson?.estimated_minutes || 15} min
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                {rec.lesson?.points_value || 50} pts
                              </Badge>
                            </div>
                          </div>
                          <Button size="lg" className="shrink-0">
                            Start! 🚀
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <button
                      onClick={(e) => handleDismiss(e, rec.id)}
                      className="absolute -top-2 -right-2 p-1 bg-muted rounded-full hover:bg-destructive/20 transition-colors"
                      aria-label="Dismiss recommendation"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3-8: Balanced cards
  return (
    <Card className={cn('', className)} data-tour="recommendations">
      {showTitle && (
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended for You
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={generateRecommendations}
            disabled={isGenerating}
          >
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
          </Button>
        </CardHeader>
      )}
      <CardContent className={compact ? 'p-2' : 'p-4'}>
        <div className={cn("space-y-2", compact && "space-y-1")}>
          <AnimatePresence mode="popLayout">
            {recommendations.slice(0, maxItems).map((rec, index) => {
              const ReasonIcon = reasonIcons[rec.reason as keyof typeof reasonIcons] || Sparkles;
              return (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleStartLesson(rec.lessonId)}
                  className={cn(
                    "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                    "bg-card hover:bg-accent/50 border border-border/50 hover:border-primary/30",
                    "transition-all duration-200"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    reasonColors[rec.reason as keyof typeof reasonColors]
                  )}>
                    <ReasonIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate text-sm">
                        {rec.lesson?.title}
                      </h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {reasonLabels[rec.reason as keyof typeof reasonLabels]}
                      </Badge>
                    </div>
                    {!compact && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {rec.reasonExplanation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {rec.lesson?.estimated_minutes || 15}m
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <button
                    onClick={(e) => handleDismiss(e, rec.id)}
                    className="absolute -top-1 -right-1 p-0.5 bg-background border border-border rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                    aria-label="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Day 13: LearningProfileCard Component

#### Task 3.2: Create LearningProfileCard Component

**File:** `src/components/progress/LearningProfileCard.tsx`

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Brain,
  Target,
  Clock,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useLearningProfile } from '@/hooks/useLearningProfile';
import { cn } from '@/lib/utils';

interface LearningProfileCardProps {
  childId: string;
  gradeLevel: number;
  showStrengths?: boolean;
  showWeaknesses?: boolean;
  showMetrics?: boolean;
  compact?: boolean;
  className?: string;
}

const trendIcons = {
  accelerating: TrendingUp,
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

const trendColors = {
  accelerating: 'text-green-500',
  improving: 'text-emerald-500',
  stable: 'text-gray-500',
  declining: 'text-amber-500',
};

const speedLabels = {
  very_slow: 'Taking it Slow',
  slow: 'Steady Pace',
  medium: 'Right on Track',
  fast: 'Quick Learner',
  very_fast: 'Speed Demon! 🚀',
};

export function LearningProfileCard({
  childId,
  gradeLevel,
  showStrengths = true,
  showWeaknesses = true,
  showMetrics = true,
  compact = false,
  className,
}: LearningProfileCardProps) {
  const {
    profile,
    topStrengths,
    topWeaknesses,
    isLoading,
    isAnalyzing,
    needsRefresh,
    refreshProfile,
  } = useLearningProfile(childId);

  const ageTier = gradeLevel <= 2 ? 'K-2' 
    : gradeLevel <= 5 ? '3-5' 
    : gradeLevel <= 8 ? '6-8' 
    : '9-12';

  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium mb-2">Learning Profile</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {ageTier === 'K-2' 
              ? "Let's learn about how you learn best! 🧠" 
              : "Complete a few lessons to build your learning profile"}
          </p>
          <Button onClick={() => refreshProfile()} disabled={isAnalyzing}>
            <Sparkles className={cn("h-4 w-4 mr-2", isAnalyzing && "animate-spin")} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = trendIcons[profile.improvementTrend] || Minus;

  // K-2: Simplified, visual display
  if (ageTier === 'K-2') {
    return (
      <Card className={cn('bg-gradient-to-br from-primary/5 to-secondary/5', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Your Super Brain! 🧠
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Learning Speed Visual */}
          <div className="text-center p-4 bg-background/50 rounded-xl">
            <div className="text-4xl mb-2">
              {profile.learningSpeed === 'very_fast' ? '🚀' 
                : profile.learningSpeed === 'fast' ? '⚡' 
                : profile.learningSpeed === 'medium' ? '🌟' 
                : '🐢'}
            </div>
            <p className="font-medium text-lg">
              {speedLabels[profile.learningSpeed]}
            </p>
          </div>

          {/* Superpowers (Strengths) */}
          {showStrengths && topStrengths.length > 0 && (
            <div className="bg-green-500/10 p-4 rounded-xl">
              <h4 className="font-bold text-green-700 mb-2">✨ Your Superpowers!</h4>
              <div className="flex flex-wrap gap-2">
                {topStrengths.map((s, i) => (
                  <Badge key={i} className="bg-green-500/20 text-green-700 text-sm">
                    {s.subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Growing Areas */}
          {showWeaknesses && topWeaknesses.length > 0 && (
            <div className="bg-amber-500/10 p-4 rounded-xl">
              <h4 className="font-bold text-amber-700 mb-2">🌱 Growing Stronger!</h4>
              <div className="flex flex-wrap gap-2">
                {topWeaknesses.map((w, i) => (
                  <Badge key={i} className="bg-amber-500/20 text-amber-700 text-sm">
                    {w.subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Progress Stars */}
          {showMetrics && (
            <div className="flex justify-around text-center pt-2">
              <div>
                <div className="text-2xl">⭐</div>
                <div className="text-sm font-medium">{profile.totalLessonsCompleted}</div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </div>
              <div>
                <div className="text-2xl">🔥</div>
                <div className="text-sm font-medium">{profile.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl">🎯</div>
                <div className="text-sm font-medium">{Math.round(profile.averageQuizScore)}%</div>
                <div className="text-xs text-muted-foreground">Average</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // 3-12: Detailed profile view
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Learning Profile
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn("flex items-center gap-1", trendColors[profile.improvementTrend])}
          >
            <TrendIcon className="h-3 w-3" />
            {profile.improvementTrend}
          </Badge>
          {needsRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refreshProfile()}
              disabled={isAnalyzing}
            >
              <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4", compact && "space-y-2")}>
        {/* Quick Stats */}
        {showMetrics && (
          <div className={cn(
            "grid gap-3",
            compact ? "grid-cols-2" : "grid-cols-4"
          )}>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <div className="text-xl font-bold">{profile.totalLessonsCompleted}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <div className="text-xl font-bold">{Math.round(profile.averageQuizScore)}%</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <div className="text-xl font-bold">{profile.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <div className="text-xl font-bold">{profile.weeklyLessonVelocity.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Per Week</div>
            </div>
          </div>
        )}

        {/* Learning Speed */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Learning Pace</span>
          </div>
          <Badge variant="secondary">
            {speedLabels[profile.learningSpeed]}
          </Badge>
        </div>

        {/* Optimal Session Info */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Best Session Length</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ~{profile.optimalSessionLength} minutes
          </span>
        </div>

        {/* Strengths */}
        {showStrengths && topStrengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Strengths
            </h4>
            <div className="space-y-1.5">
              {topStrengths.map((strength, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-2 bg-green-500/5 rounded-md"
                >
                  <span className="text-sm">{strength.subject}</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={strength.confidenceScore * 100} 
                      className="w-16 h-1.5" 
                    />
                    <Badge variant="outline" className="text-xs">
                      {strength.masteryLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses / Focus Areas */}
        {showWeaknesses && topWeaknesses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-amber-500" />
              Focus Areas
            </h4>
            <div className="space-y-1.5">
              {topWeaknesses.map((weakness, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-2 bg-amber-500/5 rounded-md group cursor-pointer hover:bg-amber-500/10"
                >
                  <div>
                    <span className="text-sm">{weakness.subject}</span>
                    <p className="text-xs text-muted-foreground">
                      {weakness.struggleIndicators?.[0]}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Profile updated {new Date(profile.lastAnalyzedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
```

### Day 14-15: Dashboard Integration

#### Task 3.3: Update ChildDashboard with Recommendations

Add to existing `src/pages/ChildDashboard.tsx`:

```typescript
// Add imports
import { RecommendedLessons } from '@/components/learning/RecommendedLessons';
import { LearningProfileCard } from '@/components/progress/LearningProfileCard';

// In the dashboard JSX, add a recommendations section:
{/* AI Recommendations Section */}
<section className="col-span-full lg:col-span-2" data-tour="ai-recommendations">
  <RecommendedLessons
    childId={childId}
    gradeLevel={child.grade_level}
    maxItems={5}
    showTitle={true}
  />
</section>

{/* Learning Profile Card */}
<section data-tour="learning-profile">
  <LearningProfileCard
    childId={childId}
    gradeLevel={child.grade_level}
    showStrengths={true}
    showWeaknesses={true}
    showMetrics={true}
  />
</section>
```

#### Task 3.4: Update ParentDashboard with AI Insights

Add to `src/pages/ParentDashboard.tsx`:

```typescript
// Add to imports
import { LearningProfileCard } from '@/components/progress/LearningProfileCard';
import { useLearningProfile } from '@/hooks/useLearningProfile';

// In the parent dashboard, add per-child AI insights:
{selectedChild && (
  <section data-tour="child-ai-insights">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Learning Insights for {selectedChild.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LearningProfileCard
          childId={selectedChild.id}
          gradeLevel={selectedChild.grade_level}
          showStrengths={true}
          showWeaknesses={true}
          showMetrics={true}
        />
      </CardContent>
    </Card>
  </section>
)}
```

---

## 📊 Database Schemas Summary

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `learning_profiles` | Core profile per child | strengths, weaknesses, learning_speed, metrics |
| `learning_patterns` | Detected patterns | pattern_type, subject, confidence_score |
| `skill_mastery` | Per-skill tracking | mastery_percentage, practice_count, improvement_rate |
| `lesson_recommendations` | AI recommendations | reason, priority, predicted_*, expires_at |
| `recommendation_feedback` | Feedback tracking | feedback_type, ratings, dismissal_reason |
| `profile_analysis_history` | Analysis audit log | model_used, processing_time_ms, snapshot |

---

## 🧩 Component Specifications Summary

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `RecommendedLessons` | `src/components/learning/` | Display AI recommendations |
| `LearningProfileCard` | `src/components/progress/` | Show learning profile summary |
| `StrengthsWeaknessesChart` | `src/components/progress/` | Visual radar chart (Phase 3b) |
| `LearningVelocityIndicator` | `src/components/progress/` | Trend visualization (Phase 3b) |

### New Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useLearningProfile` | `src/hooks/` | Fetch/manage learning profile |
| `useRecommendations` | `src/hooks/` | Fetch/manage recommendations |

### New Edge Functions

| Function | Purpose |
|----------|---------|
| `analyze-learning-profile` | AI analysis of learning data |
| `generate-recommendations` | AI lesson recommendations |

### New Types

| Type | Location | Purpose |
|------|----------|---------|
| `LearningProfile` | `src/types/adaptive.ts` | Profile structure |
| `LessonRecommendationFull` | `src/types/adaptive.ts` | Recommendation structure |
| `SkillMastery` | `src/types/adaptive.ts` | Skill tracking |
| `RecommendationFeedback` | `src/types/adaptive.ts` | Feedback structure |

---

## 📈 Success Metrics

### Primary Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| **Recommendation Acceptance Rate** | >50% | Clicks on recommended lessons / Total shown | Week 1-4 |
| **Learning Improvement** | 15% higher scores | Compare AI-recommended vs random selection | Month 1-2 |
| **Engagement Increase** | 20% more lessons/week | Session analytics | Month 1-2 |
| **Parent Satisfaction** | 80% find valuable | Survey feedback | Month 1 |

### Secondary Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Profile Accuracy** | >75% | User agrees with detected strengths/weaknesses |
| **Recommendation Relevance** | >4.0/5.0 | User rating on helpfulness |
| **Dismissal Rate** | <30% | Low dismissal indicates good matching |
| **Return Rate** | >70% | Users return to check new recommendations |

### Technical Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Analysis Time** | <5s | Time to generate/refresh profile |
| **Recommendation Time** | <3s | Time to generate recommendations |
| **API Error Rate** | <1% | Edge function failure rate |
| **Data Freshness** | <24h | Maximum age of profile data |

---

## ⚠️ Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI rate limiting | Medium | High | Implement caching, fallback to rule-based |
| Slow analysis | Low | Medium | Async processing, progress indicators |
| Data quality | Medium | Medium | Minimum data requirements, graceful fallbacks |

### User Experience Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Irrelevant recommendations | Medium | High | Feedback loop, dismiss functionality |
| Overwhelming younger users | Low | Medium | Age-adaptive UI, progressive disclosure |
| Parent concerns about AI | Low | Medium | Transparency dashboard, opt-out option |

### Privacy Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data exposure | Low | Critical | RLS policies, encryption, audit logs |
| Profile misuse | Low | High | Parent-only access, data minimization |

---

## ✅ Implementation Checklist

### Phase 1: Learning Profile Engine
- [ ] Extend `src/types/adaptive.ts` with new types
- [ ] Create database migration for new tables
- [ ] Apply RLS policies
- [ ] Create `useLearningProfile` hook
- [ ] Create `ProfileAnalyzer` library
- [ ] Test profile generation locally

### Phase 2: AI Recommendation Engine
- [ ] Create `analyze-learning-profile` edge function
- [ ] Create `generate-recommendations` edge function
- [ ] Create `useRecommendations` hook
- [ ] Test AI integration with Lovable AI
- [ ] Implement fallback for rate limiting
- [ ] Add error handling and logging

### Phase 3: UI Integration
- [ ] Create `RecommendedLessons` component
- [ ] Create `LearningProfileCard` component
- [ ] Update ChildDashboard with recommendations
- [ ] Update ParentDashboard with AI insights
- [ ] Add data-tour attributes for onboarding
- [ ] Test age-adaptive rendering
- [ ] Performance optimization

### Post-Implementation
- [ ] Update documentation (CHANGELOG, COMPONENTS)
- [ ] Add success metrics tracking
- [ ] Beta tester feedback collection
- [ ] Iterate based on feedback

---

## 📝 Notes

- **Lovable AI Integration:** Uses `google/gemini-3-flash-preview` (default) for analysis
- **No External API Keys Required:** Lovable AI is pre-configured
- **Privacy First:** All data stays on platform, parent transparency maintained
- **Age-Adaptive:** UI automatically adjusts for K-2, 3-5, 6-8, 9-12 tiers
- **Feedback Loop:** Recommendation effectiveness improves with user feedback

---

**Document Version:** 1.0.0  
**Last Updated:** January 10, 2026  
**Next Review:** After Phase 1 completion
