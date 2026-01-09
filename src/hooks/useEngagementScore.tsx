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

      const { data: activitySessions } = await supabase
        .from('activity_sessions')
        .select('score, time_spent_seconds, completed_at')
        .eq('child_id', childId)
        .gte('started_at', thirtyDaysAgo.toISOString());

      const { data: childData } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      const lessonsCompleted = Math.min(100, ((activitySessions?.length || 0) / 30) * 100);
      const avgScore = activitySessions?.length
        ? activitySessions.reduce((acc, s) => acc + ((s as any).score || 0), 0) / activitySessions.length
        : 0;
      const quizPerformance = avgScore;
      const streak = (childData as any)?.daily_streak || 0;
      const consistency = Math.min(100, streak * 10);
      const totalTime = (activitySessions?.reduce((acc, s) => acc + ((s as any).time_spent_seconds || 0), 0) || 0) / 60;
      const timeSpent = Math.min(100, (totalTime / 900) * 100);
      const socialActivity = 50; // Default

      const score = Math.round(
        lessonsCompleted * 0.30 + quizPerformance * 0.25 + consistency * 0.20 + timeSpent * 0.15 + socialActivity * 0.10
      );

      let level: EngagementMetrics['level'] = score >= 80 ? 'excellent' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';

      setMetrics({
        score,
        level,
        factors: { lessonsCompleted: Math.round(lessonsCompleted), quizPerformance: Math.round(quizPerformance), consistency: Math.round(consistency), timeSpent: Math.round(timeSpent), socialActivity },
        trend: 'stable',
        lastCalculated: new Date().toISOString(),
      });
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
