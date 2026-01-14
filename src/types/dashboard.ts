// Dashboard Types for Inner Odyssey
// Centralized types for dashboard components to eliminate 'any' usage

import type { Child, ChildBadge, AvatarConfig } from './child';
import type { Lesson, ChildGeneratedLesson, QuizQuestion } from './lesson';
import type { DailyQuest as GamificationDailyQuest } from './gamification';

// ===== Dashboard Stats =====

export interface DashboardStats {
  completed: number;
  streak: number;
}

export interface ParentDashboardStats {
  totalChildren: number;
  lessonsThisWeek: number;
  pendingRewards: number;
}

// ===== Celebration Types =====

export type CelebrationType = 'lesson' | 'badge' | 'level' | 'streak' | 'quest' | 'points';

export interface CelebrationData {
  type: CelebrationType;
  title: string;
  message: string;
  points?: number;
  badge?: ChildBadge;
}

// ===== Daily Quest =====

export interface DashboardDailyQuest {
  lesson_id: string;
  bonus_points: number;
  lesson: Lesson | null;
}

// ===== Weekly Reports =====

export interface WeeklyReport {
  id: string;
  child_id: string;
  parent_id: string;
  week_start_date: string;
  week_end_date: string;
  lessons_completed: number;
  total_time_minutes: number;
  points_earned: number;
  streak_days: number;
  subjects_covered: string[];
  quiz_average_score: number | null;
  emotional_logs_count: number;
  highlights: string[];
  areas_for_improvement: string[];
  created_at: string;
  children?: {
    name: string;
  };
}

// ===== Collaboration Requests =====

export interface CollaborationRequest {
  id: string;
  requester_child_id: string;
  recipient_child_id: string;
  lesson_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  parent_approved: boolean | null;
  approved_at: string | null;
  created_at: string | null;
  requester?: {
    name: string;
  };
  recipient?: {
    name: string;
  };
}

// ===== Daily Quota =====

export interface DailyLessonQuota {
  id: string;
  child_id: string;
  quota_date: string;
  platform_lessons_completed: number | null;
  custom_lessons_completed: number | null;
  bonus_lessons_granted: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// ===== Analytics Types =====

export interface LessonAnalyticsData {
  id: string;
  lesson_id: string;
  total_views: number;
  total_saves: number;
  total_shares: number;
  avg_time_seconds: number;
  unique_viewers: number;
  engagement_score: number;
  created_at: string;
  updated_at: string;
}

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

export interface DailyLessonStats {
  id: string;
  lesson_id: string | null;
  stat_date: string;
  students_attempted: number | null;
  students_completed: number | null;
  avg_score: number | null;
  avg_time_minutes: number | null;
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

export interface PeerConnection {
  id: string;
  child_id: string;
  connected_child_id: string;
  status: 'pending' | 'connected' | 'blocked';
  connected_since: string | null;
  created_at: string;
  connected_child?: {
    id: string;
    name: string;
    grade_level: number;
    avatar_config: AvatarConfig | null;
  };
}

export interface PeerSearchResult {
  id: string;
  name: string;
  grade_level: number;
  avatar_config: AvatarConfig | null;
}

// ===== Shared Activities =====

export interface SharedActivity {
  id: string;
  creator_child_id: string;
  activity_type: 'study_group' | 'challenge' | 'collaboration';
  title: string;
  description: string;
  subject: string | null;
  max_participants: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  expires_at: string | null;
  participants?: ActivityParticipant[];
  creator?: {
    name: string;
    avatar_config: AvatarConfig | null;
  };
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  child_id: string;
  joined_at: string;
  status: 'joined' | 'left' | 'removed';
  contribution: Record<string, unknown> | null;
  child?: {
    name: string;
    avatar_config: AvatarConfig | null;
  };
}

// ===== Review Types =====

export interface LessonReviewData {
  id: string;
  lesson_id: string;
  reviewer_id: string;
  review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  feedback: string | null;
  quality_score: number | null;
  accuracy_score: number | null;
  engagement_score: number | null;
  priority: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// ===== Reviewer Performance =====

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

export interface LessonStats extends ChildGeneratedLesson {
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
