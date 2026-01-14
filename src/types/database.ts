// Database Row Types for Inner Odyssey
// These types match the Supabase database schema exactly
// Use these for useState when fetching from Supabase

import type { Database, Json } from "@/integrations/supabase/types";

// ===== Supabase Table Row Types =====

export type ChildRow = Database['public']['Tables']['children']['Row'];
export type LessonRow = Database['public']['Tables']['lessons']['Row'];
export type ChildGeneratedLessonRow = Database['public']['Tables']['child_generated_lessons']['Row'];
export type CollaborationRequestRow = Database['public']['Tables']['collaboration_requests']['Row'];
export type DailyLessonQuotaRow = Database['public']['Tables']['daily_lesson_quota']['Row'];
export type WeeklyReportRow = Database['public']['Tables']['parent_weekly_reports']['Row'];
export type LessonAnalyticsRow = Database['public']['Tables']['lesson_analytics']['Row'];
export type DailyLessonStatsRow = Database['public']['Tables']['daily_lesson_stats']['Row'];

// ===== Extended Types with Joins =====

export interface CollaborationRequestWithChildren extends CollaborationRequestRow {
  requester?: { name: string };
  recipient?: { name: string };
}

export interface WeeklyReportWithChild extends WeeklyReportRow {
  children?: { name: string };
}

// ===== Dashboard Specific Types =====

export interface DashboardStats {
  completed: number;
  streak: number;
}

export interface DashboardDailyQuest {
  lesson_id: string;
  bonus_points: number;
  lesson: LessonRow | null;
}

export type CelebrationType = 'lesson' | 'badge' | 'level' | 'streak' | 'quest' | 'points';

export interface CelebrationData {
  type: CelebrationType;
  title: string;
  message: string;
  points?: number;
}

// ===== Analytics Types =====

export interface TimelineDataPoint {
  date: string;
  views: number;
  completions: number;
  avgScore: number;
}

export interface LessonPerformanceMetrics {
  totalAttempts: number;
  completionRate: number;
  averageScore: number;
  averageTimeMinutes: number;
  difficultyRating: number;
  studentsSatisfaction: number;
}

export interface StrugglingStudent {
  id: string;
  name: string;
  attempts: number;
  lastScore: number;
  lastAttempt: string;
}

// ===== Student Performance Types =====

export interface StudentOverallStats {
  totalLessonsCompleted: number;
  totalPointsEarned: number;
  averageQuizScore: number;
  totalTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

export interface SubjectBreakdownItem {
  subject: string;
  lessonsCompleted: number;
  averageScore: number;
  totalTime: number;
  mastery: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface StrengthItem {
  subject: string;
  skill: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface StruggleItem {
  subject: string;
  topic: string;
  attempts: number;
  lastScore: number;
  recommendedAction: string;
}

export interface RecommendationItem {
  type: 'lesson' | 'practice' | 'review' | 'challenge';
  title: string;
  subject: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  lessonId?: string;
}

export interface ProgressDataPoint {
  date: string;
  score: number;
  lessonsCompleted: number;
  pointsEarned: number;
}

// ===== AI Insights =====

export interface AIInsightsData {
  summary: string;
  learningStyle: string;
  strengths: string[];
  areasForGrowth: string[];
  recommendations: {
    type: string;
    title: string;
    description: string;
  }[];
  emotionalInsights: {
    dominantMood: string;
    moodTrend: string;
    suggestions: string[];
  };
  nextSteps: string[];
  generatedAt: string;
}

// ===== Peer Connections =====

export interface PeerSearchResult {
  id: string;
  name: string;
  grade_level: number;
  avatar_config: Json | null;
}

// ===== Review Types =====

export interface ReviewerPerformanceData {
  reviewer_id: string;
  reviewer_name: string;
  total_reviews: number;
  avg_quality_score: number;
  avg_review_time_minutes: number;
  approval_rate: number;
  reviews_this_week: number;
}

// ===== Seed Result =====

export interface SeedResult {
  success: boolean;
  lessonsCreated: number;
  errors: string[];
  details?: Record<string, unknown>;
}

// ===== Beta Analytics =====

export interface BetaMetrics {
  totalUsers: number;
  activeUsers: number;
  totalChildren: number;
  totalLessons: number;
  totalFeedback: number;
  averageSessionMinutes: number;
  retentionRate: number;
  npsScore: number;
  feedbackByType: Record<string, number>;
  userGrowth: { date: string; count: number }[];
}

// ===== Creator Dashboard =====

export interface CreatorStats {
  totalLessons: number;
  totalShares: number;
  totalViews: number;
  approvalRate: number;
  totalPoints: number;
  rank: number;
}

export interface LessonStats extends ChildGeneratedLessonRow {
  views: number;
  shares: number;
  averageRating: number;
}

export interface CreatorActivity {
  id: string;
  type: 'lesson_created' | 'lesson_shared' | 'lesson_approved' | 'points_earned';
  title: string;
  description: string;
  points?: number;
  timestamp: string;
}

// ===== Personal Progress (K2) =====

export interface PersonalProgress {
  lessonsCompleted: number;
  pointsEarned: number;
  streakDays: number;
  badgesEarned: number;
  recentAchievements: string[];
  encouragement: string;
}
