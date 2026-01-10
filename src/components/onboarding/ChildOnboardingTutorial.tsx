/**
 * @fileoverview Age-Adaptive Child Onboarding Tutorial
 * Provides age-appropriate onboarding experiences for K-2, 3-5, 6-8, and 9-12 tiers.
 * Uses animations and visual cues optimized for each age group.
 */

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Star, 
  BookOpen, 
  Award, 
  Heart, 
  Rocket,
  Target,
  Gift,
  MessageCircle,
  TrendingUp,
  Palette,
  Smile
} from 'lucide-react';

interface ChildOnboardingTutorialProps {
  open: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  gradeLevel: number;
  childName: string;
}

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  emoji?: string;
}

/**
 * Get age tier from grade level
 */
function getAgeTier(gradeLevel: number): 'K-2' | '3-5' | '6-8' | '9-12' {
  if (gradeLevel <= 2) return 'K-2';
  if (gradeLevel <= 5) return '3-5';
  if (gradeLevel <= 8) return '6-8';
  return '9-12';
}

/**
 * Get age-appropriate onboarding steps
 */
function getStepsForAgeTier(tier: 'K-2' | '3-5' | '6-8' | '9-12', childName: string): OnboardingStep[] {
  switch (tier) {
    case 'K-2':
      return [
        {
          title: `Hi ${childName}! 🎉`,
          description: "Welcome to your learning adventure! Let's explore together!",
          icon: Sparkles,
          emoji: '🌟',
        },
        {
          title: "Earn Stars! ⭐",
          description: "When you finish activities, you get shiny stars!",
          icon: Star,
          emoji: '⭐',
        },
        {
          title: "Fun Lessons! 📚",
          description: "Tap the big colorful cards to start learning!",
          icon: BookOpen,
          emoji: '📚',
        },
        {
          title: "How Do You Feel? 😊",
          description: "Tell us how you feel today by picking an emoji!",
          icon: Smile,
          emoji: '😊',
        },
        {
          title: "Ready to Play!",
          description: "Tap the big START button to begin your adventure!",
          icon: Rocket,
          emoji: '🚀',
        },
      ];
    
    case '3-5':
      return [
        {
          title: `Welcome, ${childName}! 🎮`,
          description: "Your personalized learning journey starts now!",
          icon: Sparkles,
        },
        {
          title: "Daily Quests 🎯",
          description: "Complete 3 activities each day to earn bonus points!",
          icon: Target,
        },
        {
          title: "Level Up! 📈",
          description: "Earn XP to level up and unlock new badges!",
          icon: TrendingUp,
        },
        {
          title: "Customize Your Avatar 🎨",
          description: "Use your points to unlock cool avatar items!",
          icon: Palette,
        },
        {
          title: "Messages from Home 💬",
          description: "Check for encouraging messages from your parent!",
          icon: MessageCircle,
        },
        {
          title: "Let's Go! 🚀",
          description: "Start with today's quest on your dashboard!",
          icon: Rocket,
        },
      ];
    
    case '6-8':
      return [
        {
          title: `Welcome to Inner Odyssey`,
          description: `${childName}, your personalized learning platform is ready.`,
          icon: Sparkles,
        },
        {
          title: "Daily Challenges",
          description: "Complete daily quests for bonus XP and streak rewards.",
          icon: Target,
        },
        {
          title: "Skill Progression",
          description: "Build mastery across subjects with skill trees and levels.",
          icon: TrendingUp,
        },
        {
          title: "Create Custom Lessons",
          description: "Request AI-generated lessons on topics you're curious about.",
          icon: BookOpen,
        },
        {
          title: "Earn Rewards",
          description: "Redeem your points for rewards set by your parent.",
          icon: Gift,
        },
        {
          title: "Track Your Progress",
          description: "View detailed analytics and achievements on your dashboard.",
          icon: Award,
        },
      ];
    
    case '9-12':
      return [
        {
          title: `Welcome, ${childName}`,
          description: "Your academic excellence journey begins here.",
          icon: Sparkles,
        },
        {
          title: "Structured Learning Paths",
          description: "Follow curated pathways aligned with your academic goals.",
          icon: Target,
        },
        {
          title: "Portfolio Building",
          description: "Completed lessons and achievements build your learning portfolio.",
          icon: Award,
        },
        {
          title: "AI-Powered Learning",
          description: "Generate custom lessons on advanced topics for deeper exploration.",
          icon: BookOpen,
        },
        {
          title: "Analytics Dashboard",
          description: "Track progress with detailed metrics and performance insights.",
          icon: TrendingUp,
        },
        {
          title: "Ready to Begin",
          description: "Start with today's challenge or explore your lesson library.",
          icon: Rocket,
        },
      ];
  }
}

