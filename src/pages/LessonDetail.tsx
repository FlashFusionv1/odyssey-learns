import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, BookOpen, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { DigitalNotebook } from "@/components/learning/DigitalNotebook";
import { CollaborativeActivity } from "@/components/learning/CollaborativeActivity";

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade_level: number;
  estimated_minutes: number;
  points_value: number;
  content_markdown: string;
  quiz_questions: any;
  standards_alignment: string;
}

interface Child {
  id: string;
  name: string;
  total_points: number;
  grade_level: number;
}

interface UserProgress {
  status: string;
  score: number;
  completed_at: string;
}

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { childId, isValidating } = useValidatedChild();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isValidating && childId && id) {
      loadLessonData();
    }
  }, [childId, id, isValidating]);

  const loadLessonData = async () => {
    if (!childId || !id) return;

    try {
      // Load lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", id)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Load child
      const { data: childData } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      setChild(childData);

      // Load progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("child_id", childId)
        .eq("lesson_id", id)
        .maybeSingle();

      setProgress(progressData);
    } catch (error) {
      console.error("Error loading lesson:", error);
      toast({
        title: "Error",
        description: "Failed to load lesson",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = async () => {
    if (!childId || !id) return;

    try {
      // Update or create progress
      const { error } = await supabase
        .from("user_progress")
        .upsert({
          child_id: childId,
          lesson_id: id,
          status: "in_progress",
          time_spent_seconds: 0,
        });

      if (error) throw error;

      setProgress({ status: "in_progress", score: 0, completed_at: "" });
      toast({
        title: "Lesson started!",
        description: "Good luck learning!",
      });
    } catch (error) {
      console.error("Error starting lesson:", error);
      toast({
        title: "Error",
        description: "Failed to start lesson",
        variant: "destructive",
      });
    }
  };

  const handleCompleteLesson = async () => {
    if (!childId || !id || !lesson) return;
    setCompleting(true);

    try {
      // Calculate quiz score if quiz exists
      let score = 100;
      if (lesson.quiz_questions && showQuiz) {
        const totalQuestions = lesson.quiz_questions.length;
        let correctAnswers = 0;
        
        lesson.quiz_questions.forEach((q: any, index: number) => {
          if (quizAnswers[index] === q.correct) {
            correctAnswers++;
          }
        });
        
        score = Math.round((correctAnswers / totalQuestions) * 100);
      }

      // Update progress
      const { error: progressError } = await supabase
        .from("user_progress")
        .upsert({
          child_id: childId,
          lesson_id: id,
          status: "completed",
          score,
          completed_at: new Date().toISOString(),
        });

      if (progressError) throw progressError;

      // Award points
      const { error: pointsError } = await supabase
        .from("children")
        .update({
          total_points: (child?.total_points || 0) + lesson.points_value,
        })
        .eq("id", childId);

      if (pointsError) throw pointsError;

      toast({
        title: "🎉 Lesson Complete!",
        description: `You earned ${lesson.points_value} points! Score: ${score}%`,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error completing lesson:", error);
      toast({
        title: "Error",
        description: "Failed to complete lesson",
        variant: "destructive",
      });
    } finally {
      setCompleting(false);
    }
  };

  if (isValidating || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!lesson || !child) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Lesson not found</CardTitle>
            <CardDescription>This lesson doesn't exist or you don't have access.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/lessons")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = progress?.status === "completed";
  const isInProgress = progress?.status === "in_progress";

  return (
    <AppLayout childName={child.name} points={child.total_points}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/lessons")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge variant="outline">{lesson.subject}</Badge>
                <CardTitle className="text-3xl">{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </div>
              {isCompleted && (
                <Badge variant="default" className="bg-success">
                  ✓ Completed
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {lesson.estimated_minutes} min
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {lesson.points_value} points
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Grade {lesson.grade_level}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isInProgress && !isCompleted && (
              <Button onClick={handleStartLesson} size="lg" className="w-full">
                Start Lesson
              </Button>
            )}

            {(isInProgress || isCompleted) && (
              <>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{lesson.content_markdown}</ReactMarkdown>
                </div>

                {lesson.quiz_questions && lesson.quiz_questions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Quiz</CardTitle>
                      <CardDescription>Test your understanding</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {lesson.quiz_questions.map((q: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <p className="font-medium">{index + 1}. {q.question}</p>
                          <div className="space-y-2 ml-4">
                            {q.options.map((option: string, optIndex: number) => (
                              <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={option}
                                  checked={quizAnswers[index] === option}
                                  onChange={() => {
                                    setQuizAnswers({ ...quizAnswers, [index]: option });
                                    setShowQuiz(true);
                                  }}
                                  disabled={isCompleted}
                                  className="cursor-pointer"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {isInProgress && (
                  <Button 
                    onClick={handleCompleteLesson} 
                    size="lg" 
                    className="w-full"
                    disabled={completing}
                  >
                    {completing ? "Completing..." : "Complete Lesson"}
                  </Button>
                )}

                {isCompleted && progress?.score !== undefined && (
                  <Card className="bg-success/10 border-success">
                    <CardContent className="pt-6">
                      <p className="text-center text-lg font-semibold">
                        Your Score: {progress.score}%
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {(isInProgress || isCompleted) && (
          <>
            <DigitalNotebook 
              childId={childId!} 
              lessonId={id!} 
              lessonTitle={lesson.title} 
            />
            
            <CollaborativeActivity 
              childId={childId!} 
              lessonId={id!} 
            />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default LessonDetail;
