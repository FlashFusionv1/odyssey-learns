import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lesson {
  id: string;
  title: string;
  subject: string;
  grade_level: number;
  estimated_minutes: number | null;
  points_value: number | null;
}

interface Profile {
  strengths: Array<{ subject: string }>;
  weaknesses: Array<{ subject: string }>;
  preferred_subjects: string[];
  average_quiz_score: number;
  preferred_difficulty: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    const { childId, count = 5, filterSubjects } = await req.json();
    
    if (!childId) {
      return new Response(JSON.stringify({ error: 'childId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify child ownership
    const { data: child, error: childError } = await supabase
      .from('children')
      .select('id, name, grade_level, parent_id')
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

    // Fetch learning profile
    const { data: profile } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('child_id', childId)
      .single();

    // Fetch completed lesson IDs to exclude
    const { data: completedLessons } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('child_id', childId)
      .eq('status', 'completed');

    const completedIds = new Set((completedLessons || []).map((l) => l.lesson_id));

    // Fetch existing active recommendations to exclude
    const { data: existingRecs } = await supabase
      .from('lesson_recommendations')
      .select('lesson_id')
      .eq('child_id', childId)
      .is('dismissed_at', null)
      .is('completed_at', null)
      .gt('expires_at', new Date().toISOString());

    const existingRecIds = new Set((existingRecs || []).map((r) => r.lesson_id));

    // Build lessons query
    let lessonsQuery = supabase
      .from('lessons')
      .select('id, title, subject, grade_level, estimated_minutes, points_value')
      .eq('is_active', true)
      .gte('grade_level', Math.max(0, child.grade_level - 1))
      .lte('grade_level', child.grade_level + 1);

    if (filterSubjects && filterSubjects.length > 0) {
      lessonsQuery = lessonsQuery.in('subject', filterSubjects);
    }

    const { data: availableLessons } = await lessonsQuery;

    // Filter out completed and already recommended lessons
    const eligibleLessons = (availableLessons || []).filter(
      (lesson: Lesson) => !completedIds.has(lesson.id) && !existingRecIds.has(lesson.id)
    );

    if (eligibleLessons.length === 0) {
      return new Response(JSON.stringify({
        recommendations: [],
        message: 'No new lessons available for recommendation',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Score and rank lessons
    const typedProfile = profile as Profile | null;
    const scoredLessons = eligibleLessons.map((lesson: Lesson) => {
      let score = 50; // Base score
      let reason: string = 'exploration';
      let reasonExplanation = 'Explore something new!';

      if (typedProfile) {
        // Boost for preferred subjects
        if (typedProfile.preferred_subjects?.includes(lesson.subject)) {
          score += 20;
          reason = 'interest';
          reasonExplanation = `You enjoy ${lesson.subject} lessons!`;
        }

        // Boost for weakness areas (remediation)
        const weaknessSubjects = typedProfile.weaknesses?.map((w) => w.subject) || [];
        if (weaknessSubjects.includes(lesson.subject)) {
          score += 15;
          reason = 'remediation';
          reasonExplanation = `This will help strengthen your ${lesson.subject} skills.`;
        }

        // Boost for strength areas (challenge)
        const strengthSubjects = typedProfile.strengths?.map((s) => s.subject) || [];
        if (strengthSubjects.includes(lesson.subject)) {
          score += 10;
          if (typedProfile.average_quiz_score > 80) {
            reason = 'challenge';
            reasonExplanation = `Ready for a new ${lesson.subject} challenge!`;
          }
        }
      }

      // Grade level matching
      if (lesson.grade_level === child.grade_level) {
        score += 10;
      }

      // Add some randomness for variety
      score += Math.random() * 10;

      return {
        lesson,
        score: Math.round(score),
        reason,
        reasonExplanation,
      };
    });

    // Sort by score and take top N
    scoredLessons.sort((a, b) => b.score - a.score);
    const topRecommendations = scoredLessons.slice(0, count);

    // Insert recommendations
    const recommendationsToInsert = topRecommendations.map((rec) => ({
      child_id: childId,
      lesson_id: rec.lesson.id,
      reason: rec.reason,
      reason_explanation: rec.reasonExplanation,
      priority: rec.score,
      predicted_time_minutes: rec.lesson.estimated_minutes || 15,
      predicted_difficulty: 'appropriate',
      predicted_engagement: 'medium',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }));

    const { data: insertedRecs, error: insertError } = await supabase
      .from('lesson_recommendations')
      .upsert(recommendationsToInsert, { 
        onConflict: 'child_id,lesson_id',
        ignoreDuplicates: true 
      })
      .select();

    if (insertError) {
      console.error('Failed to insert recommendations:', insertError);
    }

    // Format response
    const recommendations = topRecommendations.map((rec, idx) => ({
      id: insertedRecs?.[idx]?.id || `temp-${idx}`,
      lessonId: rec.lesson.id,
      lessonTitle: rec.lesson.title,
      lessonSubject: rec.lesson.subject,
      reason: rec.reason,
      reasonExplanation: rec.reasonExplanation,
      priority: rec.score,
      predictedTimeMinutes: rec.lesson.estimated_minutes || 15,
    }));

    return new Response(JSON.stringify({
      recommendations,
      metadata: {
        totalAvailable: eligibleLessons.length,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
