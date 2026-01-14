import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Wand2, Brain, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useLessonGenerator } from "@/hooks/useLessonGenerator";
import { TopicSuggestions } from "./TopicSuggestions";
import { LessonPreview } from "./LessonPreview";
import { LESSON_SUBJECTS, TOPIC_SUGGESTIONS } from "./constants";

interface AILessonGeneratorProps {
  childId: string;
  gradeLevel: number;
  onLessonCreated?: (lesson: { id: string; title: string; description: string }) => void;
}

export function AILessonGenerator({ childId, gradeLevel, onLessonCreated }: AILessonGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const { loading, quotaRemaining, generatedLesson, generate } = useLessonGenerator({
    childId,
    gradeLevel,
    onSuccess: (lesson) => {
      setTopic("");
      setAdditionalNotes("");
      onLessonCreated?.(lesson);
    },
  });

  const currentSuggestions = subject ? TOPIC_SUGGESTIONS[subject] || [] : [];
  const canGenerate = topic.trim() && subject && !loading;

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
              {LESSON_SUBJECTS.map((s) => (
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
        <TopicSuggestions
          suggestions={currentSuggestions}
          visible={!topic}
          disabled={loading}
          onSelect={setTopic}
        />

        {/* Additional Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Anything special you want included?{" "}
            <span className="text-muted-foreground">(optional)</span>
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
          onClick={() => generate(topic, subject, additionalNotes)}
          disabled={!canGenerate}
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

        {/* Generated Lesson Preview */}
        <LessonPreview lesson={generatedLesson} />

        {/* Info Footer */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Brain className="w-4 h-4" />
          <span>Powered by AI • Lessons are reviewed for safety • Ask a parent if unsure!</span>
        </div>
      </CardContent>
    </Card>
  );
}
