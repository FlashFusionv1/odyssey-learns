import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NudgeContext {
  userId: string;
  childId?: string;
  onboardingPreferences?: any;
  recentActivity?: any[];
  tutorialProgress?: any[];
  existingNudges?: any[];
}

interface GeneratedNudge {
  nudge_type: string;
  trigger_reason: string;
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  icon: string;
  priority: number;
  display_location: string;
  confidence_score: number;
  context_data: Record<string, any>;
}

// Rule-based nudge generation (fast, no AI needed)
function generateRuleBasedNudges(context: NudgeContext): GeneratedNudge[] {
  const nudges: GeneratedNudge[] = [];
  const { onboardingPreferences, recentActivity, tutorialProgress } = context;

  // 1. Incomplete setup nudges
  if (onboardingPreferences?.deferred_setup_items?.length > 0) {
    const deferredItems = onboardingPreferences.deferred_setup_items;
    
    if (deferredItems.includes('learning_preferences')) {
      nudges.push({
        nudge_type: 'incomplete_setup',
        trigger_reason: 'Learning preferences not set',
        title: 'Personalize Your Experience',
        message: 'Setting up learning preferences helps us recommend the perfect lessons for your child!',
        action_url: '/settings?tab=preferences',
        action_label: 'Set Preferences',
        icon: 'Settings',
        priority: 7,
        display_location: 'dashboard',
        confidence_score: 0.95,
        context_data: { deferred_item: 'learning_preferences' },
      });
    }

    if (deferredItems.includes('community_settings')) {
      nudges.push({
        nudge_type: 'incomplete_setup',
        trigger_reason: 'Community settings not configured',
        title: 'Join Our Learning Community',
        message: 'Connect with other families and share your learning journey!',
        action_url: '/settings?tab=community',
        action_label: 'Explore Community',
        icon: 'Users',
        priority: 5,
        display_location: 'sidebar',
        confidence_score: 0.85,
        context_data: { deferred_item: 'community_settings' },
      });
    }
  }

  // 2. Inactivity nudges
  const lastActivity = recentActivity?.[0];
  if (lastActivity) {
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivity.completed_at || lastActivity.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceActivity >= 3 && daysSinceActivity < 7) {
      nudges.push({
        nudge_type: 'reminder',
        trigger_reason: `No activity for ${daysSinceActivity} days`,
        title: 'We Miss You!',
        message: 'Your learning streak is waiting! Complete a quick lesson to get back on track.',
        action_url: '/lessons',
        action_label: 'Start Learning',
        icon: 'Sparkles',
        priority: 8,
        display_location: 'banner',
        confidence_score: 0.9,
        context_data: { days_inactive: daysSinceActivity },
      });
    } else if (daysSinceActivity >= 7) {
      nudges.push({
        nudge_type: 'reminder',
        trigger_reason: `No activity for ${daysSinceActivity} days`,
        title: 'Welcome Back!',
        message: "It's been a while! We have new lessons waiting for you. Let's explore together!",
        action_url: '/lessons',
        action_label: 'Explore New Lessons',
        icon: 'Gift',
        priority: 9,
        display_location: 'modal',
        confidence_score: 0.95,
        context_data: { days_inactive: daysSinceActivity },
      });
    }
  }

  // 3. Tutorial discovery nudges
  const completedTutorials = tutorialProgress?.filter(t => t.status === 'completed') || [];
  const availableTutorials = ['parent_dashboard_tour', 'child_lessons_tour', 'badges_tour', 'rewards_tour'];
  const pendingTutorials = availableTutorials.filter(
    t => !completedTutorials.some(ct => ct.tutorial_id === t)
  );

  if (pendingTutorials.length > 0 && completedTutorials.length > 0) {
    nudges.push({
      nudge_type: 'feature_discovery',
      trigger_reason: 'Uncompleted tutorials available',
      title: 'Discover More Features',
      message: `You have ${pendingTutorials.length} more tour${pendingTutorials.length > 1 ? 's' : ''} to help you get the most out of Inner Odyssey!`,
      action_url: '/settings?tab=tutorials',
      action_label: 'View Tutorials',
      icon: 'Compass',
      priority: 4,
      display_location: 'sidebar',
      confidence_score: 0.75,
      context_data: { pending_tutorials: pendingTutorials },
    });
  }

  // 4. Celebration nudges based on activity
  if (recentActivity && recentActivity.length >= 5) {
    const recentScores = recentActivity.slice(0, 5).map(a => a.score || 0);
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    
    if (avgScore >= 85) {
      nudges.push({
        nudge_type: 'celebration',
        trigger_reason: 'High average score in recent lessons',
        title: 'Amazing Progress! 🌟',
        message: "You're doing incredible! Your recent scores show real mastery. Keep up the fantastic work!",
        action_url: '/badges',
        action_label: 'View Achievements',
        icon: 'Trophy',
        priority: 6,
        display_location: 'toast',
        confidence_score: 0.9,
        context_data: { avg_score: avgScore },
      });
    }
  }

  return nudges;
}

