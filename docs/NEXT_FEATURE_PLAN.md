# Next Feature Plan: AI-Powered Adaptive Learning Path

**Date:** January 10, 2026  
**Priority:** High  
**Estimated Effort:** 2-3 weeks  
**Status:** ✅ COMPLETE (Phases 1-3)
**Completed:** January 15, 2026

---

## 📋 Executive Summary

Based on the project roadmap analysis and knowledge base review, the **AI-Powered Adaptive Learning Path** is the next logical feature to implement. This aligns with:

1. **Knowledge Base Priority:** Listed as Feature #1 in `FEATURES_PLAN.md`
2. **Roadmap Alignment:** AI Content Generation targeted for Phase 2 (Month 4)
3. **Recent Implementation:** Learning Progress Dashboard provides data foundation
4. **User Value:** Addresses diverse learning speeds and personalization needs
5. **Technical Readiness:** Lovable AI integration already available (gemini-2.5-pro, gpt-5)

---

## 🎯 Feature Overview

### What It Does

An AI system that:
1. **Analyzes** each child's learning patterns, strengths, and weaknesses
2. **Generates** personalized lesson recommendations
3. **Adapts** difficulty automatically based on performance
4. **Predicts** which lessons will challenge vs. bore each child
5. **Tracks** learning velocity and trajectory

### Key Differentiators

- Uses Lovable AI (no API key needed)
- Age-tier specific recommendations
- Parent dashboard integration
- Real-time adaptation

---

## 🏗️ Implementation Plan

### Phase 1: Learning Profile Engine (Week 1) ✅ COMPLETE
**Goal:** Build the data analysis foundation

#### Step 1: Create Learning Profile Types
```typescript
// src/types/adaptive.ts
interface LearningProfile {
  childId: string;
  strengths: SubjectStrength[];      // ['reading:advanced', 'science:intermediate']
  weaknesses: SubjectWeakness[];     // ['math:fractions', 'writing:essays']
  learningSpeed: 'fast' | 'medium' | 'slow';
  preferredSubjects: string[];
  completionRate: number;            // 0-100%
  averageScore: number;              // 0-100
  strugglingTopics: string[];
  optimalSessionLength: number;      // minutes
  bestTimeOfDay: string;             // 'morning' | 'afternoon' | 'evening'
  lastUpdated: string;
}
```

#### Step 2: Create Profile Analysis Hook
- File: `src/hooks/useLearningProfile.tsx`
- Fetches `user_progress`, `activity_sessions`, `lesson_notes`
- Computes strengths/weaknesses from quiz scores
- Calculates learning speed from completion times
- Identifies struggling topics from retry patterns

#### Step 3: Database Schema Updates
```sql
-- Learning patterns storage
CREATE TABLE learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'strength', 'weakness', 'preference', 'velocity'
  subject TEXT,
  topic TEXT,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  data JSONB,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, pattern_type, subject, topic)
);

-- Lesson recommendations
CREATE TABLE lesson_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'remediation', 'challenge', 'interest', 'next_step'
  priority INTEGER DEFAULT 50, -- 1-100
  predicted_score DECIMAL(5,2),
  predicted_time_minutes INTEGER,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Children can view own patterns"
ON learning_patterns FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));

CREATE POLICY "Children can view own recommendations"
ON lesson_recommendations FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE parent_id = auth.uid()
));
```

### Phase 2: AI Recommendation Engine (Week 2) ✅ COMPLETE
**Goal:** Generate personalized recommendations using Lovable AI

#### Step 4: Create Edge Function for AI Analysis
- File: `supabase/functions/analyze-learning-profile/index.ts`
- Uses Lovable AI (gemini-2.5-pro)
- Analyzes progress data, generates profile
- Returns strengths, weaknesses, recommendations

