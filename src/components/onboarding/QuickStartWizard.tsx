/**
 * @fileoverview Quick Start Wizard Component
 * Abbreviated onboarding flow with 3-5 essential questions.
 * Allows immediate app access with deferred full setup.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Rocket, 
  ChevronRight, 
  ChevronLeft,
  Target,
  User,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useOnboardingWizard, WizardFormData } from '@/hooks/useOnboardingWizard';

interface QuickStartWizardProps {
  onComplete: (data: WizardFormData) => void;
  onSwitchToFull?: () => void;
}

const STEP_ICONS = {
  quick_welcome: Zap,
  quick_child: User,
  quick_goal: Target,
  quick_ready: Rocket,
};

export function QuickStartWizard({ onComplete, onSwitchToFull }: QuickStartWizardProps) {
  const {
    state,
    steps,
    currentStepData,
    isFirstStep,
    isLastStep,
    progress,
    isSaving,
    updateFormData,
    nextStep,
    prevStep,
    completeWizard,
  } = useOnboardingWizard({
    mode: 'quick_start',
    onComplete,
  });

  const StepIcon = STEP_ICONS[currentStepData?.id as keyof typeof STEP_ICONS] || Sparkles;

  const renderStepContent = () => {
    switch (currentStepData?.id) {
      case 'quick_welcome':
        return <QuickWelcomeStep onSwitchToFull={onSwitchToFull} />;
      case 'quick_child':
        return (
          <QuickChildStep
            value={state.formData.learningStyle as string}
            onChange={(learningStyle) => updateFormData({ learningStyle })}
          />
        );
      case 'quick_goal':
        return (
          <QuickGoalStep
            value={state.formData.primaryGoal as string}
            onChange={(primaryGoal) => updateFormData({ primaryGoal })}
          />
        );
      case 'quick_ready':
        return <QuickReadyStep formData={state.formData as WizardFormData} />;
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      completeWizard();
    } else {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-2">
        <CardHeader className="space-y-4 pb-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Quick Start</span>
              <span>{state.currentStep + 1} of {steps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <motion.div
              key={currentStepData?.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 rounded-full bg-primary/10"
            >
              <StepIcon className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold">{currentStepData?.title}</h2>
              <p className="text-sm text-muted-foreground">{currentStepData?.description}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepData?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={isFirstStep}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="gap-2"
          >
            {isLastStep ? (
              <>
                <Rocket className="w-4 h-4" />
                {isSaving ? 'Starting...' : "Let's Go!"}
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Step Components

function QuickWelcomeStep({ onSwitchToFull }: { onSwitchToFull?: () => void }) {
  return (
    <div className="space-y-6 text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
      >
        <Zap className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Welcome to Quick Start!</h3>
        <p className="text-muted-foreground">
          Answer a few quick questions and start learning in under 2 minutes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <span className="text-green-700 dark:text-green-400">3 questions only</span>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <Rocket className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <span className="text-blue-700 dark:text-blue-400">Start immediately</span>
        </div>
      </div>

      {onSwitchToFull && (
        <p className="text-sm text-muted-foreground">
          Prefer a detailed setup?{' '}
          <button
            onClick={onSwitchToFull}
            className="text-primary hover:underline font-medium"
          >
            Take the full tour
          </button>
        </p>
      )}
    </div>
  );
}

function QuickChildStep({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const learningStyles = [
    { id: 'visual', label: 'Visual Learner', description: 'Learns best with pictures and videos', emoji: '👁️' },
    { id: 'auditory', label: 'Audio Learner', description: 'Learns best by listening', emoji: '👂' },
    { id: 'kinesthetic', label: 'Hands-On Learner', description: 'Learns best by doing', emoji: '🖐️' },
    { id: 'balanced', label: 'Mixed Style', description: 'A bit of everything works!', emoji: '⚖️' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        How does your child learn best? (We'll adapt content to match!)
      </p>

      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {learningStyles.map((style) => (
          <Label
            key={style.id}
            htmlFor={style.id}
            className={`
              flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${value === style.id 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <RadioGroupItem value={style.id} id={style.id} />
            <span className="text-2xl">{style.emoji}</span>
            <div className="flex-1">
              <div className="font-medium">{style.label}</div>
              <div className="text-sm text-muted-foreground">{style.description}</div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}

function QuickGoalStep({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const goals = [
    { id: 'academic_growth', label: 'Academic Excellence', description: 'Focus on school subjects', emoji: '📚' },
    { id: 'emotional_intelligence', label: 'Emotional Growth', description: 'Build emotional skills', emoji: '💖' },
    { id: 'life_skills', label: 'Life Skills', description: 'Practical real-world skills', emoji: '🛠️' },
    { id: 'balanced_development', label: 'Balanced Development', description: 'A bit of everything', emoji: '🌟' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        What's most important for your child's learning journey?
      </p>

      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {goals.map((goal) => (
          <Label
            key={goal.id}
            htmlFor={goal.id}
            className={`
              flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
              ${value === goal.id 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <RadioGroupItem value={goal.id} id={goal.id} />
            <span className="text-2xl">{goal.emoji}</span>
            <div className="flex-1">
              <div className="font-medium">{goal.label}</div>
              <div className="text-sm text-muted-foreground">{goal.description}</div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}

function QuickReadyStep({ formData }: { formData: WizardFormData }) {
  const getLearningStyleLabel = (style: string) => {
    const styles: Record<string, string> = {
      visual: '👁️ Visual',
      auditory: '👂 Audio',
      kinesthetic: '🖐️ Hands-On',
      balanced: '⚖️ Mixed',
    };
    return styles[style] || style;
  };

  const getGoalLabel = (goal: string) => {
    const goals: Record<string, string> = {
      academic_growth: '📚 Academic Excellence',
      emotional_intelligence: '💖 Emotional Growth',
      life_skills: '🛠️ Life Skills',
      balanced_development: '🌟 Balanced Development',
    };
    return goals[goal] || goal;
  };

  return (
    <div className="space-y-6 text-center py-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
      >
        <CheckCircle className="w-10 h-10 text-white" />
      </motion.div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">You're All Set!</h3>
        <p className="text-muted-foreground">
          Here's what we'll use to personalize your experience:
        </p>
      </div>

      <div className="space-y-2 text-left bg-muted/50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Learning Style:</span>
          <span className="font-medium">{getLearningStyleLabel(formData.learningStyle)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Primary Goal:</span>
          <span className="font-medium">{getGoalLabel(formData.primaryGoal)}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        💡 You can complete your full profile anytime from Settings.
      </p>
    </div>
  );
}

export default QuickStartWizard;