// AI-enhanced nudge generation for complex personalization
async function generateAINudges(
  context: NudgeContext,
  ruleBasedNudges: GeneratedNudge[]
): Promise<GeneratedNudge[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.log('LOVABLE_API_KEY not configured, skipping AI nudges');
    return [];
  }

  const { onboardingPreferences, recentActivity } = context;

  // Only call AI if we have meaningful context
  if (!onboardingPreferences && (!recentActivity || recentActivity.length < 3)) {
    return [];
  }

  const prompt = `You are an AI advisor for a K-12 educational platform called Inner Odyssey. 
Based on the user context below, suggest 1-2 personalized nudges that would help engage and support the family.

User Context:
- Onboarding Mode: ${onboardingPreferences?.onboarding_mode || 'unknown'}
- Learning Style: ${onboardingPreferences?.learning_style || 'not set'}
- Primary Goal: ${onboardingPreferences?.primary_goal || 'not set'}
- Session Length Preference: ${onboardingPreferences?.session_length_minutes || 15} minutes
- Recent Activities: ${recentActivity?.length || 0} in the last week
- Existing Nudges: ${ruleBasedNudges.length} rule-based nudges generated

Generate nudges in this exact JSON format:
{
  "nudges": [
    {
      "nudge_type": "preference_based" or "activity_based",
      "trigger_reason": "Brief reason",
      "title": "Short engaging title (max 6 words)",
      "message": "Friendly message (max 25 words)",
      "action_label": "Button text (max 3 words)",
      "icon": "One of: BookOpen, Star, Heart, Lightbulb, Rocket, Brain",
      "priority": 5,
      "display_location": "dashboard" or "sidebar",
      "confidence_score": 0.7
    }
  ]
}

Focus on:
1. Matching content to their learning style preference
2. Encouraging consistent engagement
3. Celebrating small wins
4. Suggesting exploration of new features

Keep messages warm, encouraging, and age-appropriate for families with children.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: 'You are a friendly K-12 education advisor. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error(`AI nudge generation failed: ${response.status}`);
      return [];
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI nudge response:', content);
      return [];
    }

    return (parsed.nudges || []).map((n: any) => ({
      ...n,
      action_url: n.action_url || '/dashboard',
      context_data: { ai_generated: true, ...n.context_data },
    }));
  } catch (error) {
    console.error('AI nudge generation error:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { childId, forceRegenerate = false } = await req.json();
    console.log(`Generating nudges for user ${user.id}, child ${childId || 'none'}`);

    // Check for existing active nudges (unless force regenerate)
    if (!forceRegenerate) {
      const { data: existingNudges } = await supabase
        .from('ai_nudges')
        .select('id')
        .eq('user_id', user.id)
        .is('dismissed_at', null)
        .is('completed_at', null)
        .lte('display_after', new Date().toISOString())
        .limit(5);

      if (existingNudges && existingNudges.length >= 3) {
        return new Response(JSON.stringify({ 
          message: 'Sufficient active nudges exist',
          count: existingNudges.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Gather context
    const { data: onboardingPreferences } = await supabase
      .from('onboarding_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: recentActivity } = await supabase
      .from('user_progress')
      .select('*, lessons(subject, title)')
      .eq('child_id', childId || '')
      .order('completed_at', { ascending: false })
      .limit(10);

    const { data: tutorialProgress } = await supabase
      .from('tutorial_progress')
      .select('*')
      .eq('user_id', user.id);

    const { data: existingNudges } = await supabase
      .from('ai_nudges')
      .select('trigger_reason')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const context: NudgeContext = {
      userId: user.id,
      childId,
      onboardingPreferences,
      recentActivity: recentActivity || [],
      tutorialProgress: tutorialProgress || [],
      existingNudges: existingNudges || [],
    };

    // Generate nudges
    const ruleBasedNudges = generateRuleBasedNudges(context);
    const aiNudges = await generateAINudges(context, ruleBasedNudges);
    
    // Combine and deduplicate
    const allNudges = [...ruleBasedNudges, ...aiNudges];
    const existingReasons = new Set(context.existingNudges?.map(n => n.trigger_reason) || []);
    const newNudges = allNudges.filter(n => !existingReasons.has(n.trigger_reason));

    // Sort by priority and limit
    const finalNudges = newNudges
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);

    // Insert new nudges
    if (finalNudges.length > 0) {
      const nudgesToInsert = finalNudges.map(nudge => ({
        user_id: user.id,
        child_id: childId || null,
        ...nudge,
        display_after: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_impressions: nudge.display_location === 'modal' ? 1 : 3,
      }));

      const { error: insertError } = await supabase
        .from('ai_nudges')
        .insert(nudgesToInsert);

      if (insertError) {
        console.error('Error inserting nudges:', insertError);
        throw insertError;
      }
    }

    console.log(`Generated ${finalNudges.length} new nudges for user ${user.id}`);

    return new Response(JSON.stringify({ 
      generated: finalNudges.length,
      nudges: finalNudges 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-nudges function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
