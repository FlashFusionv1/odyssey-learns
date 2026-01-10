import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivityData {
  activity_type: string;
  score: number | null;
  max_score: number | null;
  time_spent_seconds: number | null;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
}

interface ProgressData {
  status: string;
  score: number | null;
  time_spent_seconds: number | null;
  completed_at: string | null;
  lessons: {
    subject: string;
    title: string;
    grade_level: number;
  } | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { childId, forceRefresh = false } = await req.json();
    
    if (!childId) {
      return new Response(JSON.stringify({ error: 'childId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify child ownership
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, name, grade_level, total_points, parent_id')
      .eq('id', childId)
      .single();

    if (childError || !child) {
      return new Response(JSON.stringify({ error: 'Child not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (child.parent_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized access' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if recent analysis exists (within 4 hours) unless force refresh
    if (!forceRefresh) {
      const { data: existingProfile } = await supabase
        .from('learning_profiles')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (existingProfile) {
        const lastAnalyzed = new Date(existingProfile.last_analyzed_at);
        const hoursSinceAnalysis = (Date.now() - lastAnalyzed.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceAnalysis < 4) {
          return new Response(JSON.stringify({
            profile: existingProfile,
            patterns: [],
            skills: [],
            cached: true,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    // Fetch activity sessions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: activitySessions } = await supabase
      .from('activity_sessions')
      .select('*')
      .eq('child_id', childId)
      .gte('started_at', thirtyDaysAgo)
      .order('started_at', { ascending: false });

    // Fetch user progress
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('*, lessons(subject, title, grade_level)')
      .eq('child_id', childId)
      .order('updated_at', { ascending: false });

    // Fetch emotion logs
    const { data: emotionLogs } = await supabase
      .from('emotion_logs')
      .select('emotion_type, intensity, logged_at')
      .eq('child_id', childId)
      .gte('logged_at', thirtyDaysAgo)
      .order('logged_at', { ascending: false })
      .limit(50);

    // Calculate metrics
    const activities = activitySessions || [];
    const progress = userProgress || [];
    const emotions = emotionLogs || [];
    
    const dataPointsAnalyzed = activities.length + progress.length + emotions.length;
    
    // Subject performance analysis
    const subjectStats: Record<string, { count: number; totalScore: number; totalTime: number }> = {};
    
    progress.forEach((p: ProgressData) => {
      const subject = p.lessons?.subject || 'unknown';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { count: 0, totalScore: 0, totalTime: 0 };
      }
      subjectStats[subject].count++;
      if (p.score) subjectStats[subject].totalScore += p.score;
      if (p.time_spent_seconds) subjectStats[subject].totalTime += p.time_spent_seconds;
    });

    // Determine strengths and weaknesses
    const subjectPerformance = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      avgScore: stats.count > 0 ? stats.totalScore / stats.count : 0,
      count: stats.count,
      avgTime: stats.count > 0 ? stats.totalTime / stats.count : 0,
    })).sort((a, b) => b.avgScore - a.avgScore);

    const strengths = subjectPerformance
      .filter(s => s.avgScore >= 70 && s.count >= 2)
      .slice(0, 3)
      .map(s => ({
        subject: s.subject,
        skill: 'General',
        masteryLevel: s.avgScore >= 90 ? 'expert' : s.avgScore >= 80 ? 'advanced' : 'intermediate',
        confidenceScore: Math.min(0.9, s.count / 10),
        lastDemonstrated: new Date().toISOString(),
      }));

    const weaknesses = subjectPerformance
      .filter(s => s.avgScore < 60 && s.count >= 2)
      .slice(0, 3)
      .map(s => ({
        subject: s.subject,
        skill: 'General',
        currentLevel: 'beginner',
        struggleIndicators: ['Low scores'],
        suggestedRemediation: ['Practice more'],
        lastAttempted: new Date().toISOString(),
      }));

    // Calculate completion rate
    const completedCount = progress.filter((p: ProgressData) => p.status === 'completed').length;
    const completionRate = progress.length > 0 ? (completedCount / progress.length) * 100 : 0;

    // Calculate average score
    const scoresArray = progress.filter((p: ProgressData) => p.score != null).map((p: ProgressData) => p.score as number);
    const avgScore = scoresArray.length > 0 ? scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length : 0;

    // Calculate session metrics
    const sessionTimes = activities
      .filter((a: ActivityData) => a.time_spent_seconds != null)
      .map((a: ActivityData) => (a.time_spent_seconds as number) / 60);
    const avgSessionMinutes = sessionTimes.length > 0 
      ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length 
      : 15;

    // Determine learning speed based on completion velocity
    const weeklyCompletions = completedCount / 4; // Assume 30 days ≈ 4 weeks
    let learningSpeed: string = 'medium';
    if (weeklyCompletions > 10) learningSpeed = 'very_fast';
    else if (weeklyCompletions > 5) learningSpeed = 'fast';
    else if (weeklyCompletions < 1) learningSpeed = 'very_slow';
    else if (weeklyCompletions < 2) learningSpeed = 'slow';

    // Determine improvement trend
    let improvementTrend = 'stable';
    if (scoresArray.length >= 5) {
      const recentAvg = scoresArray.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const olderAvg = scoresArray.slice(-3).reduce((a, b) => a + b, 0) / 3;
      if (recentAvg > olderAvg + 10) improvementTrend = 'accelerating';
      else if (recentAvg > olderAvg + 5) improvementTrend = 'improving';
      else if (recentAvg < olderAvg - 10) improvementTrend = 'declining';
    }

    // Preferred subjects (highest engagement)
    const preferredSubjects = subjectPerformance
      .filter(s => s.count >= 2)
      .slice(0, 3)
      .map(s => s.subject);

    // Build profile data
    const profileData = {
      child_id: childId,
      strengths: strengths,
      weaknesses: weaknesses,
      learning_speed: learningSpeed,
      preferred_subjects: preferredSubjects,
      avoided_subjects: [],
      overall_completion_rate: Math.round(completionRate * 100) / 100,
      average_quiz_score: Math.round(avgScore * 100) / 100,
      average_session_minutes: Math.round(avgSessionMinutes * 100) / 100,
      total_lessons_completed: completedCount,
      current_streak: 0, // Would need streak calculation
      optimal_session_length: Math.round(avgSessionMinutes),
      best_time_of_day: 'afternoon',
      preferred_difficulty: avgScore >= 80 ? 'advanced' : avgScore >= 60 ? 'intermediate' : 'beginner',
      help_seeking_frequency: 'sometimes',
      weekly_lesson_velocity: Math.round(weeklyCompletions * 100) / 100,
      skill_acquisition_rate: 0,
      improvement_trend: improvementTrend,
      profile_version: 1,
      last_analyzed_at: new Date().toISOString(),
      data_points_analyzed: dataPointsAnalyzed,
    };

    // Upsert profile
    const { data: upsertedProfile, error: upsertError } = await supabase
      .from('learning_profiles')
      .upsert(profileData, { onConflict: 'child_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('Failed to upsert profile:', upsertError);
      throw new Error('Failed to save profile');
    }

    // Log analysis history
    const processingTime = Date.now() - startTime;
    await supabase.from('profile_analysis_history').insert({
      child_id: childId,
      model_used: 'rule-based-v1',
      processing_time_ms: processingTime,
      data_points_analyzed: dataPointsAnalyzed,
      confidence_level: 0.8,
      profile_snapshot: profileData,
      patterns_detected: strengths.length + weaknesses.length,
      recommendations_generated: 0,
      status: 'completed',
    });

    return new Response(JSON.stringify({
      profile: upsertedProfile,
      patterns: [],
      skills: [],
      cached: false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in analyze-learning-profile:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
