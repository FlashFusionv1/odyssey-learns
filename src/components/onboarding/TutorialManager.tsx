/**
 * @fileoverview Tutorial Manager Component
 * Coordinates tutorial display and integrates with useTutorialProgress hook.
 * Phase 5: Tutorial Trigger System for Inner Odyssey K-12
 */

import { useEffect } from 'react';
import { TutorialOverlay } from './TutorialOverlay';
import { useTutorialProgress, registerTutorial } from '@/hooks/useTutorialProgress';
import { useToast } from '@/hooks/use-toast';
import { 
  PARENT_DASHBOARD_TUTORIAL, 
  CHILD_LESSONS_TUTORIAL,
} from '@/types/onboarding';

// Register built-in tutorials
registerTutorial(PARENT_DASHBOARD_TUTORIAL);
registerTutorial(CHILD_LESSONS_TUTORIAL);

interface TutorialManagerProps {
  childId?: string;
  autoTrigger?: boolean;
}

export function TutorialManager({ childId, autoTrigger = true }: TutorialManagerProps) {
  const { toast } = useToast();
  
  const {
    activeTutorial,
    currentStep,
    isActive,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    deferTutorial,
  } = useTutorialProgress({
    childId,
    autoTrigger,
    onTutorialStart: (tutorialId) => {
      console.log(`Tutorial started: ${tutorialId}`);
    },
    onTutorialComplete: (tutorialId) => {
      toast({
        title: 'Tutorial Complete! 🎉',
        description: 'You can access this guide anytime from the help menu.',
      });
    },
  });

  // Don't render if no active tutorial
  if (!isActive || !activeTutorial) {
    return null;
  }

  return (
    <TutorialOverlay
      tutorial={activeTutorial}
      currentStep={currentStep}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipTutorial}
      onComplete={completeTutorial}
      onDefer={deferTutorial}
    />
  );
}

export default TutorialManager;
