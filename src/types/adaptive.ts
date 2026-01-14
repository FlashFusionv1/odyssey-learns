// Adaptive Learning Types for AI-Powered Learning Path

// ============================================
// BASE TYPES
// ============================================

export type LearningSpeed = 'very_slow' | 'slow' | 'medium' | 'fast' | 'very_fast';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type RecommendationReason = 'remediation' | 'challenge' | 'interest' | 'next_step' | 'review' | 'exploration';
export type PatternType = 'strength' | 'weakness' | 'preference' | 'velocity' | 'time_preference' | 'session_length';
export type SubjectArea = 'math' | 'reading' | 'science' | 'social_studies' | 'emotional_intelligence' | 'life_skills' | 'art' | 'music';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type HelpSeekingFrequency = 'never' | 'rarely' | 'sometimes' | 'often' | 'always';
export type ImprovementTrend = 'declining' | 'stable' | 'improving' | 'accelerating';
export type PredictedDifficulty = 'too_easy' | 'appropriate' | 'challenging' | 'too_hard';
export type EngagementLevel = 'low' | 'medium' | 'high';
export type FeedbackType = 'completed' | 'dismissed' | 'skipped' | 'reported';
export type DismissalReason = 'not_interested' | 'already_know' | 'too_hard' | 'too_easy' | 'other';

// ============================================
// LEGACY TYPES (for compatibility)
// ============================================

export interface LearningAnalytics {
  id: string;
  child_id: string;
  subject: string;
  skill_name: string;
  mastery_level: number;
  practice_count: number;
  success_rate: number;
  avg_time_seconds: number;
  last_practiced_at: string;
  difficulty_preference: DifficultyLevel;
  engagement_score: number;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  hint_usage: number;
  retry_count: number;
  frustration_signals: string[];
  engagement_score: number;
  difficulty_perceived: number;
}

export interface LessonRecommendation {
  lessonId: string;
  title: string;
  subject: string;
  difficulty: string;
  reason: string;
  matchScore: number;
}

// ============================================
// LEARNING PROFILE TYPES
// ============================================

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
  bestTimeOfDay: TimeOfDay;
  preferredDifficulty: DifficultyLevel;
  helpSeekingFrequency: HelpSeekingFrequency;
  
  // Velocity & Trajectory
  weeklyLessonVelocity: number; // lessons per week
  skillAcquisitionRate: number; // new skills per month
  improvementTrend: ImprovementTrend;
  
  // Metadata
  profileVersion: number;
  lastAnalyzedAt: string;
  dataPointsAnalyzed: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LEARNING PATTERN TYPES
// ============================================

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

// ============================================
// SKILL MASTERY TYPES
// ============================================

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

// ============================================
// LESSON RECOMMENDATION TYPES
// ============================================

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
  predictedDifficulty: PredictedDifficulty;
  predictedEngagement: EngagementLevel;
  
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

// ============================================
// FEEDBACK TYPES
// ============================================

export interface RecommendationFeedback {
  id: string;
  recommendationId: string;
  childId: string;
  
  // Feedback Type
  feedbackType: FeedbackType;
  
  // Completion Feedback
  wasHelpful: boolean | null;
  difficultyRating: 1 | 2 | 3 | 4 | 5 | null; // 1=too easy, 5=too hard
  enjoymentRating: 1 | 2 | 3 | 4 | 5 | null;
  
  // Dismissal Feedback
  dismissalReason: DismissalReason | null;
  
  createdAt: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

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

export interface RecommendationResponse {
  recommendations: LessonRecommendationFull[];
  metadata: {
    totalAvailable: number;
    generatedAt: string;
    expiresAt: string;
  };
}

// ============================================
// UI DISPLAY TYPES
// ============================================

export interface RecommendationCardData {
  id: string;
  lessonId: string;
  title: string;
  subject: SubjectArea;
  difficulty: DifficultyLevel;
  reason: RecommendationReason;
  reasonText: string;
  priority: number;
  predictedTimeMinutes: number;
  predictedEngagement: EngagementLevel;
  thumbnailUrl?: string;
}

export interface ProfileSummary {
  childId: string;
  childName: string;
  topStrengths: SubjectStrength[];
  topWeaknesses: SubjectWeakness[];
  learningSpeed: LearningSpeed;
  improvementTrend: ImprovementTrend;
  weeklyProgress: number; // lessons completed this week
  overallMastery: number; // 0-100
}

// ============================================
// HELPER TYPE GUARDS
// ============================================

export function isValidSubjectArea(value: string): value is SubjectArea {
  return ['math', 'reading', 'science', 'social_studies', 'emotional_intelligence', 'life_skills', 'art', 'music'].includes(value);
}

export function isValidDifficultyLevel(value: string): value is DifficultyLevel {
  return ['beginner', 'intermediate', 'advanced', 'expert'].includes(value);
}

export function isValidRecommendationReason(value: string): value is RecommendationReason {
  return ['remediation', 'challenge', 'interest', 'next_step', 'review', 'exploration'].includes(value);
}

// ============================================
// DISPLAY HELPERS
// ============================================

export const SUBJECT_LABELS: Record<SubjectArea, string> = {
  math: 'Math',
  reading: 'Reading',
  science: 'Science',
  social_studies: 'Social Studies',
  emotional_intelligence: 'Emotional Intelligence',
  life_skills: 'Life Skills',
  art: 'Art',
  music: 'Music',
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export const RECOMMENDATION_REASON_LABELS: Record<RecommendationReason, string> = {
  remediation: 'Strengthen Skills',
  challenge: 'New Challenge',
  interest: 'Based on Interests',
  next_step: 'Next in Path',
  review: 'Quick Review',
  exploration: 'Explore New Topics',
};

export const LEARNING_SPEED_LABELS: Record<LearningSpeed, string> = {
  very_slow: 'Taking Time',
  slow: 'Careful',
  medium: 'Balanced',
  fast: 'Quick',
  very_fast: 'Rapid',
};

export const IMPROVEMENT_TREND_LABELS: Record<ImprovementTrend, string> = {
  declining: 'Needs Support',
  stable: 'Steady Progress',
  improving: 'Growing',
  accelerating: 'Thriving',
};
