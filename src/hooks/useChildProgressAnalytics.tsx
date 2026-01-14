import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Analytics data structure for a child's learning progress
 */
export interface SubjectProgress {
  subject: string;
  lessonsCompleted: number;
  totalTimeMinutes: number;
  averageScore: number;
  lastActivity: string | null;
  color: string;
}

export interface DailyActivity {
  date: string;
  lessonsCompleted: number;
  timeSpentMinutes: number;
  averageScore: number;
}

export interface SkillMastery {
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number; // 0-100
  lessonsCompleted: number;
  totalLessons: number;
}

export interface AchievementTimeline {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  icon: string;
  tier: string;
}

export interface ProgressAnalytics {
  // Overview stats
  totalLessonsCompleted: number;
  totalTimeSpentMinutes: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  
  // Subject breakdown
  subjectProgress: SubjectProgress[];
  
  // Time-based activity
  dailyActivity: DailyActivity[];
  weeklyTrend: 'improving' | 'stable' | 'declining';
  
  // Skill mastery
  skillMastery: SkillMastery[];
  
  // Achievements timeline
  recentAchievements: AchievementTimeline[];
  totalBadges: number;
  
  // Engagement metrics
  engagementScore: number;
  consistencyRate: number; // % of days active in last 30 days
}

// Map subjects to their design system colors
const SUBJECT_COLORS: Record<string, string> = {
  reading: 'hsl(var(--reading))',
  math: 'hsl(var(--math))',
  science: 'hsl(var(--science))',
  social: 'hsl(var(--social))',
  lifeskills: 'hsl(var(--lifeskills))',
  emotional_intelligence: 'hsl(var(--lifeskills))',
  default: 'hsl(var(--primary))',
};

/**
 * Custom hook for fetching and computing child progress analytics
 * Implements caching and optimized queries
 */
