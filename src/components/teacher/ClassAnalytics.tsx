import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, BookOpen, 
  Clock, Award, AlertTriangle, CheckCircle 
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ClassAnalyticsProps {
  teacherId?: string;
}

interface ClassAnalyticsData {
  id: string;
  class_id: string;
  analytics_date: string;
  active_students: number;
  lessons_completed: number;
  assignments_completed: number;
  avg_score: number;
  avg_time_spent_minutes: number;
  engagement_score: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--muted))'];

export function ClassAnalytics({ teacherId }: ClassAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [analyticsData, setAnalyticsData] = useState<ClassAnalyticsData[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadClasses();
  }, [teacherId]);

  useEffect(() => {
    loadAnalytics();
  }, [selectedClass, timeRange]);

  const loadClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name')
          .eq('teacher_id', profileData.id)
          .eq('is_active', true);

        setClasses(classesData || []);
      }
    } catch (err) {
      console.error('Error loading classes:', err);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      let query = supabase
        .from('class_analytics')
        .select('*')
        .gte('analytics_date', startDate.toISOString().split('T')[0])
        .order('analytics_date', { ascending: true });

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      } else if (classes.length > 0) {
        query = query.in('class_id', classes.map(c => c.id));
      }

      const { data } = await query;
      setAnalyticsData((data as ClassAnalyticsData[]) || []);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary metrics
  const summary = {
    totalStudents: analyticsData.length > 0 
      ? Math.max(...analyticsData.map(d => d.active_students || 0))
      : 0,
    avgScore: analyticsData.length > 0
      ? Math.round(analyticsData.reduce((acc, d) => acc + (d.avg_score || 0), 0) / analyticsData.length)
      : 0,
    totalLessons: analyticsData.reduce((acc, d) => acc + (d.lessons_completed || 0), 0),
    avgEngagement: analyticsData.length > 0
      ? Math.round(analyticsData.reduce((acc, d) => acc + (d.engagement_score || 0), 0) / analyticsData.length)
      : 0,
  };

  // Prepare chart data
  const chartData = analyticsData.map(d => ({
    date: new Date(d.analytics_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: d.avg_score || 0,
    engagement: d.engagement_score || 0,
    lessons: d.lessons_completed || 0,
    time: d.avg_time_spent_minutes || 0,
  }));

  // Subject distribution (mock data - would come from actual analytics)
  const subjectData = [
    { name: 'Math', value: 35 },
    { name: 'Reading', value: 30 },
    { name: 'Science', value: 20 },
    { name: 'Other', value: 15 },
  ];

  if (loading && analyticsData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d' | '90d')}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.avgScore}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.totalLessons}</p>
                <p className="text-sm text-muted-foreground">Lessons Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.avgEngagement}%</p>
                <p className="text-sm text-muted-foreground">Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Score Trends</CardTitle>
              <CardDescription>Average class performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No performance data available yet</p>
                    <p className="text-sm">Data will appear as students complete assignments</p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.2}
                        name="Avg Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement & Activity</CardTitle>
              <CardDescription>Student engagement and lesson completion trends</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No engagement data available yet</p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="lessons" fill="hsl(var(--primary))" name="Lessons" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="engagement" fill="hsl(var(--success))" name="Engagement %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Subject Distribution</CardTitle>
              <CardDescription>Lessons completed by subject area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {subjectData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                      />
                      <span className="text-sm">{entry.name}</span>
                      <span className="text-sm text-muted-foreground">({entry.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts & Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions based on class performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.avgScore < 70 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Average score below target</p>
                  <p className="text-sm text-muted-foreground">
                    Consider reviewing recent lessons and providing additional practice materials.
                  </p>
                </div>
              </div>
            )}
            
            {summary.avgEngagement < 60 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <TrendingDown className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Low engagement detected</p>
                  <p className="text-sm text-muted-foreground">
                    Try incorporating more interactive activities or gamification elements.
                  </p>
                </div>
              </div>
            )}

            {summary.avgScore >= 80 && summary.avgEngagement >= 70 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Excellent class performance!</p>
                  <p className="text-sm text-muted-foreground">
                    Your students are engaged and performing well. Keep up the great work!
                  </p>
                </div>
              </div>
            )}

            {analyticsData.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">More insights will appear as students complete activities</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
