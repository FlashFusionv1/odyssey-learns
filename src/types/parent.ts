// Parent Types for Inner Odyssey

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_admin: boolean | null;
  is_beta_tester: boolean | null;
  onboarding_completed: boolean | null;
  notification_preferences: NotificationPreferences | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'parent' | 'teacher' | 'admin';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  achievementAlerts: boolean;
  activityAlerts: boolean;
}

export interface ParentNotification {
  id: string;
  parent_id: string;
  child_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export type NotificationType = 
  | 'achievement' 
  | 'lesson_complete' 
  | 'streak_milestone' 
  | 'weekly_report' 
  | 'screen_time_alert'
  | 'new_badge'
  | 'quest_complete'
  | 'parent_message'
  | 'system';

export interface NotificationData {
  childName?: string;
  achievementName?: string;
  lessonTitle?: string;
  score?: number;
  streakDays?: number;
  badgeName?: string;
  link?: string;
  [key: string]: unknown;
}

export interface ParentChildMessage {
  id: string;
  parent_id: string;
  child_id: string;
  sender_type: 'parent' | 'child';
  message_type: MessageType;
  message_text: string;
  read_at: string | null;
  created_at: string;
}

export type MessageType = 'encouragement' | 'question' | 'celebration' | 'suggestion';

export interface WeeklyReport {
  id: string;
  child_id: string;
  parent_id: string;
  week_start: string;
  week_end: string;
  report_data: WeeklyReportData;
  generated_at: string;
  sent_at: string | null;
}

export interface WeeklyReportData {
  totalLessonsCompleted: number;
  totalTimeSpentMinutes: number;
  averageScore: number;
  subjectsStudied: string[];
  streakDays: number;
  pointsEarned: number;
  badgesEarned: string[];
  topStrengths: string[];
  areasForImprovement: string[];
  comparisonToPreviousWeek: {
    lessonsChange: number;
    timeChange: number;
    scoreChange: number;
  };
  recommendations: string[];
}

export interface ScreenTimeSettings {
  isEnabled: boolean;
  dailyLimitMinutes: number;
  allowedStartTime: string; // "08:00"
  allowedEndTime: string;   // "20:00"
  weekendExtensionMinutes: number;
  breakReminderMinutes: number;
}

export interface ParentDashboardStats {
  totalChildren: number;
  totalLessonsCompleted: number;
  averageScore: number;
  totalTimeSpentMinutes: number;
  activeStreaks: number;
  unreadNotifications: number;
  pendingApprovals: number;
}

export interface ChildSummary {
  id: string;
  name: string;
  gradeLevel: number;
  avatarConfig: Record<string, unknown> | null;
  totalPoints: number;
  currentStreak: number;
  lastActivityDate: string | null;
  recentAchievements: string[];
  subjectProgress: {
    subject: string;
    progress: number;
  }[];
}

// Consent and Compliance
export interface ParentalConsent {
  id: string;
  parent_id: string;
  child_id: string;
  consent_type: ConsentType;
  consent_given: boolean;
  consent_date: string;
  ip_address: string | null;
  revoked_at: string | null;
}

export type ConsentType = 
  | 'data_collection' 
  | 'data_sharing' 
  | 'marketing' 
  | 'third_party' 
  | 'analytics';

export interface DataExportRequest {
  id: string;
  parent_id: string;
  child_id: string | null;
  export_format: 'json' | 'csv';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url: string | null;
  expires_at: string | null;
  created_at: string;
  completed_at: string | null;
}

// Helper functions
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    achievement: '🏆',
    lesson_complete: '📚',
    streak_milestone: '🔥',
    weekly_report: '📊',
    screen_time_alert: '⏰',
    new_badge: '🎖️',
    quest_complete: '⭐',
    parent_message: '💬',
    system: '🔔',
  };
  return icons[type] || '🔔';
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
