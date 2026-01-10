import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GeneratedLesson {
  id: string;
  title: string;
  description: string;
}

interface LessonPreviewProps {
  lesson: GeneratedLesson | null;
}

export function LessonPreview({ lesson }: LessonPreviewProps) {
  if (!lesson) return null;

  return (
    <AnimatePresence>
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
              "{lesson.title}"
            </p>
            <p className="text-xs text-green-500 dark:text-green-500 mt-2">
              {lesson.description}
            </p>
            <Button
              variant="link"
              size="sm"
              className="text-green-600 dark:text-green-400 p-0 mt-2"
              onClick={() => (window.location.href = `/lesson/${lesson.id}`)}
            >
              Start Learning →
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
