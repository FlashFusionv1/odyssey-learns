import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/integrations/supabase/client";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, Save, Share2, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

export default function LessonAnalytics() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { childId, isValidating } = useValidatedChild();
  const [lesson, setLesson] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  useEffect(() => {
    if (!isValidating && childId && lessonId) {
      loadAnalytics();
    }
  }, [childId, isValidating, lessonId]);

  const loadAnalytics = async () => {
    try {
      // Load lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('child_generated_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;
      
      // Check ownership
      const { data: child } = await supabase
        .from('children')
        .select('parent_id')
        .eq('id', lessonData.creator_child_id)
        .single();

      const { data: { user } } = await supabase.auth.getUser();
      
      if (child?.parent_id !== user?.id) {
        toast.error('You do not have access to this lesson analytics');
        return;
      }

      setLesson(lessonData);

      // Load analytics
      // @ts-ignore
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('lesson_analytics')
        .select('*')
        .eq('lesson_id', lessonId)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        console.error('Analytics error:', analyticsError);
      }

      setAnalytics(analyticsData || {
        total_views: 0,
        unique_viewers: 0,
        total_saves: 0,
        total_shares: 0,
        engagement_score: 0
      });

      // Load timeline data (last 7 days)
      // @ts-ignore
      const { data: eventsData } = await supabase
        .from('lesson_analytics_events')
        .select('event_type, created_at')
        .eq('lesson_id', lessonId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (eventsData) {
        const groupedByDay: Record<string, { date: string; views: number; saves: number; shares: number }> = {};
        
        eventsData.forEach((event: any) => {
          const date = new Date(event.created_at).toLocaleDateString();
          if (!groupedByDay[date]) {
            groupedByDay[date] = { date, views: 0, saves: 0, shares: 0 };
          }
          if (event.event_type === 'view') groupedByDay[date].views++;
          if (event.event_type === 'save') groupedByDay[date].saves++;
          if (event.event_type === 'share') groupedByDay[date].shares++;
        });

        setTimelineData(Object.values(groupedByDay));
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
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

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        <BackButton to="/creator-dashboard" label="Back to Dashboard" />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lesson Analytics</h1>
            <p className="text-muted-foreground">{lesson?.title}</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {lesson?.subject}
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_views}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.unique_viewers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saves</CardTitle>
              <Save className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_saves}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_shares}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.engagement_score?.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time (Last 7 Days)</CardTitle>
              <CardDescription>Daily view count trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Breakdown</CardTitle>
              <CardDescription>Saves and shares comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="saves" fill="hsl(var(--secondary))" />
                  <Bar dataKey="shares" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}