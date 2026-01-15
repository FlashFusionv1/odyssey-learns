/**
 * Game Question Component
 * Displays current question with timer and answer options
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ArrowRight,
  Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameQuestion as GameQuestionType } from '@/types/games';

interface GameQuestionProps {
  question: GameQuestionType;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  onSubmitAnswer: (answer: string) => Promise<{ isCorrect: boolean; pointsEarned: number }>;
  onNextQuestion: () => void;
  myScore: number;
}

export function GameQuestion({
  question,
  questionIndex,
  totalQuestions,
  timeRemaining,
  onSubmitAnswer,
  onNextQuestion,
  myScore,
}: GameQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [inputAnswer, setInputAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const timeProgress = (timeRemaining / question.timeLimitSeconds) * 100;
  const isUrgent = timeRemaining <= 5;
  const isTimedOut = timeRemaining === 0;

  // Reset state on new question
  useEffect(() => {
    setSelectedAnswer(null);
    setInputAnswer('');
    setResult(null);
    setShowResult(false);
  }, [question.id]);

  // Auto-submit on timeout
  useEffect(() => {
    if (isTimedOut && !result) {
      handleSubmit(selectedAnswer || inputAnswer || '');
    }
  }, [isTimedOut]);

  const handleSubmit = useCallback(async (answer: string) => {
    if (isSubmitting || result) return;
    
    setIsSubmitting(true);
    const submitResult = await onSubmitAnswer(answer);
    setResult(submitResult);
    setShowResult(true);
    setIsSubmitting(false);
  }, [isSubmitting, result, onSubmitAnswer]);

  const handleOptionClick = (option: string) => {
    if (result || isTimedOut) return;
    setSelectedAnswer(option);
    handleSubmit(option);
  };

  const handleInputSubmit = () => {
    if (!inputAnswer.trim() || result || isTimedOut) return;
    handleSubmit(inputAnswer);
  };

  const handleNext = () => {
    setShowResult(false);
    setTimeout(onNextQuestion, 100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with progress and score */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-base px-4 py-1">
          Question {questionIndex + 1} / {totalQuestions}
        </Badge>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-lg font-semibold">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {myScore}
          </div>
          <div className="flex items-center gap-1 text-lg font-semibold">
            <Zap className="w-5 h-5 text-primary" />
            {question.points} pts
          </div>
        </div>
      </div>

      {/* Timer */}
      <Card className={cn(isUrgent && 'border-destructive animate-pulse')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className={cn('w-5 h-5', isUrgent ? 'text-destructive' : 'text-muted-foreground')} />
            <Progress 
              value={timeProgress} 
              className={cn(
                'h-3 flex-1',
                isUrgent && '[&>div]:bg-destructive'
              )}
            />
            <span className={cn(
              'font-mono text-lg font-bold min-w-[3ch]',
              isUrgent && 'text-destructive'
            )}>
              {timeRemaining}s
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl text-center leading-relaxed">
            {question.questionText}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Multiple Choice */}
          {question.questionType === 'multiple_choice' && question.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((option, i) => {
                const isSelected = selectedAnswer === option;
                const showCorrect = showResult && option === question.correctAnswer;
                const showWrong = showResult && isSelected && !result?.isCorrect;

                return (
                  <motion.button
                    key={i}
                    whileHover={!result ? { scale: 1.02 } : {}}
                    whileTap={!result ? { scale: 0.98 } : {}}
                    onClick={() => handleOptionClick(option)}
                    disabled={!!result || isTimedOut}
                    className={cn(
                      'p-4 rounded-lg border-2 text-lg font-medium transition-all',
                      'hover:border-primary hover:bg-primary/5',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      isSelected && !showResult && 'border-primary bg-primary/10',
                      showCorrect && 'border-green-500 bg-green-500/20 text-green-700',
                      showWrong && 'border-destructive bg-destructive/20 text-destructive'
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {showCorrect && <CheckCircle2 className="w-5 h-5" />}
                      {showWrong && <XCircle className="w-5 h-5" />}
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Spelling/Fill-in-the-blank */}
          {(question.questionType === 'spelling' || question.questionType === 'fill_blank') && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={!!result || isTimedOut}
                  onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                  className="text-lg"
                  autoFocus
                />
                <Button
                  onClick={handleInputSubmit}
                  disabled={!inputAnswer.trim() || !!result || isTimedOut || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
              
              {showResult && (
                <div className={cn(
                  'text-center p-3 rounded-lg',
                  result?.isCorrect 
                    ? 'bg-green-500/20 text-green-700' 
                    : 'bg-destructive/20 text-destructive'
                )}>
                  {result?.isCorrect 
                    ? `Correct! The answer is "${question.correctAnswer}"`
                    : `Wrong! The correct answer was "${question.correctAnswer}"`
                  }
                </div>
              )}
            </div>
          )}

          {/* True/False */}
          {question.questionType === 'true_false' && (
            <div className="flex gap-4 justify-center">
              {['True', 'False'].map((option) => {
                const isSelected = selectedAnswer === option;
                const showCorrect = showResult && option.toLowerCase() === question.correctAnswer.toLowerCase();
                const showWrong = showResult && isSelected && !result?.isCorrect;

                return (
                  <Button
                    key={option}
                    variant={isSelected ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleOptionClick(option)}
                    disabled={!!result || isTimedOut}
                    className={cn(
                      'px-12 py-6 text-xl',
                      showCorrect && 'bg-green-500 hover:bg-green-600',
                      showWrong && 'bg-destructive hover:bg-destructive/90'
                    )}
                  >
                    {showCorrect && <CheckCircle2 className="w-5 h-5 mr-2" />}
                    {showWrong && <XCircle className="w-5 h-5 mr-2" />}
                    {option}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Overlay */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={cn(
                'p-8 rounded-2xl shadow-2xl text-center pointer-events-auto',
                result?.isCorrect 
                  ? 'bg-green-500 text-white' 
                  : 'bg-destructive text-destructive-foreground'
              )}
            >
              {result?.isCorrect ? (
                <>
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Correct!</h2>
                  <p className="text-xl">+{result.pointsEarned} points</p>
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-2">Wrong!</h2>
                  <p className="text-xl">Keep trying!</p>
                </>
              )}
              
              <Button
                onClick={handleNext}
                variant="secondary"
                size="lg"
                className="mt-6"
              >
                {questionIndex < totalQuestions - 1 ? (
                  <>
                    Next Question <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'See Results'
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