export function ChildOnboardingTutorial({
  open,
  onComplete,
  onSkip,
  gradeLevel,
  childName,
}: ChildOnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const ageTier = useMemo(() => getAgeTier(gradeLevel), [gradeLevel]);
  const steps = useMemo(() => getStepsForAgeTier(ageTier, childName), [ageTier, childName]);
  
  const isK2 = ageTier === 'K-2';
  const is35 = ageTier === '3-5';
  
  // Age-adaptive sizing
  const dialogSize = isK2 ? 'sm:max-w-[600px]' : 'sm:max-w-[500px]';
  const iconSize = isK2 ? 'w-20 h-20' : is35 ? 'w-16 h-16' : 'w-14 h-14';
  const titleSize = isK2 ? 'text-3xl' : is35 ? 'text-2xl' : 'text-xl';
  const descSize = isK2 ? 'text-lg' : 'text-base';
  const buttonSize = isK2 ? 'lg' : 'default';

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStep].icon;
  const currentEmoji = steps[currentStep].emoji;

  // Age-adaptive animation variants
  const animationVariants = {
    initial: { opacity: 0, y: isK2 ? 50 : 20, scale: isK2 ? 0.8 : 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: isK2 ? -50 : -20, scale: isK2 ? 0.8 : 0.95 },
  };

  const iconBounce = {
    animate: isK2 
      ? { y: [0, -10, 0], transition: { repeat: Infinity, duration: 2 } }
      : {},
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className={`${dialogSize} border-2`}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: isK2 ? 0.5 : 0.3 }}
              className="flex flex-col items-center"
            >
              {/* Icon with age-adaptive styling */}
              <motion.div 
                className={`${iconSize} rounded-full bg-primary/10 flex items-center justify-center mb-4`}
                {...iconBounce}
              >
                {currentEmoji ? (
                  <span className={isK2 ? 'text-5xl' : 'text-3xl'}>{currentEmoji}</span>
                ) : (
                  <CurrentIcon className={`${isK2 ? 'w-10 h-10' : 'w-8 h-8'} text-primary`} />
                )}
              </motion.div>

              <DialogTitle className={`text-center ${titleSize} font-bold`}>
                {steps[currentStep].title}
              </DialogTitle>
              
              <DialogDescription className={`text-center ${descSize} pt-3 max-w-[90%]`}>
                {steps[currentStep].description}
              </DialogDescription>
            </motion.div>
          </AnimatePresence>
        </DialogHeader>

        {/* Progress indicator - simplified for K-2 */}
        <div className="space-y-3 py-4">
          {isK2 ? (
            // K-2: Star dots instead of progress bar
            <div className="flex justify-center gap-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-4 h-4 rounded-full ${
                    index <= currentStep 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                  animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              ))}
            </div>
          ) : (
            // 3-5 and above: Progress bar
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Skip button - smaller for younger kids */}
          {!isK2 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              size={buttonSize}
              className="flex-1"
            >
              Skip
            </Button>
          )}
          
          {/* Back button - hide on first step */}
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              size={buttonSize}
              className="flex-1"
            >
              {isK2 ? '← Back' : 'Back'}
            </Button>
          )}
          
          {/* Next/Complete button - prominent for all ages */}
          <Button 
            onClick={handleNext} 
            size={buttonSize}
            className={`flex-1 ${isK2 ? 'text-lg h-14' : ''}`}
          >
            {currentStep === steps.length - 1 
              ? (isK2 ? "Let's Go! 🚀" : "Get Started") 
              : (isK2 ? "Next →" : "Next")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ChildOnboardingTutorial;