export function useChildProgressAnalytics(childId: string | null) {
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!childId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all progress data in parallel for efficiency
      const [progressResult, badgesResult, activityResult, streakResult] = await Promise.all([
        // Lesson progress with lesson details
        supabase
          .from('user_progress')
          .select(`
            id,
            status,
            score,
            time_spent_seconds,
            completed_at,
            lesson_id,
            lessons (
              subject,
              title,
              points_value
            )
          `)
          .eq('child_id', childId)
          .order('completed_at', { ascending: false }),
        
        // Earned badges - use user_badges table
        supabase
          .from('user_badges')
          .select(`
            id,
            earned_at,
            badge_id,
            achievement_badges (
              name,
              description,
              icon,
              tier,
              category
            )
          `)
          .eq('child_id', childId)
          .order('earned_at', { ascending: false })
          .limit(10),
        
        // Activity sessions for time tracking
        supabase
          .from('activity_sessions')
          .select('*')
          .eq('child_id', childId)
          .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('started_at', { ascending: false }),
        
        // Current streak using database function
        supabase.rpc('calculate_streak', { p_child_id: childId }),
      ]);

      const progressData = progressResult.data || [];
      const badgesData = badgesResult.data || [];
      const activityData = activityResult.data || [];
      const currentStreak = streakResult.data || 0;

      // Calculate completed lessons
      const completedProgress = progressData.filter(p => p.status === 'completed');
      const totalLessonsCompleted = completedProgress.length;

      // Calculate total time spent (from progress + activity sessions)
      const progressTimeSeconds = completedProgress.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
      const activityTimeSeconds = activityData.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0);
      const totalTimeSpentMinutes = Math.round((progressTimeSeconds + activityTimeSeconds) / 60);

      // Calculate average score
      const scores = completedProgress.filter(p => p.score != null).map(p => p.score!);
      const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : 0;

      // Subject breakdown
      const subjectMap = new Map<string, { lessons: number; time: number; scores: number[] }>();
      completedProgress.forEach(p => {
        const subject = (p.lessons as any)?.subject?.toLowerCase() || 'other';
        const current = subjectMap.get(subject) || { lessons: 0, time: 0, scores: [] };
        current.lessons++;
        current.time += (p.time_spent_seconds || 0) / 60;
        if (p.score != null) current.scores.push(p.score);
        subjectMap.set(subject, current);
      });

      const subjectProgress: SubjectProgress[] = Array.from(subjectMap.entries()).map(([subject, data]) => ({
        subject: subject.charAt(0).toUpperCase() + subject.slice(1).replace('_', ' '),
        lessonsCompleted: data.lessons,
        totalTimeMinutes: Math.round(data.time),
        averageScore: data.scores.length > 0 
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) 
          : 0,
        lastActivity: completedProgress.find(p => (p.lessons as any)?.subject?.toLowerCase() === subject)?.completed_at || null,
        color: SUBJECT_COLORS[subject] || SUBJECT_COLORS.default,
      })).sort((a, b) => b.lessonsCompleted - a.lessonsCompleted);

      // Daily activity for last 14 days
      const dailyMap = new Map<string, { lessons: number; time: number; scores: number[] }>();
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, { lessons: 0, time: 0, scores: [] });
      }

      completedProgress.forEach(p => {
        if (!p.completed_at) return;
        const dateStr = p.completed_at.split('T')[0];
        if (dailyMap.has(dateStr)) {
          const current = dailyMap.get(dateStr)!;
          current.lessons++;
          current.time += (p.time_spent_seconds || 0) / 60;
          if (p.score != null) current.scores.push(p.score);
        }
      });

      const dailyActivity: DailyActivity[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          lessonsCompleted: data.lessons,
          timeSpentMinutes: Math.round(data.time),
          averageScore: data.scores.length > 0 
            ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) 
            : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate weekly trend
      const lastWeekLessons = dailyActivity.slice(-7).reduce((sum, d) => sum + d.lessonsCompleted, 0);
      const prevWeekLessons = dailyActivity.slice(0, 7).reduce((sum, d) => sum + d.lessonsCompleted, 0);
      const weeklyTrend: 'improving' | 'stable' | 'declining' = 
        lastWeekLessons > prevWeekLessons * 1.1 ? 'improving' :
        lastWeekLessons < prevWeekLessons * 0.9 ? 'declining' : 'stable';

      // Skill mastery based on subject completion
      const skillMastery: SkillMastery[] = Array.from(subjectMap.entries()).map(([subject, data]) => {
        const progress = Math.min(100, (data.lessons / 10) * 100); // Assume 10 lessons = mastery
        const level: SkillMastery['level'] = 
          progress >= 90 ? 'expert' :
          progress >= 60 ? 'advanced' :
          progress >= 30 ? 'intermediate' : 'beginner';
        
        return {
          skill: subject.charAt(0).toUpperCase() + subject.slice(1).replace('_', ' '),
          level,
          progress: Math.round(progress),
          lessonsCompleted: data.lessons,
          totalLessons: 10,
        };
      });

      // Recent achievements - safely handle the data
      const recentAchievements: AchievementTimeline[] = [];
      if (badgesData && Array.isArray(badgesData)) {
        for (const b of badgesData) {
          const badge = b as any;
          if (badge.achievement_badges) {
            recentAchievements.push({
              id: badge.id || badge.badge_id,
              title: badge.achievement_badges.name || 'Achievement',
              description: badge.achievement_badges.description || '',
              earnedAt: badge.earned_at || new Date().toISOString(),
              icon: badge.achievement_badges.icon || '🏆',
              tier: badge.achievement_badges.tier || 'bronze',
            });
          }
        }
      }

      // Engagement metrics
      const daysActive = new Set(completedProgress.map(p => p.completed_at?.split('T')[0]).filter(Boolean)).size;
      const consistencyRate = Math.round((daysActive / 30) * 100);
      
      // Simple engagement score: weighted average of activity, scores, and consistency
      const activityScore = Math.min(100, (totalLessonsCompleted / 30) * 100);
      const engagementScore = Math.round(
        (activityScore * 0.3) + (averageScore * 0.4) + (consistencyRate * 0.3)
      );

      // Calculate longest streak (simplified - could use DB function)
      const longestStreak = Math.max(currentStreak, Math.floor(totalLessonsCompleted / 3));

      setAnalytics({
        totalLessonsCompleted,
        totalTimeSpentMinutes,
        averageScore,
        currentStreak,
        longestStreak,
        subjectProgress,
        dailyActivity,
        weeklyTrend,
        skillMastery,
        recentAchievements,
        totalBadges: badgesData.length,
        engagementScore,
        consistencyRate,
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Memoized computed values
  const summary = useMemo(() => {
    if (!analytics) return null;
    return {
      isActive: analytics.currentStreak > 0,
      topSubject: analytics.subjectProgress[0]?.subject || 'None yet',
      needsEncouragement: analytics.weeklyTrend === 'declining',
    };
  }, [analytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    summary,
  };
}
