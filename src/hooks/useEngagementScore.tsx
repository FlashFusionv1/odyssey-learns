import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EngagementMetrics {
  score: number;
  level: 'low' | 'medium' | 'high' | 'excellent';
  factors: {
    lessonsCompleted: number;
    quizPerformance: number;
    consistency: number;
    timeSpent: number;
    socialActivity: number;
  };
  trend: 'up' | 'down' | 'stable';
  lastCalculated: string;
}

interface EngagementHistory {
  date: string;
  score: number;
}

export function useEngagementScore(childId: string | null) {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [history, setHistory] = useState<EngagementHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateEngagementScore = useCallback(async () => {
    if (!childId) {
      setLoading(false);
      return;
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch activity sessions from new table
      const { data: sessionsData } = await supabase
        .from('activity_sessions')
        .select('activity_type, score, time_spent_seconds, completed_at, started_at')
        .eq('child_id', childId)
        .gte('started_at', thirtyDaysAgo.toISOString());

      // Fetch daily quota data for lesson completion
      const { data: quotaData } = await supabase
        .from('daily_lesson_quota')
        .select('platform_lessons_completed, custom_lessons_completed, quota_date')
        .eq('child_id', childId)
        .gte('quota_date', thirtyDaysAgo.toISOString().split('T')[0]);

      // Fetch child data for points
      const { data: childData } = await supabase
        .from('children')
        .select('total_points, quest_bonus_points')
        .eq('id', childId)
        .single();

      const sessions = sessionsData || [];
      const quotas = quotaData || [];
      const child = childData;

      // Calculate lessons completed (from quotas + completed sessions)
      const totalLessonsFromQuotas = quotas.reduce((acc, q) => 
        acc + (q.platform_lessons_completed || 0) + (q.custom_lessons_completed || 0), 0);
      const completedSessions = sessions.filter(s => s.completed_at).length;
      const totalActivities = totalLessonsFromQuotas + completedSessions;
      const lessonsCompleted = Math.min(100, (totalActivities / 60) * 100); // 60 activities = 100%
      
      // Calculate quiz performance from session scores
      const scoredSessions = sessions.filter(s => s.score !== null && s.score !== undefined);
      const avgScore = scoredSessions.length
        ? scoredSessions.reduce((acc, s) => acc + (Number(s.score) || 0), 0) / scoredSessions.length
        : 50; // Default to 50 if no scores
      const quizPerformance = Math.min(100, avgScore);
      
      // Calculate consistency from days active
      const activeDays = new Set(sessions.map(s => 
        new Date(s.started_at).toISOString().split('T')[0]
      )).size;
      const consistency = Math.min(100, (activeDays / 30) * 100);
      
      // Calculate time spent
      const totalTimeMinutes = sessions.reduce((acc, s) => 
        acc + ((s.time_spent_seconds || 0) / 60), 0);
      const timeSpent = Math.min(100, (totalTimeMinutes / 600) * 100); // 10 hours = 100%
      
      // Social activity (placeholder - would integrate with peer connections)
      const socialActivity = 50;

      // Weighted score calculation
      const score = Math.round(
        lessonsCompleted * 0.30 + 
        quizPerformance * 0.25 + 
        consistency * 0.20 + 
        timeSpent * 0.15 + 
        socialActivity * 0.10
      );

      const level: EngagementMetrics['level'] = 
        score >= 80 ? 'excellent' : 
        score >= 60 ? 'high' : 
        score >= 40 ? 'medium' : 'low';

      // Calculate trend based on recent vs older activity
      const midPoint = new Date();
      midPoint.setDate(midPoint.getDate() - 15);
      const recentSessions = sessions.filter(s => new Date(s.started_at) >= midPoint).length;
      const olderSessions = sessions.filter(s => new Date(s.started_at) < midPoint).length;
      const trend: 'up' | 'down' | 'stable' = 
        recentSessions > olderSessions * 1.2 ? 'up' :
        recentSessions < olderSessions * 0.8 ? 'down' : 'stable';

      setMetrics({
        score,
        level,
        factors: { 
          lessonsCompleted: Math.round(lessonsCompleted), 
          quizPerformance: Math.round(quizPerformance), 
          consistency: Math.round(consistency), 
          timeSpent: Math.round(timeSpent), 
          socialActivity 
        },
        trend,
        lastCalculated: new Date().toISOString(),
      });

      // Build history from sessions grouped by week
      const weeklyScores: Record<string, number[]> = {};
      sessions.forEach(s => {
        const weekStart = getWeekStart(new Date(s.started_at));
        if (!weeklyScores[weekStart]) weeklyScores[weekStart] = [];
        weeklyScores[weekStart].push(Number(s.score) || 50);
      });
      
      const historyData = Object.entries(weeklyScores)
        .map(([date, scores]) => ({
          date,
          score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-8);
      
      setHistory(historyData);
    } catch (err) {
      console.error('Error calculating engagement:', err);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    calculateEngagementScore();
  }, [calculateEngagementScore]);

  return { metrics, history, loading, refresh: calculateEngagementScore };
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}
