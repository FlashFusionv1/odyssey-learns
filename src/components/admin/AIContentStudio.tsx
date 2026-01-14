import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, BookOpen, Target, Clock, FileText, 
  Zap, CheckCircle, AlertCircle, Loader2, RefreshCw,
  GraduationCap, Layers, Settings2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LessonTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  difficulty: string;
  grade_level_min: number;
  grade_level_max: number;
  learning_objectives: string[];
  standards_alignment: string[];
  usage_count: number;
}

interface BatchJob {
  id: string;
  status: string;
  total_items: number;
  completed_items: number;
  failed_items: number;
  created_at: string;
  config: any;
}

const SUBJECTS = ['Reading', 'Math', 'Science', 'Social Studies', 'Emotional Intelligence', 'Life Skills'];
const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', description: 'Basic concepts, simple vocabulary' },
  { value: 'medium', label: 'Medium', description: 'Standard grade-level content' },
  { value: 'hard', label: 'Hard', description: 'Challenging, above grade-level' },
  { value: 'advanced', label: 'Advanced', description: 'Extension activities, gifted learners' },
];
const GRADES = Array.from({ length: 13 }, (_, i) => ({ value: i, label: i === 0 ? 'Kindergarten' : `Grade ${i}` }));

export function AIContentStudio() {
  const [activeTab, setActiveTab] = useState('generate');
  const [templates, setTemplates] = useState<LessonTemplate[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Generation config
  const [config, setConfig] = useState({
    subjects: [] as string[],
    gradeMin: 0,
    gradeMax: 5,
    difficulties: ['easy', 'medium', 'hard'],
    lessonsPerSubjectPerGrade: 5,
    includeQuiz: true,
    includeActivities: true,
    standardsAligned: true,
    templateId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesResult, jobsResult] = await Promise.all([
        supabase.from('lesson_templates').select('*').eq('is_active', true).order('usage_count', { ascending: false }),
        supabase.from('batch_generation_jobs').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      if (templatesResult.data) setTemplates(templatesResult.data as unknown as LessonTemplate[]);
      if (jobsResult.data) setBatchJobs(jobsResult.data as unknown as BatchJob[]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject: string) => {
    setConfig(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const toggleDifficulty = (difficulty: string) => {
    setConfig(prev => ({
      ...prev,
      difficulties: prev.difficulties.includes(difficulty)
        ? prev.difficulties.filter(d => d !== difficulty)
        : [...prev.difficulties, difficulty],
    }));
  };

  const calculateTotalLessons = () => {
    const gradeCount = config.gradeMax - config.gradeMin + 1;
    return config.subjects.length * gradeCount * config.difficulties.length * config.lessonsPerSubjectPerGrade;
  };

  const handleStartGeneration = async () => {
    if (config.subjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    const totalLessons = calculateTotalLessons();
    if (totalLessons > 500) {
      const confirmed = confirm(`This will generate ${totalLessons} lessons. This may take a long time. Continue?`);
      if (!confirmed) return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      // Create batch job record
      const { data: job, error: jobError } = await supabase
        .from('batch_generation_jobs')
        .insert({
          job_type: 'lessons',
          status: 'processing',
          grade_levels: Array.from({ length: config.gradeMax - config.gradeMin + 1 }, (_, i) => config.gradeMin + i),
          subjects: config.subjects,
          difficulty_levels: config.difficulties,
          total_items: totalLessons,
          config: config,
          started_at: new Date().toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        })
        .select()
        .single();

      if (jobError) throw jobError;
      const jobId = (job as unknown as { id: string }).id;

      // Start generation in batches
      let completed = 0;
      const grades = Array.from({ length: config.gradeMax - config.gradeMin + 1 }, (_, i) => config.gradeMin + i);

      for (const grade of grades) {
        for (const subject of config.subjects) {
          // Call edge function for each grade/subject combination
          const { data, error } = await supabase.functions.invoke('batch-lesson-generation', {
            body: {
              gradeLevel: grade,
              subjects: [subject],
              lessonsPerSubject: config.lessonsPerSubjectPerGrade * config.difficulties.length,
              difficulties: config.difficulties,
              includeQuiz: config.includeQuiz,
              templateId: config.templateId || undefined,
            }
          });

          if (error) {
            console.error(`Failed ${subject} Grade ${grade}:`, error);
          } else {
            completed += config.lessonsPerSubjectPerGrade * config.difficulties.length;
          }

          setProgress(Math.round((completed / totalLessons) * 100));
          
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Update job status
      await supabase
        .from('batch_generation_jobs')
        .update({
          status: 'completed',
          completed_items: completed,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      toast.success(`Generated ${completed} lessons successfully!`);
      loadData();
    } catch (err) {
      console.error('Generation error:', err);
      toast.error('Failed to generate lessons');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'processing':
        return <Badge className="bg-primary/10 text-primary"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/10 text-destructive"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Content Studio</h2>
          <p className="text-muted-foreground">Generate curriculum-aligned lessons at scale</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> Generate
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layers className="w-4 h-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6 mt-6">
          {/* Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Select Subjects
              </CardTitle>
              <CardDescription>Choose which subjects to generate lessons for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SUBJECTS.map(subject => (
                  <div
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      config.subjects.includes(subject)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={config.subjects.includes(subject)} />
                      <span className="font-medium">{subject}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grade Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" /> Grade Level Range
              </CardTitle>
              <CardDescription>Select the range of grades to generate for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Grade</Label>
                  <Select
                    value={config.gradeMin.toString()}
                    onValueChange={v => setConfig(prev => ({ ...prev, gradeMin: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map(g => (
                        <SelectItem key={g.value} value={g.value.toString()}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To Grade</Label>
                  <Select
                    value={config.gradeMax.toString()}
                    onValueChange={v => setConfig(prev => ({ ...prev, gradeMax: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.filter(g => g.value >= config.gradeMin).map(g => (
                        <SelectItem key={g.value} value={g.value.toString()}>{g.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" /> Difficulty Levels
              </CardTitle>
              <CardDescription>Generate lessons at multiple difficulty levels for differentiation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIFFICULTIES.map(diff => (
                  <div
                    key={diff.value}
                    onClick={() => toggleDifficulty(diff.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      config.difficulties.includes(diff.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Checkbox checked={config.difficulties.includes(diff.value)} />
                      <span className="font-medium">{diff.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{diff.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" /> Advanced Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lessons per Subject per Grade</Label>
                  <Select
                    value={config.lessonsPerSubjectPerGrade.toString()}
                    onValueChange={v => setConfig(prev => ({ ...prev, lessonsPerSubjectPerGrade: parseInt(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 3, 5, 10, 15, 20].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n} lessons</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Use Template (Optional)</Label>
                  <Select
                    value={config.templateId}
                    onValueChange={v => setConfig(prev => ({ ...prev, templateId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No template</SelectItem>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="includeQuiz"
                    checked={config.includeQuiz}
                    onCheckedChange={c => setConfig(prev => ({ ...prev, includeQuiz: c as boolean }))}
                  />
                  <Label htmlFor="includeQuiz">Include quiz questions</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="includeActivities"
                    checked={config.includeActivities}
                    onCheckedChange={c => setConfig(prev => ({ ...prev, includeActivities: c as boolean }))}
                  />
                  <Label htmlFor="includeActivities">Include activities</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="standardsAligned"
                    checked={config.standardsAligned}
                    onCheckedChange={c => setConfig(prev => ({ ...prev, standardsAligned: c as boolean }))}
                  />
                  <Label htmlFor="standardsAligned">Align to Common Core</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary & Generate */}
          <Card className="border-primary">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Generation Summary</h3>
                  <p className="text-muted-foreground">
                    {config.subjects.length} subjects × {config.gradeMax - config.gradeMin + 1} grades × {config.difficulties.length} difficulties × {config.lessonsPerSubjectPerGrade} lessons
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {calculateTotalLessons()} total lessons
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleStartGeneration}
                  disabled={generating || config.subjects.length === 0}
                  className="min-w-[200px]"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Generation
                    </>
                  )}
                </Button>
              </div>

              {generating && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lesson Templates</CardTitle>
                  <CardDescription>Reusable content structures for consistent lesson generation</CardDescription>
                </div>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" /> Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No templates yet. Create your first template to standardize lesson generation.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                          </div>
                          <Badge variant="secondary">{template.subject}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Grades {template.grade_level_min === 0 ? 'K' : template.grade_level_min}-{template.grade_level_max}</span>
                          <span>•</span>
                          <span className="capitalize">{template.difficulty}</span>
                          <span>•</span>
                          <span>{template.usage_count} uses</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generation History</CardTitle>
                  <CardDescription>Track your batch generation jobs</CardDescription>
                </div>
                <Button variant="outline" onClick={loadData}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {batchJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No generation jobs yet. Start generating to see your history.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {batchJobs.map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(job.status)}
                          <span className="font-medium">
                            {job.completed_items}/{job.total_items} lessons
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(job.created_at).toLocaleString()}
                        </p>
                      </div>
                      {job.status === 'processing' && (
                        <Progress value={(job.completed_items / job.total_items) * 100} className="w-32 h-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}