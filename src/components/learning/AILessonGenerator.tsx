import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Wand2, BookOpen, Brain, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface AILessonGeneratorProps {
  childId: string;
  gradeLevel: number;
  onLessonCreated?: (lesson: any) => void;
}

const SUBJECTS = [
  { value: 'Reading', label: '📚 Reading & Language Arts', icon: '📚' },
  { value: 'Math', label: '🔢 Mathematics', icon: '🔢' },
  { value: 'Science', label: '🔬 Science', icon: '🔬' },
  { value: 'Social Studies', label: '🌍 Social Studies', icon: '🌍' },
  { value: 'Emotional Intelligence', label: '💙 Emotional Intelligence', icon: '💙' },
  { value: 'Life Skills', label: '🛠️ Life Skills', icon: '🛠️' },
  { value: 'Art', label: '🎨 Art & Creativity', icon: '🎨' },
  { value: 'Music', label: '🎵 Music', icon: '🎵' },
];

const TOPIC_SUGGESTIONS = {
  Reading: ['Dragons', 'Space Adventure', 'Friendship', 'Mystery Solving', 'Ocean Life'],
  Math: ['Pizza Fractions', 'Money & Shopping', 'Shapes in Nature', 'Time Travel Math', 'Sports Stats'],
  Science: ['Volcanoes', 'Dinosaurs', 'Space Exploration', 'Weather Patterns', 'Animal Habitats'],
  'Social Studies': ['Ancient Egypt', 'Community Helpers', 'World Cultures', 'Famous Inventors', 'Geography'],
  'Emotional Intelligence': ['Managing Anger', 'Making Friends', 'Self-Confidence', 'Dealing with Change', 'Empathy'],
  'Life Skills': ['Cooking Basics', 'Money Saving', 'Organization', 'First Aid', 'Digital Safety'],
  Art: ['Drawing Animals', 'Color Theory', 'Famous Artists', 'Sculpture', 'Digital Art'],
  Music: ['Rhythm Basics', 'Instruments', 'Famous Composers', 'Songwriting', 'Music Around the World'],
};

export const AILessonGenerator = ({
  childId,
  gradeLevel,
  onLessonCreated
}: AILessonGeneratorProps) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [generatedLesson, setGeneratedLesson] = useState<any>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || !subject) {
      toast.error('Please enter a topic and select a subject');
      return;
    }

    if (loading) {
      toast.info('Generation already in progress...');
      return;
    }

    setLoading(true);
    setGeneratedLesson(null);

    const idempotencyKey = `lesson-${childId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      const { data, error } = await supabase.functions.invoke('generate-custom-lesson', {
        body: {
          childId,
          topic: topic.trim(),
          subject,
          gradeLevel,
          additionalNotes: additionalNotes.trim(),
          idempotencyKey,
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('limit reached') || data.error.includes('Daily')) {
          toast.error('Daily limit reached! You can create more lessons tomorrow. 🌟');
        } else if (data.error.includes('already generating')) {
          toast.info('A lesson is already being generated. Please wait...');
        } else if (data.error.includes('safety') || data.error.includes('flagged')) {
          toast.error('This topic was flagged by our safety filter. Try a different topic!');
        } else {
          toast.error(data.error);
        }
        return;
      }

      setGeneratedLesson(data.lesson);
      setQuotaRemaining(data.quota_remaining);
      toast.success(`✨ Your lesson "${data.lesson.title}" is ready!`);
      setTopic('');
      setAdditionalNotes('');

      if (onLessonCreated) {
        onLessonCreated(data.lesson);
      }
    } catch (err) {
      console.error('Error generating custom lesson:', err);
      toast.error('Failed to generate lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSuggestion = (suggestion: string) => {
    setTopic(suggestion);
  };

  const currentSuggestions = subject ? (TOPIC_SUGGESTIONS[subject as keyof typeof TOPIC_SUGGESTIONS] || []) : [];

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              AI Lesson Creator
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </CardTitle>
            <CardDescription>
              Tell us what you want to learn, and our AI will create a fun lesson just for you!
            </CardDescription>
          </div>
        </div>
        {quotaRemaining !== null && (
          <Badge variant="secondary" className="w-fit mt-2">
            <Lightbulb className="w-3 h-3 mr-1" />
            {quotaRemaining} lessons remaining today
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subject Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Choose a Subject</label>
          <Select value={subject} onValueChange={setSubject} disabled={loading}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="What subject are you curious about?" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s.value} value={s.value} className="py-3">
                  <span className="flex items-center gap-2">
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">What do you want to learn about?</label>
          <Input
            placeholder="e.g., 'Dinosaurs', 'How volcanoes work', 'Making friends'..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            maxLength={100}
            className="h-12 text-base"
          />
        </div>

        {/* Topic Suggestions */}
        <AnimatePresence>
          {currentSuggestions.length > 0 && !topic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <label className="text-sm text-muted-foreground">💡 Try one of these:</label>
              <div className="flex flex-wrap gap-2">
                {currentSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTopicSuggestion(suggestion)}
                    disabled={loading}
                    className="rounded-full hover:bg-primary/10 hover:border-primary"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Anything special you want included? <span className="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            placeholder="e.g., 'Include a story about a brave knight' or 'Make it about space exploration'..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            disabled={loading}
            maxLength={200}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={loading || !topic.trim() || !subject}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          size="lg"
        >
          {loading ? (
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Your Amazing Lesson...
            </motion.div>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate My Lesson ✨
            </span>
          )}
        </Button>

        {/* Success State - Generated Lesson Preview */}
        <AnimatePresence>
          {generatedLesson && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">
                    🎉 Lesson Created!
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    "{generatedLesson.title}"
                  </p>
                  <p className="text-xs text-green-500 dark:text-green-500 mt-2">
                    {generatedLesson.description}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-green-600 dark:text-green-400 p-0 mt-2"
                    onClick={() => window.location.href = `/lesson/${generatedLesson.id}`}
                  >
                    Start Learning →
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Footer */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Brain className="w-4 h-4" />
          <span>
            Powered by AI • Lessons are reviewed for safety • Ask a parent if unsure!
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
