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

      // Fetch assignment submissions for score data
      const submissionsResult = await supabase
        .from('assignment_submissions')
        .select('score, time_spent_seconds, submitted_at')
        .eq('child_id', childId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Fetch daily quota data for lesson completion
      const quotaResult = await supabase
        .from('daily_lesson_quota')
        .select('platform_lessons_completed, custom_lessons_completed, quota_date')
        .eq('child_id', childId)
        .gte('quota_date', thirtyDaysAgo.toISOString().split('T')[0]);

      // Fetch child data for points
      const childResult = await supabase
        .from('children')
        .select('total_points, quest_bonus_points')
        .eq('id', childId)
        .single();

      const submissions = (submissionsResult.data || []) as Array<{ score: number | null; time_spent_seconds: number | null; submitted_at: string | null }>;
      const quotas = (quotaResult.data || []) as Array<{ platform_lessons_completed: number | null; custom_lessons_completed: number | null; quota_date: string }>;
      const childData = childResult.data;

      // Calculate metrics
      const totalLessons = quotas.reduce((acc, q) => acc + (q.platform_lessons_completed || 0) + (q.custom_lessons_completed || 0), 0);
      const lessonsCompleted = Math.min(100, (totalLessons / 30) * 100);
      
      const avgScore = submissions.length
        ? submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length
        : 0;
      const quizPerformance = Math.min(100, avgScore);
      
      const totalPoints = (childData?.total_points || 0) + (childData?.quest_bonus_points || 0);
      const consistency = Math.min(100, Math.floor(totalPoints / 100) * 10);
      
      const totalTime = submissions.reduce((acc, s) => acc + (s.time_spent_seconds || 0), 0) / 60;
      const timeSpent = Math.min(100, (totalTime / 900) * 100);
      const socialActivity = 50; // Default placeholder

      const score = Math.round(
        lessonsCompleted * 0.30 + quizPerformance * 0.25 + consistency * 0.20 + timeSpent * 0.15 + socialActivity * 0.10
      );

      const level: EngagementMetrics['level'] = score >= 80 ? 'excellent' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';

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
