import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Star, 
  Trophy,
  Timer,
  Sparkles,
  Volume2,
  VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Confetti from "react-confetti";

interface ActivityPlayerProps {
  activity: {
    id: string;
    title: string;
    content_type: string;
    content_data: Record<string, unknown>;
    points_value: number | null;
    estimated_minutes: number | null;
  };
  childId: string;
  onClose: () => void;
  onComplete?: (score: number, pointsEarned: number) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

interface MatchingPair {
  left: string;
  right: string;
}

export function ActivityPlayer({ 
  activity, 
  childId, 
  onClose, 
  onComplete 
}: ActivityPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startTime] = useState(Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

  const contentData = activity.content_data;

  // Parse content based on type
  const questions = (contentData?.questions as QuizQuestion[]) || [];
  const matchingPairs = (contentData?.pairs as MatchingPair[]) || [];
  const storyPages = (contentData?.pages as string[]) || [];

  useEffect(() => {
    if (activity.content_type === 'quiz' || activity.content_type === 'trivia') {
      setTotalQuestions(questions.length);
    } else if (activity.content_type === 'matching') {
      setTotalQuestions(matchingPairs.length);
    } else if (activity.content_type === 'story') {
      setTotalQuestions(storyPages.length);
    }
  }, [activity.content_type, questions, matchingPairs, storyPages]);

  const playSound = (type: 'correct' | 'wrong' | 'complete') => {
    if (!soundEnabled) return;
    // Audio would be played here with actual sound files
  };

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const isCorrect = questions[currentStep]?.correct_index === answerIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }
    
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        handleComplete();
      }
    }, 1500);
  };

  const handleComplete = async () => {
    setIsComplete(true);
    setShowConfetti(true);
    playSound('complete');
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const finalScore = Math.round((score / Math.max(totalQuestions, 1)) * 100);
    const pointsEarned = Math.round((activity.points_value || 10) * (finalScore / 100));
    
    // Save completion to database
    try {
      await supabase.from('interactive_completions').insert({
        content_id: activity.id,
        child_id: childId,
        score: finalScore,
        time_spent_seconds: timeSpent,
        completed_at: new Date().toISOString(),
      });

      // Update play count directly
      await supabase
        .from('interactive_content')
        .update({ play_count: (activity as unknown as { play_count?: number }).play_count ? ((activity as unknown as { play_count?: number }).play_count || 0) + 1 : 1 })
        .eq('id', activity.id);
    } catch (error) {
      console.error('Error saving completion:', error);
    }
    
    toast({
      title: "Activity Complete! 🎉",
      description: `You earned ${pointsEarned} points!`,
    });
    
    setTimeout(() => setShowConfetti(false), 5000);
    
    if (onComplete) {
      onComplete(finalScore, pointsEarned);
    }
  };

  const renderQuizContent = () => {
    const question = questions[currentStep];
    if (!question) return null;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">
            Question {currentStep + 1} of {questions.length}
          </Badge>
          <h3 className="text-xl font-semibold">{question.question}</h3>
        </div>
        
        <div className="grid gap-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = question.correct_index === idx;
            const showResult = showFeedback && (isSelected || isCorrect);
            
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={`
                  p-4 rounded-xl text-left transition-all border-2
                  ${!showFeedback && 'hover:border-primary hover:bg-primary/5'}
                  ${showResult && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20'}
                  ${showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/20'}
                  ${!showResult && 'border-border'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
        
        {showFeedback && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-muted rounded-lg"
          >
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </motion.div>
        )}
      </div>
    );
  };

  const renderStoryContent = () => {
    return (
      <div className="space-y-6">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="prose prose-lg max-w-none"
        >
          <p className="text-lg leading-relaxed">
            {storyPages[currentStep]}
          </p>
        </motion.div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < storyPages.length - 1 ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              <Trophy className="w-4 h-4 mr-2" />
              Complete Story
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderCompletionScreen = () => {
    const percentage = Math.round((score / Math.max(totalQuestions, 1)) * 100);
    const pointsEarned = Math.round((activity.points_value || 10) * (percentage / 100));
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-primary-foreground" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2">Amazing Job! 🎉</h2>
        <p className="text-muted-foreground mb-6">
          You completed "{activity.title}"
        </p>
        
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
              <Star className="w-6 h-6" />
              {percentage}%
            </div>
            <p className="text-sm text-muted-foreground">Score</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
              <Sparkles className="w-6 h-6" />
              +{pointsEarned}
            </div>
            <p className="text-sm text-muted-foreground">Points</p>
          </Card>
        </div>
        
        <Button onClick={onClose} size="lg">
          Continue Learning
        </Button>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      <div className="container mx-auto px-4 py-6 max-w-2xl min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-semibold">{activity.title}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span>{activity.estimated_minutes || 5} min</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        {/* Progress */}
        {!isComplete && totalQuestions > 0 && (
          <div className="mb-6">
            <Progress 
              value={((currentStep + (showFeedback ? 1 : 0)) / totalQuestions) * 100} 
              className="h-2"
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{currentStep + 1} / {totalQuestions}</span>
            </div>
          </div>
        )}
        
        {/* Content */}
        <Card className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {isComplete ? (
              renderCompletionScreen()
            ) : activity.content_type === 'story' ? (
              renderStoryContent()
            ) : (
              renderQuizContent()
            )}
          </AnimatePresence>
        </Card>
      </div>
    </motion.div>
  );
}
