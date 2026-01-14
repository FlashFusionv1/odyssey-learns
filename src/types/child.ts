// Child and Profile Types

export interface AvatarConfig {
  skinColor?: string;
  hairStyle?: string;
  hairColor?: string;
  eyeColor?: string;
  outfit?: string;
  accessories?: string[];
  background?: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  grade_level: number;
  avatar_config: AvatarConfig | null;
  total_points: number | null;
  daily_quest_id: string | null;
  quest_completed_at: string | null;
  quest_bonus_points: number | null;
  challenge_mode_enabled: boolean | null;
  screen_time_enabled: boolean | null;
  daily_screen_time_limit_minutes: number | null;
  weekly_report_enabled: boolean | null;
  pin_hash: string | null;
  created_at: string | null;
  deleted_at: string | null;
  deletion_scheduled_at: string | null;
  deletion_reason: string | null;
}

export interface ChildProgress {
  childId: string;
  totalLessonsCompleted: number;
  totalPointsEarned: number;
  currentStreak: number;
  longestStreak: number;
  averageQuizScore: number;
  totalTimeSpentMinutes: number;
  subjectProgress: SubjectProgress[];
  recentActivity: RecentActivity[];
}

export interface SubjectProgress {
  subject: string;
  lessonsCompleted: number;
  averageScore: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastActivityDate: string;
}

export interface RecentActivity {
  id: string;
  type: 'lesson' | 'video' | 'quiz' | 'activity';
  title: string;
  subject: string;
  score?: number;
  completedAt: string;
  timeSpentMinutes: number;
}

export interface ChildRoom {
  id: string;
  child_id: string | null;
  room_name: string | null;
  owned_decoration_ids: string[] | null;
  placed_decorations: PlacedDecoration[] | null;
  created_at: string | null;
}

export interface PlacedDecoration {
  decorationId: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
}

export interface RoomDecoration {
  id: string;
  name: string;
  category: string;
  svgData: string;
  pointsCost: number;
  isDefault: boolean;
}

export interface ChildBadge {
  id: string;
  child_id: string;
  badge_id: string;
  unlocked_at: string;
  badge: Badge;
}

export interface Badge {
  id: string;
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  points_reward: number | null;
  unlock_criteria: BadgeUnlockCriteria;
  is_active: boolean | null;
  created_at: string | null;
}

export interface BadgeUnlockCriteria {
  type: 'lessons_completed' | 'points_earned' | 'streak_days' | 'subject_mastery' | 'special';
  threshold?: number;
  subject?: string;
  description?: string;
}

export interface ChildPowerUp {
  id: string;
  child_id: string | null;
  power_up_id: string | null;
  quantity: number | null;
  acquired_at: string | null;
  power_up: PowerUp;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect_type: string;
  effect_value: number;
  points_cost: number;
  is_active: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  subject: string;
  bonusPoints: number;
  expiresAt: string;
  isCompleted: boolean;
}

// Helper functions
export function getAgeTier(gradeLevel: number): 'K-2' | '3-5' | '6-8' | '9-12' {
  if (gradeLevel <= 2) return 'K-2';
  if (gradeLevel <= 5) return '3-5';
  if (gradeLevel <= 8) return '6-8';
  return '9-12';
}

export function getGradeLevelLabel(gradeLevel: number): string {
  if (gradeLevel === 0) return 'Kindergarten';
  return `Grade ${gradeLevel}`;
}

export function calculateLevel(totalPoints: number): number {
  // Level up every 500 points
  return Math.floor(totalPoints / 500) + 1;
}

export function getPointsToNextLevel(totalPoints: number): number {
  const currentLevel = calculateLevel(totalPoints);
  const nextLevelPoints = currentLevel * 500;
  return nextLevelPoints - totalPoints;
}
