import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, TrendingUp, Settings, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import { CelebrationModal } from "@/components/celebration/CelebrationModal";
import { generateDailyQuest, isQuestStale } from "@/lib/questGenerator";
import { AvatarCustomizer } from "@/components/avatar/AvatarCustomizer";
import { EmotionCheckIn } from "@/components/emotional/EmotionCheckIn";
import { BadgeShowcase } from "@/components/badges/BadgeShowcase";
import { checkAndAwardBadges } from "@/lib/badgeChecker";
import { DailyQuest } from "@/components/quests/DailyQuest";
import { AILessonGenerator } from "@/components/learning/AILessonGenerator";
import { LessonTokenDisplay } from "@/components/gamification/LessonTokenDisplay";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { ShareLessonModal } from "@/components/learning/ShareLessonModal";
import { LessonCard, LessonCardCompact } from "@/components/learning/LessonCard";
import { StatCard } from "@/components/ui/stat-card";
import { ChildOnboardingTutorial, HelpButton, FeatureSpotlight } from "@/components/onboarding";

/**
 * Feature tour steps for child dashboard
 * Highlights key features after onboarding
 */
const CHILD_FEATURE_TOUR_STEPS = [
  {
    targetSelector: '[data-tour="daily-quest"]',
    title: 'Daily Quest',
    description: 'Complete your daily quest to earn bonus points!',
    placement: 'bottom' as const,
  },
  {
    targetSelector: '[data-tour="lesson-tokens"]',
    title: 'Lesson Tokens',
    description: 'These show how many lessons you can do today.',
    placement: 'bottom' as const,
  },
  {
    targetSelector: '[data-tour="custom-lesson"]',
    title: 'Create Your Own Lesson',
    description: 'Ask for a lesson about anything you want to learn!',
    placement: 'top' as const,
  },
  {
    targetSelector: '[data-tour="emotion-checkin"]',
    title: 'How Are You Feeling?',
    description: 'Tell us how you feel - it helps us pick the best activities.',
    placement: 'top' as const,
  },
  {
    targetSelector: '[data-tour="leaderboard"]',
    title: 'See How You Rank',
    description: 'Check the leaderboard to see your progress compared to others!',
    placement: 'top' as const,
  },
];

