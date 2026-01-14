// Central Types Export
// Re-export specific types to avoid conflicts

// Core types with no conflicts
export * from './adaptive';
export * from './routes';
export * from './survey';

// Dashboard types - explicit exports to avoid conflicts with parent.ts
export type {
  DashboardStats,
  CelebrationType,
  CelebrationData,
  DashboardDailyQuest,
  CollaborationRequest,
  DailyLessonQuota,
  LessonAnalyticsData,
  TimelineDataPoint,
  LessonPerformanceMetrics,
  DailyLessonStats,
  StrugglingStudent,
  StudentOverallStats,
  SubjectBreakdownItem,
  StrengthItem,
  StruggleItem,
  RecommendationItem,
  ProgressDataPoint,
  AIInsightsData,
  PeerConnection,
  PeerSearchResult,
  SharedActivity,
  ActivityParticipant,
  LessonReviewData,
  ReviewerPerformanceData,
  SeedResult,
  BetaMetrics,
  CreatorStats,
  LessonStats,
  CreatorActivity,
  PersonalProgress,
} from './dashboard';

// Dashboard types with aliases to avoid parent.ts conflicts
export type { 
  WeeklyReport as DashboardWeeklyReport,
  ParentDashboardStats as DashboardParentStats,
} from './dashboard';

// PWA types
export * from './pwa';

// Child types (exclude overlapping exports)
export type {
  AvatarConfig,
  Child,
  ChildProgress,
  SubjectProgress,
  RecentActivity,
  ChildRoom,
  PlacedDecoration,
  RoomDecoration,
  ChildBadge,
  Badge,
  BadgeUnlockCriteria,
} from './child';
export { getGradeLevelLabel, calculateLevel, getPointsToNextLevel } from './child';

// Lesson types (exclude overlapping exports)
export type {
  Lesson,
  LessonDifficulty,
  LessonReviewStatus,
  LessonProgress,
  LessonCompletion,
  LessonFilter,
  ChildGeneratedLesson,
  ShareStatus,
  LessonSubject,
  HighSchoolSubject,
} from './lesson';
export {
  LESSON_SUBJECTS,
  HIGH_SCHOOL_SUBJECTS,
  SUBJECT_COLORS,
  getSubjectColor,
  getDifficultyColor,
  estimateReadingTime,
} from './lesson';

// Parent types (no conflicts)
export * from './parent';

// Video types (exclude overlapping exports)
export type {
  ChapterMarker,
  QuizTimestamp,
  VideoLesson,
  VideoWatchProgress,
  VideoInteractionEvent,
  VideoQuizResponse,
  VideoAnalytics,
  VideoPlayerProps,
  VideoCardProps,
  VideoSubject,
  VideoDifficulty,
} from './video';
export {
  VIDEO_SUBJECTS,
  VIDEO_DIFFICULTIES,
  GRADE_LEVEL_LABELS,
  formatDuration,
  getAgeTier,
} from './video';

// Gamification types (exclude overlapping exports)
export type {
  Achievement,
  AchievementCategory,
  AchievementTier,
  UnlockCriteria,
  CriteriaType,
  UnlockCondition,
  StudentAchievement,
  PowerUp,
  PowerUpEffectType,
  ChildPowerUp,
  Streak,
  DailyQuest,
  Reward,
  RewardType,
  RewardRedemption,
  Leaderboard,
  LeaderboardEntry,
  XPEvent,
  XPEventType,
  LevelInfo,
} from './gamification';
export {
  LEVEL_THRESHOLDS,
  getLevelFromXP,
  getXPProgressInLevel,
  getTierColor,
  getCategoryIcon,
} from './gamification';

// Re-export common types that exist in multiple files with aliases
export type { QuizQuestion as LessonQuizQuestion, QuizAnswer as LessonQuizAnswer } from './lesson';
export type { QuizQuestion as VideoQuizQuestion, QuizAnswer as VideoQuizAnswer } from './video';
