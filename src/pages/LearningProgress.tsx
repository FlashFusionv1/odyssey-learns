import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useValidatedChild } from '@/hooks/useValidatedChild';
import { useChildProgressAnalytics } from '@/hooks/useChildProgressAnalytics';
import { EngagementOverview } from '@/components/progress/EngagementOverview';
import { SubjectProgressChart } from '@/components/progress/SubjectProgressChart';
import { ActivityTrendChart } from '@/components/progress/ActivityTrendChart';
import { SkillMasteryGrid } from '@/components/progress/SkillMasteryGrid';
import { AchievementTimeline } from '@/components/progress/AchievementTimeline';
import { 
  BarChart3, 
  RefreshCw, 
  AlertTriangle,
  Sparkles 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

/**
 * Learning Progress Analytics Page
 * Displays comprehensive learning analytics for a child including:
 * - Engagement overview with key metrics
 * - Subject breakdown pie chart
 * - Daily activity trend line chart
 * - Skill mastery progress grid
 * - Recent achievements timeline
 */
const LearningProgress = () => {
  const navigate = useNavigate();
  const { childId, isValidating } = useValidatedChild();
  const { analytics, loading, error, refetch, summary } = useChildProgressAnalytics(childId);
  const [childData, setChildData] = useState<{ name: string; total_points: number } | null>(null);

  // Fetch child data for layout
  useEffect(() => {
    const fetchChild = async () => {
      if (!childId) return;
      const { data } = await supabase
        .from('children')
        .select('name, total_points')
        .eq('id', childId)
        .single();
      if (data) setChildData(data);
    };
    fetchChild();
  }, [childId]);

  if (isValidating || loading) {
    return (
      <AppLayout childName={childData?.name} points={childData?.total_points}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Loading your progress...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!childId) {
    navigate('/');
    return null;
  }

  if (error) {
    return (
      <AppLayout childName={childData?.name} points={childData?.total_points}>
        <div className="space-y-6">
          <BackButton to="/dashboard" label="Back to Dashboard" />
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Progress</AlertTitle>
            <AlertDescription>
              {error}
              <Button variant="link" onClick={refetch} className="ml-2 p-0 h-auto">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  if (!analytics) {
    return (
      <AppLayout childName={childData?.name} points={childData?.total_points}>
        <div className="space-y-6">
          <BackButton to="/dashboard" label="Back to Dashboard" />
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Start Your Learning Journey!</h2>
            <p className="text-muted-foreground mb-6">
              Complete lessons to see your progress here.
            </p>
            <Button onClick={() => navigate('/lessons')}>
              Browse Lessons
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout childName={childData?.name} points={childData?.total_points}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard" label="Back" />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                My Progress
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your learning journey and achievements
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Encouragement Banner for declining trend */}
        {summary?.needsEncouragement && (
          <Alert className="border-warning bg-warning/10">
            <Sparkles className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Keep Going!</AlertTitle>
            <AlertDescription>
              Your learning has slowed down a bit this week. Set a small goal today to get back on track! 🚀
            </AlertDescription>
          </Alert>
        )}

        {/* Engagement Overview - Full width */}
        <EngagementOverview
          totalLessons={analytics.totalLessonsCompleted}
          totalMinutes={analytics.totalTimeSpentMinutes}
          averageScore={analytics.averageScore}
          currentStreak={analytics.currentStreak}
          longestStreak={analytics.longestStreak}
          engagementScore={analytics.engagementScore}
          consistencyRate={analytics.consistencyRate}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubjectProgressChart 
            data={analytics.subjectProgress} 
            title="Learning by Subject"
          />
          <ActivityTrendChart 
            data={analytics.dailyActivity}
            trend={analytics.weeklyTrend}
          />
        </div>

        {/* Skill Mastery */}
        <SkillMasteryGrid skills={analytics.skillMastery} />

        {/* Achievements */}
        <AchievementTimeline 
          achievements={analytics.recentAchievements}
          totalBadges={analytics.totalBadges}
        />

        {/* Call to Action */}
        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground mb-4">
            Ready to learn more?
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/lessons')}>
              Browse Lessons
            </Button>
            <Button variant="outline" onClick={() => navigate('/badges')}>
              View All Badges
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LearningProgress;
