import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SUBJECTS = ['Reading', 'Math', 'Science', 'Social Studies', 'Emotional Intelligence'];
const GRADES = Array.from({ length: 13 }, (_, i) => i); // 0-12 (K-12)

export const BatchLessonGenerator = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!selectedGrade) {
      toast.error('Please select a grade level');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus(`Generating 50 lessons for Grade ${selectedGrade === '0' ? 'K' : selectedGrade}...`);
    setResults(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('Not authenticated');
        return;
      }

      // Simulate progress (since we can't track actual progress from edge function)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 2;
        });
      }, 1000);

      const { data, error } = await supabase.functions.invoke('batch-lesson-generation', {
        body: {
          gradeLevel: parseInt(selectedGrade),
          subjects: SUBJECTS,
          lessonsPerSubject: 10
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data);
      setStatus(`✅ Successfully generated ${data.count} lessons!`);
      toast.success(`Created ${data.count} lessons for Grade ${selectedGrade === '0' ? 'K' : selectedGrade}!`);
    } catch (err) {
      console.error('Error generating lessons:', err);
      setStatus('❌ Generation failed');
      toast.error(err instanceof Error ? err.message : 'Failed to generate lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!confirm('Generate 650 lessons for ALL grades (K-12)? This will take 30-45 minutes.')) {
      return;
    }

    setLoading(true);
    setProgress(0);
    let completed = 0;
    const total = 13;

    for (const grade of GRADES) {
      setStatus(`Generating Grade ${grade === 0 ? 'K' : grade}... (${completed + 1}/${total})`);
      
      try {
        const { data, error } = await supabase.functions.invoke('batch-lesson-generation', {
          body: {
            gradeLevel: grade,
            subjects: SUBJECTS,
            lessonsPerSubject: 10
          }
        });

        if (error) throw error;
        
        completed++;
        setProgress(Math.round((completed / total) * 100));
        
        // Delay between grades to respect rate limits
        if (completed < total) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      } catch (err) {
        console.error(`Failed Grade ${grade}:`, err);
        toast.error(`Failed Grade ${grade}`);
      }
    }

    setStatus(`✅ Completed! Generated lessons for ${completed}/${total} grades.`);
    toast.success('Bulk generation complete!');
    setLoading(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Batch Lesson Generator</h3>
          <p className="text-sm text-muted-foreground">
            Generate AI-powered lessons for any grade level
          </p>
        </div>
      </div>

      {!loading && !results && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Grade Level</label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a grade..." />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Grade {grade === 0 ? 'K' : grade} (50 lessons)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What will be generated:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 10 Reading lessons</li>
              <li>• 10 Math lessons</li>
              <li>• 10 Science lessons</li>
              <li>• 10 Social Studies lessons</li>
              <li>• 10 Emotional Intelligence lessons</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              Each lesson includes age-appropriate content, interactive activities, and quiz questions.
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate}
              disabled={!selectedGrade}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate 50 Lessons
            </Button>
            <Button 
              onClick={handleGenerateAll}
              variant="outline"
              size="lg"
            >
              Generate All (650)
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{status}</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <p className="text-sm text-center text-muted-foreground">
            This may take several minutes. Please don't close this page.
          </p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100">
                Generation Complete!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Created {results.count} lessons for Grade {results.grade === 0 ? 'K' : results.grade}
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Subjects Generated:</h4>
            <div className="flex flex-wrap gap-2">
              {results.subjects?.map((subject: string) => (
                <span key={subject} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => {
              setResults(null);
              setSelectedGrade('');
              setProgress(0);
            }}
            variant="outline"
            className="w-full"
          >
            Generate More Lessons
          </Button>
        </div>
      )}
    </Card>
  );
};