#### Step 5: Create Recommendation Algorithm
```typescript
// src/lib/ai/recommendationEngine.ts
export class RecommendationEngine {
  async generateRecommendations(profile: LearningProfile): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // 1. Address weak areas (40% of recommendations)
    const remediationLessons = await this.findRemediationLessons(
      profile.weaknesses,
      profile.learningSpeed
    );
    
    // 2. Challenge strong areas (30% of recommendations)
    const challengeLessons = await this.findChallengeLessons(profile.strengths);
    
    // 3. Explore interests (20% of recommendations)
    const explorationLessons = await this.findExplorationLessons(
      profile.preferredSubjects
    );
    
    // 4. Next logical step (10% of recommendations)
    const progressionLessons = await this.findProgressionLessons(profile);
    
    return this.prioritize([
      ...remediationLessons,
      ...challengeLessons,
      ...explorationLessons,
      ...progressionLessons
    ]);
  }
}
```

#### Step 6: Create Difficulty Prediction Model
- Uses historical data to predict lesson difficulty for each child
- Considers: previous scores, time spent, subject affinity
- Returns: 'easy' | 'appropriate' | 'challenging'

### Phase 3: UI Integration (Week 3) ✅ COMPLETE
**Goal:** Surface recommendations in child and parent dashboards

#### Step 7: Create RecommendedLessons Component
- File: `src/components/learning/RecommendedLessons.tsx`
- Card carousel with AI-recommended lessons
- Shows reason for recommendation
- Age-adaptive design (K-2: large cards, 9-12: compact list)

#### Step 8: Create LearningProfileCard Component
- File: `src/components/progress/LearningProfileCard.tsx`
- Visual display of strengths/weaknesses
- Radar chart for subject mastery
- Trend indicators (improving/declining)

#### Step 9: Update ChildDashboard
- Add "Recommended for You" section with top 3-5 lessons
- Add `data-tour="recommendations"` for onboarding
- Link to full recommendations page

#### Step 10: Update ParentDashboard
- Add AI Insights enhancement with learning profile
- Add "Focus Areas" section showing weaknesses
- Add "Celebrate" section highlighting strengths

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Recommendation acceptance rate | >50% | Clicks on recommended lessons / Total shown |
| Learning improvement | 15% higher scores | Compare AI-recommended vs. random selection |
| Engagement increase | 20% more lessons/week | Session analytics |
| Parent satisfaction | 80% find valuable | Survey feedback |

---

## 🔐 Privacy & Safety Considerations

1. **Data Minimization:** Only analyze learning-related data
2. **Parent Transparency:** Show all data used for recommendations
3. **No External Sharing:** All analysis stays on platform
4. **Age-Appropriate:** Recommendations respect grade level
5. **Opt-Out Available:** Parents can disable AI recommendations

---

## 📁 Files to Create

### New Components
- `src/components/learning/RecommendedLessons.tsx`
- `src/components/progress/LearningProfileCard.tsx`
- `src/components/progress/StrengthsWeaknessesChart.tsx`
- `src/components/progress/LearningVelocityIndicator.tsx`

### New Hooks
- `src/hooks/useLearningProfile.tsx`
- `src/hooks/useRecommendations.tsx`

### New Libraries
- `src/lib/ai/recommendationEngine.ts`
- `src/lib/ai/profileAnalyzer.ts`
- `src/lib/ai/difficultyPredictor.ts`

### Edge Functions
- `supabase/functions/analyze-learning-profile/index.ts`
- `supabase/functions/generate-recommendations/index.ts`

### Database Migrations
- Learning patterns table
- Lesson recommendations table
- RLS policies

---

## 🔗 Dependencies on Recent Work

This feature builds directly on recently implemented work:

1. **Learning Progress Dashboard** (last 5 turns)
   - `useChildProgressAnalytics` provides data foundation
   - Progress charts can display AI insights
   - Achievement tracking informs recommendations

2. **Onboarding System** (last 5 turns)
   - Feature spotlight can highlight recommendations
   - Tutorial can explain personalized learning

3. **Leaderboard** (last 5 turns)
   - Can show "Most Improved" based on AI analysis

---

## 🚀 Quick Start Implementation

To begin implementation, run:

```
Implement the AI-Powered Adaptive Learning Path feature following the plan in docs/NEXT_FEATURE_PLAN.md. Start with Phase 1: Learning Profile Engine.
```

---

## 📝 Notes

- Uses Lovable AI (no external API keys needed)
- Leverages existing progress data
- Age-adaptive UI already established
- Aligns with beta testing goals from knowledge base
