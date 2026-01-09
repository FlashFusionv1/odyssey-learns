import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, Users, Copy, Settings, MoreHorizontal,
  UserPlus, UserMinus, Mail, Download, Upload,
  CheckCircle, XCircle, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ClassStudent {
  id: string;
  child_id: string;
  child_name: string;
  enrollment_status: string;
  enrolled_at: string;
  lessons_completed: number;
  avg_score: number;
}

interface ClassDetails {
  id: string;
  name: string;
  subject: string;
  grade_level: number;
  class_code: string;
  description: string;
  max_students: number;
  academic_year: string;
  semester: string;
  students: ClassStudent[];
}

const SUBJECTS = ['Reading', 'Math', 'Science', 'Social Studies', 'Emotional Intelligence', 'Life Skills'];
const GRADES = Array.from({ length: 13 }, (_, i) => ({ value: i, label: i === 0 ? 'Kindergarten' : `Grade ${i}` }));

export function ClassManagement() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassDetails[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    grade_level: 0,
    description: '',
    max_students: 35,
    academic_year: '2025-2026',
    semester: 'Fall',
  });
  const [studentCode, setStudentCode] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
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
        const { data: classesData } = await supabase
          .from('classes')
          .select(`
            id,
            name,
            subject,
            grade_level,
            class_code,
            description,
            max_students,
            academic_year,
            semester,
            class_roster(
              id,
              child_id,
              enrollment_status,
              enrolled_at,
              children(name)
            )
          `)
          .eq('teacher_id', profileData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (classesData) {
          const formattedClasses = classesData.map((c: any) => ({
            ...c,
            students: (c.class_roster || []).map((r: any) => ({
              id: r.id,
              child_id: r.child_id,
              child_name: r.children?.name || 'Unknown',
              enrollment_status: r.enrollment_status,
              enrolled_at: r.enrolled_at,
              lessons_completed: 0,
              avg_score: 0,
            })),
          }));
          setClasses(formattedClasses);
          if (formattedClasses.length > 0 && !selectedClass) {
            setSelectedClass(formattedClasses[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('teacher_profiles')
        .select('id, school_id')
        .eq('user_id', user.id)
        .single();

      if (!profileData) {
        toast.error('Teacher profile not found');
        return;
      }

      const { data, error } = await supabase
        .from('classes')
        .insert({
          teacher_id: profileData.id,
          school_id: profileData.school_id,
          ...newClass,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Class created successfully!');
      setShowCreateDialog(false);
      setNewClass({
        name: '',
        subject: '',
        grade_level: 0,
        description: '',
        max_students: 35,
        academic_year: '2025-2026',
        semester: 'Fall',
      });
      loadClasses();
    } catch (err) {
      console.error('Error creating class:', err);
      toast.error('Failed to create class');
    }
  };

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Class code copied to clipboard!');
  };

  const handleRemoveStudent = async (rosterId: string) => {
    if (!confirm('Remove this student from the class?')) return;

    try {
      const { error } = await supabase
        .from('class_roster')
        .update({ enrollment_status: 'withdrawn', withdrawn_at: new Date().toISOString() })
        .eq('id', rosterId);

      if (error) throw error;
      toast.success('Student removed from class');
      loadClasses();
    } catch (err) {
      console.error('Error removing student:', err);
      toast.error('Failed to remove student');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'pending':
        return <Badge className="bg-warning/10 text-warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'withdrawn':
        return <Badge className="bg-destructive/10 text-destructive"><XCircle className="w-3 h-3 mr-1" /> Withdrawn</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
          <h2 className="text-2xl font-bold">Class Management</h2>
          <p className="text-muted-foreground">Manage your classes and student roster</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>Set up a new class for your students</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Class Name *</Label>
                <Input
                  placeholder="e.g., Math Period 1"
                  value={newClass.name}
                  onChange={e => setNewClass(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select
                    value={newClass.subject}
                    onValueChange={v => setNewClass(prev => ({ ...prev, subject: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grade Level *</Label>
                  <Select
                    value={newClass.grade_level.toString()}
                    onValueChange={v => setNewClass(prev => ({ ...prev, grade_level: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map(g => (
                        <SelectItem key={g.value} value={g.value.toString()}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Optional class description..."
                  value={newClass.description}
                  onChange={e => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Select
                    value={newClass.academic_year}
                    onValueChange={v => setNewClass(prev => ({ ...prev, academic_year: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select
                    value={newClass.semester}
                    onValueChange={v => setNewClass(prev => ({ ...prev, semester: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fall">Fall</SelectItem>
                      <SelectItem value="Spring">Spring</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                      <SelectItem value="Year-Round">Year-Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateClass}>Create Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Class List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">YOUR CLASSES</h3>
          {classes.length === 0 ? (
            <Card className="p-6 text-center">
              <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No classes yet</p>
            </Card>
          ) : (
            classes.map(cls => (
              <Card
                key={cls.id}
                className={`cursor-pointer transition-all ${
                  selectedClass?.id === cls.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedClass(cls)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{cls.name}</h4>
                      <p className="text-sm text-muted-foreground">{cls.subject}</p>
                    </div>
                    <Badge variant="secondary">
                      {cls.students.filter(s => s.enrollment_status === 'active').length} students
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Class Details */}
        <div className="lg:col-span-3">
          {selectedClass ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedClass.name}</CardTitle>
                    <CardDescription>
                      {selectedClass.subject} • Grade {selectedClass.grade_level === 0 ? 'K' : selectedClass.grade_level} • {selectedClass.academic_year}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                      <span className="text-sm font-mono">{selectedClass.class_code}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyClassCode(selectedClass.class_code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Student Roster ({selectedClass.students.filter(s => s.enrollment_status === 'active').length}/{selectedClass.max_students})</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-1" /> Import
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" /> Export
                    </Button>
                    <Button size="sm" onClick={() => setShowAddStudentDialog(true)}>
                      <UserPlus className="w-4 h-4 mr-1" /> Add Student
                    </Button>
                  </div>
                </div>

                {selectedClass.students.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h4 className="font-medium mb-1">No students yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share your class code <span className="font-mono bg-muted px-2 py-1 rounded">{selectedClass.class_code}</span> with students to join
                    </p>
                    <Button onClick={() => setShowAddStudentDialog(true)}>
                      <UserPlus className="w-4 h-4 mr-2" /> Add Students
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Lessons</TableHead>
                        <TableHead>Avg Score</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClass.students.map(student => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{student.child_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student.child_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(student.enrollment_status)}</TableCell>
                          <TableCell>{student.lessons_completed}</TableCell>
                          <TableCell>{student.avg_score}%</TableCell>
                          <TableCell>{new Date(student.enrolled_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveStudent(student.id)}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a class to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Students to Class</DialogTitle>
            <DialogDescription>
              Share your class code or add students manually
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted text-center">
              <p className="text-sm text-muted-foreground mb-2">Class Code</p>
              <p className="text-3xl font-mono font-bold">{selectedClass?.class_code}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => copyClassCode(selectedClass?.class_code || '')}>
                <Copy className="w-4 h-4 mr-2" /> Copy Code
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or invite by email</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Student/Parent Email</Label>
              <div className="flex gap-2">
                <Input placeholder="Enter email address..." />
                <Button>
                  <Mail className="w-4 h-4 mr-2" /> Invite
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}