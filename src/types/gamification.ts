// Gamification Types for Inner Odyssey

export interface Achievement {
  id: string;
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier | null;
  points_reward: number | null;
  unlock_criteria: UnlockCriteria;
  is_active: boolean | null;
  created_at: string | null;
}

export type AchievementCategory = 
  | 'academic' 
  | 'streak' 
  | 'social' 
  | 'creative' 
  | 'emotional' 
  | 'special';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface UnlockCriteria {
  type: CriteriaType;
  threshold?: number;
  subject?: string;
  description?: string;
  conditions?: UnlockCondition[];
}

export type CriteriaType = 
  | 'lessons_completed' 
  | 'points_earned' 
  | 'streak_days' 
  | 'subject_mastery' 
  | 'quiz_score'
  | 'videos_watched'
  | 'special';

export interface UnlockCondition {
  field: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
  value: number | string;
}

export interface StudentAchievement {
  id: string;
  child_id: string;
  badge_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect_type: PowerUpEffectType;
  effect_value: number;
  points_cost: number;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string | null;
}

export type PowerUpEffectType = 
  | 'xp_boost' 
  | 'hint_unlock' 
  | 'time_freeze' 
  | 'skip_question'
  | 'double_points'
  | 'streak_protect';

export interface ChildPowerUp {
  id: string;
  child_id: string | null;
  power_up_id: string | null;
  quantity: number | null;
  acquired_at: string | null;
  power_up?: PowerUp;
}

export interface Streak {
  childId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakFreezeAvailable: boolean;
  streakFreezeUsedAt: string | null;
}

export interface DailyQuest {
  id: string;
  child_id: string;
  lesson_id: string;
  title: string;
  description: string;
  subject: string;
  bonus_points: number;
  expires_at: string;
  completed_at: string | null;
  is_completed: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  value: string | number;
  points_cost: number;
  icon: string;
  is_available: boolean;
}

export type RewardType = 'avatar_item' | 'room_decoration' | 'power_up' | 'screen_time' | 'custom';

export interface RewardRedemption {
  id: string;
  child_id: string;
  reward_id: string;
  redeemed_at: string;
  fulfilled_at: string | null;
  status: 'pending' | 'approved' | 'fulfilled' | 'rejected';
  parent_notes: string | null;
}

export interface Leaderboard {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  childId: string;
  displayName: string;
  avatarConfig: Record<string, unknown> | null;
  score: number;
  isCurrentUser: boolean;
}

export interface XPEvent {
  id: string;
  child_id: string;
  event_type: XPEventType;
  xp_amount: number;
  source_id: string | null;
  source_type: string | null;
  created_at: string;
}

export type XPEventType = 
  | 'lesson_complete' 
  | 'quiz_perfect' 
  | 'streak_bonus' 
  | 'quest_complete'
  | 'video_complete'
  | 'achievement_unlock'
  | 'daily_login'
  | 'power_up_use';

// Level System
export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  icon: string;
}

export const LEVEL_THRESHOLDS: LevelInfo[] = [
  { level: 1, title: 'Curious Explorer', minXP: 0, maxXP: 499, icon: '🌱' },
  { level: 2, title: 'Learning Adventurer', minXP: 500, maxXP: 1499, icon: '🌿' },
  { level: 3, title: 'Knowledge Seeker', minXP: 1500, maxXP: 2999, icon: '🌳' },
  { level: 4, title: 'Skill Builder', minXP: 3000, maxXP: 4999, icon: '⭐' },
  { level: 5, title: 'Rising Star', minXP: 5000, maxXP: 7499, icon: '🌟' },
  { level: 6, title: 'Bright Mind', minXP: 7500, maxXP: 9999, icon: '💫' },
  { level: 7, title: 'Master Learner', minXP: 10000, maxXP: 14999, icon: '🏆' },
  { level: 8, title: 'Wisdom Keeper', minXP: 15000, maxXP: 19999, icon: '👑' },
  { level: 9, title: 'Learning Legend', minXP: 20000, maxXP: 29999, icon: '🎓' },
  { level: 10, title: 'Educational Champion', minXP: 30000, maxXP: Infinity, icon: '🦸' },
];

// Helper functions
export function getLevelFromXP(xp: number): LevelInfo {
  for (const level of LEVEL_THRESHOLDS) {
    if (xp >= level.minXP && xp <= level.maxXP) {
      return level;
    }
  }
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getXPProgressInLevel(xp: number): { current: number; total: number; percentage: number } {
  const level = getLevelFromXP(xp);
  const currentInLevel = xp - level.minXP;
  const totalInLevel = level.maxXP - level.minXP + 1;
  const percentage = Math.min((currentInLevel / totalInLevel) * 100, 100);
  return { current: currentInLevel, total: totalInLevel, percentage };
}

export function getTierColor(tier: AchievementTier | null): string {
  const colors: Record<AchievementTier, string> = {
    bronze: 'text-amber-600',
    silver: 'text-gray-400',
    gold: 'text-yellow-500',
    platinum: 'text-purple-400',
  };
  return tier ? colors[tier] : 'text-gray-500';
}

export function getCategoryIcon(category: AchievementCategory): string {
  const icons: Record<AchievementCategory, string> = {
    academic: '📚',
    streak: '🔥',
    social: '👥',
    creative: '🎨',
    emotional: '💖',
    special: '⭐',
  };
  return icons[category] || '🏅';
}