const ChildDashboard = () => {
  const { childId, isValidating } = useValidatedChild();
  const [child, setChild] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [stats, setStats] = useState({ completed: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [dailyQuest, setDailyQuest] = useState<any>(null);
  const [celebration, setCelebration] = useState<any>(null);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [myLessons, setMyLessons] = useState<any[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showChildOnboarding, setShowChildOnboarding] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const navigate = useNavigate();

  // Check child onboarding status on mount
  useEffect(() => {
    if (childId) {
      const storageKey = `child_onboarding_${childId}`;
      const storedData = localStorage.getItem(storageKey);
      if (!storedData) {
        setShowChildOnboarding(true);
      }
    }
  }, [childId]);

  const handleOnboardingComplete = useCallback(() => {
    if (childId) {
      const storageKey = `child_onboarding_${childId}`;
      localStorage.setItem(storageKey, JSON.stringify({ isCompleted: true }));
      setShowChildOnboarding(false);
    }
  }, [childId]);

  useEffect(() => {
    if (!isValidating && childId) {
      loadDashboardData();
    }
  }, [childId, isValidating]);

  const loadDashboardData = async () => {
    if (!childId) return;

    // Fetch child data
    const { data: childData } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single();

    // Fetch lessons for the child's grade
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('grade_level', childData?.grade_level || 1)
      .eq('is_active', true)
      .limit(6);

    // Fetch completed lessons count
    const { data: progressData, count: completedCount } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact' })
      .eq('child_id', childId)
      .eq('status', 'completed');

    // Calculate streak using optimized database function
    const { data: streakData } = await supabase.rpc('calculate_streak', { p_child_id: childId });
    const streak = streakData || 0;

    setChild(childData);
    setLessons(lessonsData || []);
    setStats({ completed: completedCount || 0, streak });

    // Generate or load daily quest
    if (childData) {
      await loadOrGenerateQuest(childData);
    }

    setLoading(false);
  };

  const loadOrGenerateQuest = async (childData: any) => {
    // Check if quest needs to be regenerated
    const needsNewQuest = 
      !childData.daily_quest_id || 
      isQuestStale(childData.quest_completed_at);

    if (needsNewQuest) {
      const quest = await generateDailyQuest(childData.id, childData.grade_level);
      if (quest) {
        // Save quest to database
        await supabase
          .from('children')
          .update({ 
            daily_quest_id: quest.lesson_id,
            quest_bonus_points: quest.bonus_points,
            quest_completed_at: null
          })
          .eq('id', childData.id);

        // Load full lesson details
        const { data: questLesson } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', quest.lesson_id)
          .single();

        setDailyQuest({ ...quest, lesson: questLesson });
      }
    } else if (childData.daily_quest_id) {
      // Load existing quest
      const { data: questLesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', childData.daily_quest_id)
        .single();

      setDailyQuest({
        lesson_id: childData.daily_quest_id,
        bonus_points: childData.quest_bonus_points,
        lesson: questLesson,
      });
    }

    // Load child's custom lessons
    const { data: customLessons } = await supabase
      .from('child_generated_lessons' as any)
      .select('*')
      .eq('creator_child_id', childId)
      .order('created_at', { ascending: false });

    setMyLessons(customLessons || []);
  };

  if (isValidating || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!childId) {
    navigate('/');
    return null;
  }

  return (
    <AppLayout childName={child?.name} points={child?.total_points || 0}>
      {/* Child Onboarding Tutorial */}
      {child && (
        <ChildOnboardingTutorial
          open={showChildOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
          gradeLevel={child.grade_level}
          childName={child.name}
        />
      )}
      
      {/* Feature Tour Spotlight */}
      <FeatureSpotlight
        steps={CHILD_FEATURE_TOUR_STEPS}
        isActive={showFeatureTour}
        onComplete={() => setShowFeatureTour(false)}
        onSkip={() => setShowFeatureTour(false)}
      />
      
      {/* Help Button */}
      <HelpButton
        variant="child"
        gradeLevel={child?.grade_level}
        onRestartTutorial={() => setShowChildOnboarding(true)}
        onStartFeatureTour={() => setShowFeatureTour(true)}
      />
      
      {celebration && (
        <CelebrationModal
          open={true}
          onClose={() => setCelebration(null)}
          type={celebration.type}
          title={celebration.title}
          message={celebration.message}
          points={celebration.points}
          gradeLevel={child?.grade_level || 5}
        />
      )}
      {showAvatarCustomizer && child && (
        <AvatarCustomizer
          open={showAvatarCustomizer}
          onClose={() => setShowAvatarCustomizer(false)}
          childId={child.id}
          currentConfig={child.avatar_config}
          onSave={(newConfig) => {
            setChild({ ...child, avatar_config: newConfig });
            setShowAvatarCustomizer(false);
          }}
        />
      )}
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {child?.name}! 👋
          </h1>
          <p className="text-muted-foreground mb-4">
            Ready to learn something amazing today?
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAvatarCustomizer(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Customize Avatar
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour="stats-overview">
          <StatCard
            title="Lessons Completed"
            value={stats.completed}
            icon={BookOpen}
            variant="primary"
            className="elevated-card hover-scale"
          />

          <StatCard
            title="Total Points"
            value={child?.total_points || 0}
            icon={Award}
            variant="accent"
            className="elevated-card hover-scale"
          />

          <StatCard
            title="Learning Streak"
            value={`${stats.streak} days`}
            icon={TrendingUp}
            variant="success"
            className="elevated-card hover-scale"
          />
        </div>

        {/* View Progress Link */}
        <div className="flex justify-center" data-tour="progress-button">
          <Button variant="outline" onClick={() => navigate('/progress')} className="gap-2">
            <BarChart3 className="w-4 h-4" />
            View My Progress
          </Button>
        </div>

        {/* Daily Quest - Age-Adaptive UI */}
        <div data-tour="daily-quest">
          <DailyQuest />
        </div>

        {/* Lesson Tokens Display */}
        {child && (
          <div data-tour="lesson-tokens">
            <LessonTokenDisplay childId={child.id} />
          </div>
        )}

        {/* AI Lesson Generator */}
        {child && (
          <div data-tour="custom-lesson">
            <AILessonGenerator
              childId={child.id}
              gradeLevel={child.grade_level}
              onLessonCreated={(lesson) => {
                setCelebration({
                  type: 'lesson',
                  title: '✨ Lesson Created!',
                  message: `Your custom lesson "${lesson.title}" is ready to explore!`,
                  points: 0,
                });
                loadDashboardData();
              }}
            />
          </div>
        )}

        {/* My Custom Lessons */}
        {myLessons.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">My Custom Lessons</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myLessons.map((lesson) => (
                <LessonCardCompact
                  key={lesson.id}
                  lesson={lesson}
                  onShare={() => {
                    setSelectedLesson(lesson);
                    setShareModalOpen(true);
                  }}
                />
              ))}
            </div>
          </Card>
        )}

        {selectedLesson && (
          <ShareLessonModal
            lessonId={selectedLesson.id}
            lessonTitle={selectedLesson.title}
            open={shareModalOpen}
            onOpenChange={setShareModalOpen}
            onSuccess={() => loadDashboardData()}
          />
        )}

        {/* Emotional Check-In */}
        <div data-tour="emotion-checkin">
          <EmotionCheckIn 
            childId={childId} 
            gradeLevel={child?.grade_level || 5}
            onComplete={async () => {
              // Check for new badges after emotion check-in
              const newBadges = await checkAndAwardBadges(childId);
              if (newBadges.length > 0) {
                setCelebration({
                  type: 'badge',
                  title: '🏆 New Badge Earned!',
                  message: `You've unlocked ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`,
                  points: 0,
                });
              }
            }}
          />
        </div>

        {/* Badge Showcase */}
        <div data-tour="badges">
          <BadgeShowcase childId={childId} compact />
        </div>

        {/* Leaderboard - Age Adaptive */}
        {child && (
          <div data-tour="leaderboard">
            <Leaderboard
              childId={childId}
              gradeLevel={child.grade_level}
              compact
            />
          </div>
        )}

        {/* Available Lessons */}
        <div data-tour="lessons">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Start Learning</h2>
            <Button variant="ghost" onClick={() => navigate('/lessons')}>
              View All
            </Button>
          </div>

          {lessons.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No lessons available yet. Check back soon!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className="elevated-card"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ChildDashboard;