import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, BookOpen, Calendar as CalendarIcon, Clock, 
  CheckCircle, AlertCircle, Send, Eye, Edit, Trash2,
  Users, BarChart3, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface Assignment {
  id: string;
  title: string;
  description: string;
  class_id: string;
  class_name: string;
  lesson_id: string | null;
  assignment_type: string;
  due_date: string;
  points_possible: number;
  status: string;
  submissions_count: number;
  total_students: number;
  avg_score: number | null;
}

interface ClassOption {
  id: string;
  name: string;
  subject: string;
  grade_level: number;
}

interface LessonOption {
  id: string;
  title: string;
  subject: string;
  grade_level: number;
}

export function AssignmentManager() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    class_id: '',
    lesson_id: '',
    assignment_type: 'lesson',
    due_date: new Date(),
    points_possible: 100,
    is_graded: true,
    allow_late_submission: true,
    late_penalty_percent: 10,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        // Load classes
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name, subject, grade_level')
          .eq('teacher_id', profileData.id)
          .eq('is_active', true);

        if (classesData) setClasses(classesData);

        // Load assignments
        const { data: assignmentsData } = await supabase
          .from('class_assignments')
          .select(`
            id,
            title,
            description,
            class_id,
            lesson_id,
            assignment_type,
            due_date,
            points_possible,
            status,
            classes(name)
          `)
          .eq('teacher_id', profileData.id)
          .order('due_date', { ascending: true });

        if (assignmentsData) {
          const formattedAssignments = assignmentsData.map((a: any) => ({
            ...a,
            class_name: a.classes?.name || 'Unknown',
            submissions_count: 0,
            total_students: 0,
            avg_score: null,
          }));
          setAssignments(formattedAssignments);
        }

        // Load available lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('id, title, subject, grade_level')
          .eq('is_active', true)
          .order('title');

        if (lessonsData) setLessons(lessonsData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.class_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profileData) return;

      const { error } = await supabase
        .from('class_assignments')
        .insert({
          teacher_id: profileData.id,
          class_id: newAssignment.class_id,
          lesson_id: newAssignment.lesson_id || null,
          title: newAssignment.title,
          description: newAssignment.description,
          assignment_type: newAssignment.assignment_type,
          due_date: newAssignment.due_date.toISOString(),
          points_possible: newAssignment.points_possible,
          is_graded: newAssignment.is_graded,
          allow_late_submission: newAssignment.allow_late_submission,
          late_penalty_percent: newAssignment.late_penalty_percent,
          status: 'draft',
        });

      if (error) throw error;

      toast.success('Assignment created successfully!');
      setShowCreateDialog(false);
      setNewAssignment({
        title: '',
        description: '',
        class_id: '',
        lesson_id: '',
        assignment_type: 'lesson',
        due_date: new Date(),
        points_possible: 100,
        is_graded: true,
        allow_late_submission: true,
        late_penalty_percent: 10,
      });
      loadData();
    } catch (err) {
      console.error('Error creating assignment:', err);
      toast.error('Failed to create assignment');
    }
  };

  const handlePublishAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('class_assignments')
        .update({ status: 'published' })
        .eq('id', assignmentId);

      if (error) throw error;
      toast.success('Assignment published!');
      loadData();
    } catch (err) {
      console.error('Error publishing:', err);
      toast.error('Failed to publish assignment');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Delete this assignment? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('class_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      toast.success('Assignment deleted');
      loadData();
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Failed to delete assignment');
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isPastDue = now > due;

    switch (status) {
      case 'published':
        if (isPastDue) {
          return <Badge className="bg-muted text-muted-foreground">Closed</Badge>;
        }
        return <Badge className="bg-success/10 text-success">Active</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (activeTab === 'active') return a.status === 'published' && new Date(a.due_date) >= new Date();
    if (activeTab === 'draft') return a.status === 'draft';
    if (activeTab === 'past') return a.status === 'published' && new Date(a.due_date) < new Date();
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignments</h2>
          <p className="text-muted-foreground">Create and manage class assignments</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>Assign lessons or activities to your class</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="assignment-title">Assignment Title *</Label>
                <Input
                  id="assignment-title"
                  name="assignment-title"
                  placeholder="e.g., Chapter 3 Reading"
                  value={newAssignment.title}
                  onChange={e => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Class *</Label>
                <Select
                  value={newAssignment.class_id}
                  onValueChange={v => setNewAssignment(prev => ({ ...prev, class_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.subject})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assignment Type</Label>
                  <Select
                    value={newAssignment.assignment_type}
                    onValueChange={v => setNewAssignment(prev => ({ ...prev, assignment_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="homework">Homework</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={newAssignment.points_possible}
                    onChange={e => setNewAssignment(prev => ({ ...prev, points_possible: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Link to Lesson (Optional)</Label>
                <Select
                  value={newAssignment.lesson_id}
                  onValueChange={v => setNewAssignment(prev => ({ ...prev, lesson_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No lesson</SelectItem>
                    {lessons.slice(0, 50).map(l => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newAssignment.due_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newAssignment.due_date}
                      onSelect={date => date && setNewAssignment(prev => ({ ...prev, due_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignment-description">Description</Label>
                <Textarea
                  id="assignment-description"
                  name="assignment-description"
                  placeholder="Instructions for students..."
                  value={newAssignment.description}
                  onChange={e => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="graded">Graded Assignment</Label>
                  <Switch
                    id="graded"
                    checked={newAssignment.is_graded}
                    onCheckedChange={c => setNewAssignment(prev => ({ ...prev, is_graded: c }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="late">Allow Late Submissions</Label>
                  <Switch
                    id="late"
                    checked={newAssignment.allow_late_submission}
                    onCheckedChange={c => setNewAssignment(prev => ({ ...prev, allow_late_submission: c }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAssignment}>Create Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <h4 className="font-medium mb-1">No assignments</h4>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'draft' ? "You don't have any draft assignments" : "Create your first assignment to get started"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map(assignment => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{assignment.title}</span>
                            {assignment.lesson_id && (
                              <Badge variant="outline" className="ml-2">
                                <BookOpen className="w-3 h-3 mr-1" /> Linked
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{assignment.class_name}</TableCell>
                        <TableCell className="capitalize">{assignment.assignment_type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(assignment.status, assignment.due_date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            {assignment.submissions_count}/{assignment.total_students}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {assignment.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublishAssignment(assignment.id)}
                              >
                                <Send className="w-4 h-4 mr-1" /> Publish
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}