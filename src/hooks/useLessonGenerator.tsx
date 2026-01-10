import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedLesson {
  id: string;
  title: string;
  description: string;
}

interface UseLessonGeneratorOptions {
  childId: string;
  gradeLevel: number;
  onSuccess?: (lesson: GeneratedLesson) => void;
}

interface UseLessonGeneratorResult {
  loading: boolean;
  quotaRemaining: number | null;
  generatedLesson: GeneratedLesson | null;
  generate: (topic: string, subject: string, additionalNotes?: string) => Promise<void>;
  resetLesson: () => void;
}

export function useLessonGenerator({
  childId,
  gradeLevel,
  onSuccess,
}: UseLessonGeneratorOptions): UseLessonGeneratorResult {
  const [loading, setLoading] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [generatedLesson, setGeneratedLesson] = useState<GeneratedLesson | null>(null);

  const generate = useCallback(
    async (topic: string, subject: string, additionalNotes?: string) => {
      if (!topic.trim() || !subject) {
        toast.error("Please enter a topic and select a subject");
        return;
      }

      if (loading) {
        toast.info("Generation already in progress...");
        return;
      }

      setLoading(true);
      setGeneratedLesson(null);

      const idempotencyKey = `lesson-${childId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      try {
        const { data, error } = await supabase.functions.invoke("generate-custom-lesson", {
          body: {
            childId,
            topic: topic.trim(),
            subject,
            gradeLevel,
            additionalNotes: additionalNotes?.trim() || "",
            idempotencyKey,
          },
        });

        if (error) throw error;

        if (data.error) {
          handleGenerationError(data.error);
          return;
        }

        const lesson = data.lesson as GeneratedLesson;
        setGeneratedLesson(lesson);
        setQuotaRemaining(data.quota_remaining);
        toast.success(`✨ Your lesson "${lesson.title}" is ready!`);

        onSuccess?.(lesson);
      } catch (err) {
        console.error("Error generating custom lesson:", err);
        toast.error("Failed to generate lesson. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [childId, gradeLevel, loading, onSuccess]
  );

  const resetLesson = useCallback(() => {
    setGeneratedLesson(null);
  }, []);

  return {
    loading,
    quotaRemaining,
    generatedLesson,
    generate,
    resetLesson,
  };
}

function handleGenerationError(error: string) {
  if (error.includes("limit reached") || error.includes("Daily")) {
    toast.error("Daily limit reached! You can create more lessons tomorrow. 🌟");
  } else if (error.includes("already generating")) {
    toast.info("A lesson is already being generated. Please wait...");
  } else if (error.includes("safety") || error.includes("flagged")) {
    toast.error("This topic was flagged by our safety filter. Try a different topic!");
  } else {
    toast.error(error);
  }
}
