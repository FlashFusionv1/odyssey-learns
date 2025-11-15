import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Grade2LessonSeedTrigger = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!confirm('Generate all 50 Grade 2 lessons using the detailed outlines? This will take 20-30 minutes.')) {
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus('Starting Grade 2 lesson generation...');
    setResults(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('Not authenticated');
        return;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + 1;
        });
      }, 2000);

      setStatus('Generating 50 lessons from detailed Grade 2 outlines...');

      const { data, error } = await supabase.functions.invoke('seed-grade-2-lessons', {
        body: {}
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setResults(data);
      setStatus(`✅ Successfully generated ${data.created} out of ${data.total} Grade 2 lessons!`);
      toast.success(`Created ${data.created} Grade 2 lessons!`);
    } catch (err) {
      console.error('Error generating Grade 2 lessons:', err);
      setStatus('❌ Generation failed');
      toast.error(err instanceof Error ? err.message : 'Failed to generate lessons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-primary" />
        <div>
          <h3 className="text-xl font-bold">Grade 2 Lesson Generator</h3>
          <p className="text-sm text-muted-foreground">
            Generate all 50 Grade 2 lessons from detailed outlines
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">What This Will Generate:</h4>
          <ul className="text-sm space-y-1 ml-4">
            <li>• 10 Reading & Language Arts lessons</li>
            <li>• 10 Math lessons</li>
            <li>• 10 Science lessons</li>
            <li>• 10 Social Studies lessons</li>
            <li>• 10 Life Skills & Emotional Intelligence lessons</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Each lesson includes detailed objectives, activities, and assessments
            based on the comprehensive Grade 2 outlines.
          </p>
        </div>

        {loading && (
          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-center text-muted-foreground">{status}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating lessons... ({progress}%)</span>
            </div>
          </div>
        )}

        {results && (
          <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Generation Complete!
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Created {results.created} out of {results.total} lessons for Grade {results.grade}
                </p>
                {results.results && results.results.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <p className="text-xs font-medium mb-2">Generated Lessons:</p>
                    <ul className="text-xs space-y-1">
                      {results.results.slice(0, 10).map((r: any, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          {r.error ? (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                          <span>{r.title}</span>
                        </li>
                      ))}
                      {results.results.length > 10 && (
                        <li className="text-muted-foreground">
                          ...and {results.results.length - 10} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Lessons...
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5 mr-2" />
              Generate All 50 Grade 2 Lessons
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          This process typically takes 20-30 minutes. You can leave this page and 
          check back later. Existing lessons will not be duplicated.
        </p>
      </div>
    </Card>
  );
};
