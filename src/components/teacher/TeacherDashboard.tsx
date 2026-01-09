import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users, BookOpen, BarChart3, ClipboardList, 
  Plus, Search, Filter, TrendingUp, Clock,
  CheckCircle, AlertCircle, GraduationCap, Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TeacherProfile {
  id: string;
  full_name: string;
  email: string;
  subjects: string[];
  grade_levels: number[];
  school_id: string;
}

interface ClassData {
  id: string;
  name: string;
  subject: string;
  grade_level: number;
  class_code: string;
  student_count: number;
  active_assignments: number;
  avg_completion: number;
}

interface StudentProgress {
  child_id: string;
  child_name: string;
  lessons_completed: number;
  avg_score: number;
  last_active: string;
  status: 'on_track' | 'needs_attention' | 'struggling';
}

interface Assignment {
  id: string;
  title: string;
  class_name: string;
  due_date: string;
  submissions: number;
  total_students: number;
  status: string;
}

export function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [recentStudents, setRecentStudents] = useState<StudentProgress[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    avgClassScore: 0,
    pendingGrading: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get teacher profile
      const { data: profileData } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData as TeacherProfile);

        // Get classes with student counts
        const { data: classesData } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            subject,
            grade_level,
            class_code,
            class_roster(count)
          `)
          .eq('teacher_id', profileData.id)
          .eq('is_active', true);

        if (classesData) {
          const formattedClasses = classesData.map((c: any) => ({
            id: c.id,
            name: c.name,
            subject: c.subject,
            grade_level: c.grade_level,
            class_code: c.class_code,
            student_count: c.class_roster?.[0]?.count || 0,
            active_assignments: 0,
            avg_completion: 0,
          }));
          setClasses(formattedClasses);

          // Calculate stats
          setStats({
            totalStudents: formattedClasses.reduce((acc, c) => acc + c.student_count, 0),
            totalClasses: formattedClasses.length,
            avgClassScore: 78, // Placeholder - would calculate from actual data
            pendingGrading: 12, // Placeholder
          });
        }

        // Get upcoming assignments
        const { data: assignmentsData } = await supabase
          .from('class_assignments')
          .select(`
            id,
            title,
            due_date,
            status,
            classes(name)
          `)
          .eq('teacher_id', profileData.id)
          .eq('status', 'published')
          .gte('due_date', new Date().toISOString())
          .order('due_date', { ascending: true })
          .limit(5);

        if (assignmentsData) {
          const formattedAssignments = assignmentsData.map((a: any) => ({
            id: a.id,
            title: a.title,
            class_name: a.classes?.name || 'Unknown',
            due_date: a.due_date,
            submissions: 0,
            total_students: 0,
            status: a.status,
          }));
          setUpcomingAssignments(formattedAssignments);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-success/10 text-success';
      case 'needs_attention': return 'bg-warning/10 text-warning';
      case 'struggling': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="text-center p-8">
        <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Welcome, Teacher!</h2>
        <p className="text-muted-foreground mb-4">
          Complete your profile setup to access the teacher dashboard.
        </p>
        <Button>Complete Profile Setup</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile.full_name}!</h1>
          <p className="text-muted-foreground">
            {profile.subjects?.join(', ')} • Grades {profile.grade_levels?.map(g => g === 0 ? 'K' : g).join(', ')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" /> Schedule
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> New Assignment
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Students</p>
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
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgClassScore}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingGrading}</p>
                <p className="text-sm text-muted-foreground">To Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Classes</CardTitle>
                <CardDescription>Manage your active classes</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Class
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No classes yet. Create your first class to get started.</p>
                </div>
              ) : (
                classes.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {cls.grade_level === 0 ? 'K' : cls.grade_level}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{cls.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{cls.subject}</Badge>
                          <span>•</span>
                          <span>{cls.student_count} students</span>
                          <span>•</span>
                          <span className="font-mono text-xs">{cls.class_code}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Completion</span>
                        <Progress value={cls.avg_completion} className="w-20 h-2" />
                        <span className="text-sm font-medium">{cls.avg_completion}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Due this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming assignments</p>
                </div>
              ) : (
                upcomingAssignments.map(assignment => (
                  <div key={assignment.id} className="p-3 rounded-lg border">
                    <h4 className="font-medium text-sm">{assignment.title}</h4>
                    <p className="text-xs text-muted-foreground">{assignment.class_name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                      <span className="text-xs">
                        {assignment.submissions}/{assignment.total_students} submitted
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Needing Attention */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Students Overview</CardTitle>
              <CardDescription>Track student progress across your classes</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-9 w-[200px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="attention">Needs Attention</TabsTrigger>
              <TabsTrigger value="top">Top Performers</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Student data will appear here as students join your classes.</p>
              </div>
            </TabsContent>
            <TabsContent value="attention" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Students who may need extra support will appear here.</p>
              </div>
            </TabsContent>
            <TabsContent value="top" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Top performing students will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}