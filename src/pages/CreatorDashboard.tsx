import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BackButton } from "@/components/ui/back-button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import { useNavigate } from "react-router-dom";
import { Award, TrendingUp, Eye, Save, Share2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface CreatorStats {
  total_points: number;
  level: number;
  badges: string[];
}

interface LessonStats {
  id: string;
  title: string;
  subject: string;
  share_status: string;
  analytics: {
    total_views: number;
    total_saves: number;
    total_shares: number;
    engagement_score: number;
  };
}

const LEVEL_THRESHOLDS = [
  { level: 1, minPoints: 0, name: "Beginner Creator" },
  { level: 2, minPoints: 500, name: "Rising Creator" },
  { level: 3, minPoints: 1500, name: "Top Educator" },
  { level: 4, minPoints: 5000, name: "Master Instructor" },
];

export default function CreatorDashboard() {
  const { childId, isValidating } = useValidatedChild();
  const navigate = useNavigate();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [lessons, setLessons] = useState<LessonStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isValidating && childId) {
      loadCreatorData();
    }
  }, [childId, isValidating]);

  const loadCreatorData = async () => {
    try {
      // Load creator rewards
      // @ts-ignore
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('creator_rewards')
        .select('*')
        .eq('child_id', childId)
        .single();

      if (rewardsError && rewardsError.code !== 'PGRST116') {
        console.error('Rewards error:', rewardsError);
      }

      setStats(rewardsData || { total_points: 0, level: 1, badges: [] });

      // Load lessons with analytics
      // @ts-ignore
      const { data: lessonsData } = await supabase
        .from('child_generated_lessons')
        .select(`
          id,
          title,
          subject,
          share_status,
          lesson_analytics (
            total_views,
            total_saves,
            total_shares,
            engagement_score
          )
        `)
        .eq('creator_child_id', childId)
        .order('created_at', { ascending: false });

      const formattedLessons = (lessonsData || []).map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        share_status: lesson.share_status,
        analytics: lesson.lesson_analytics || {
          total_views: 0,
          total_saves: 0,
          total_shares: 0,
          engagement_score: 0
        }
      }));

      setLessons(formattedLessons);

      // Load recent reward history
      // @ts-ignore
      const { data: historyData } = await supabase
        .from('creator_reward_history')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentActivity(historyData || []);
    } catch (err) {
      console.error('Error loading creator data:', err);
      toast.error('Failed to load creator dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevel = () => {
    if (!stats) return LEVEL_THRESHOLDS[0];
    return LEVEL_THRESHOLDS.find(l => l.level === stats.level) || LEVEL_THRESHOLDS[0];
  };

  const getNextLevel = () => {
    if (!stats) return LEVEL_THRESHOLDS[1];
    const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === stats.level + 1);
    return nextLevel || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  };

  const getProgressToNextLevel = () => {
    if (!stats) return 0;
    const current = getCurrentLevel();
    const next = getNextLevel();
    if (current.level === next.level) return 100;
    const progress = ((stats.total_points - current.minPoints) / (next.minPoints - current.minPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (isValidating || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = getProgressToNextLevel();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <BackButton to="/dashboard" label="Back to Dashboard" />

        <div className="text-center">
          <div className="inline-block w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-4">
            <Award className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
          <p className="text-muted-foreground">Track your impact and rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Creator Level</CardTitle>
              <CardDescription>
                Level {currentLevel.level} - {currentLevel.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{stats?.total_points} points</span>
                <span className="text-sm text-muted-foreground">
                  {nextLevel.minPoints} points for Level {nextLevel.level}
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {nextLevel.minPoints - (stats?.total_points || 0)} points until next level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges Earned</CardTitle>
              <CardDescription>{stats?.badges.length || 0} badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.badges.map((badge, idx) => (
                  <Badge key={idx} variant="secondary" className="w-full justify-center py-2">
                    {badge}
                  </Badge>
                ))}
                {(!stats?.badges || stats.badges.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center">
                    Keep creating to earn badges!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lessons Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Lessons</CardTitle>
            <CardDescription>Performance metrics for all your lessons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-center py-3 px-4"><Eye className="w-4 h-4 mx-auto" /></th>
                    <th className="text-center py-3 px-4"><Save className="w-4 h-4 mx-auto" /></th>
                    <th className="text-center py-3 px-4"><Share2 className="w-4 h-4 mx-auto" /></th>
                    <th className="text-center py-3 px-4"><TrendingUp className="w-4 h-4 mx-auto" /></th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map(lesson => (
                    <tr key={lesson.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{lesson.title}</td>
                      <td className="py-3 px-4">
                        <Badge variant={lesson.share_status === 'public' ? 'default' : 'secondary'}>
                          {lesson.share_status}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">{lesson.analytics.total_views}</td>
                      <td className="text-center py-3 px-4">{lesson.analytics.total_saves}</td>
                      <td className="text-center py-3 px-4">{lesson.analytics.total_shares}</td>
                      <td className="text-center py-3 px-4">{lesson.analytics.engagement_score.toFixed(2)}</td>
                      <td className="text-right py-3 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/lesson-analytics/${lesson.id}`)}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lessons.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  No lessons yet. Create your first lesson to start earning rewards!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest rewards and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{activity.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={activity.points_change > 0 ? 'default' : 'secondary'}>
                    {activity.points_change > 0 ? '+' : ''}{activity.points_change} points
                  </Badge>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}