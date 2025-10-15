import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Users, Trophy, Gift, CheckCircle } from 'lucide-react';

interface OnboardingTutorialProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Inner Odyssey! 🎉",
    description: "We're excited to help your child grow emotionally and academically. Let's take a quick tour!",
    icon: Sparkles,
  },
  {
    title: "Add Your Child",
    description: "First, create a profile for your child with their name and grade level. Each child gets their own personalized learning journey.",
    icon: Users,
  },
  {
    title: "Explore the Dashboard",
    description: "Track your child's progress, view completed lessons, and see their learning streak. You'll always know how they're doing!",
    icon: Trophy,
  },
  {
    title: "Set Up Rewards",
    description: "Create custom rewards your child can earn with points. This motivates learning and gives you a fun way to celebrate achievements!",
    icon: Gift,
  },
  {
    title: "You're All Set!",
    description: "That's it! Your child can now start their learning adventure. Check back anytime to see their progress.",
    icon: CheckCircle,
  },
];

export const OnboardingTutorial = ({ open, onComplete }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ onboarding_completed: true, onboarding_step: steps.length })
        .eq('id', user.id);

      toast({
        title: "Welcome aboard! 🚀",
        description: "You're ready to start your parenting journey with Inner Odyssey.",
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">{steps[currentStep].title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
