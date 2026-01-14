import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Confetti from 'react-confetti';
import { Trophy, Star, Flame, Award } from 'lucide-react';

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  type: 'lesson' | 'quest' | 'streak' | 'badge' | 'level' | 'points';
  title: string;
  message: string;
  points?: number;
  gradeLevel?: number;
}

export const CelebrationModal = ({
  open,
  onClose,
  type,
  title,
  message,
  points = 0,
  gradeLevel = 5,
}: CelebrationModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      
      // Play sound effect if available
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore if sound fails to play
      });

      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Age-adaptive styling
  const isYoung = gradeLevel <= 2;
  const isMedium = gradeLevel > 2 && gradeLevel <= 5;

  const getIcon = () => {
    switch (type) {
      case 'lesson':
        return <Trophy className={`${isYoung ? 'w-20 h-20' : 'w-16 h-16'} text-primary`} />;
      case 'quest':
        return <Star className={`${isYoung ? 'w-20 h-20' : 'w-16 h-16'} text-yellow-500`} />;
      case 'streak':
        return <Flame className={`${isYoung ? 'w-20 h-20' : 'w-16 h-16'} text-orange-500`} />;
      case 'badge':
        return <Award className={`${isYoung ? 'w-20 h-20' : 'w-16 h-16'} text-purple-500`} />;
      case 'level':
        return <Star className={`${isYoung ? 'w-20 h-20' : 'w-16 h-16'} text-blue-500`} />;
      case 'points':
        return <Trophy className={`${isYoung ? 'w-20 h-20' : 'w-16 h-16'} text-green-500`} />;
      default:
        return <Trophy className={`${isYoung ? 'w-20 h-20' : 'w-16 h-16'} text-primary`} />;
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={isYoung ? 250 : isMedium ? 150 : 100}
          gravity={0.3}
        />
      )}

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={`${isYoung ? 'sm:max-w-[500px]' : 'sm:max-w-[400px]'}`}>
          <div className={`flex flex-col items-center text-center ${isYoung ? 'space-y-6 py-8' : 'space-y-4 py-6'}`}>
            {/* Icon with animation */}
            <div className={`animate-scale-in ${isYoung ? 'mb-4' : 'mb-2'}`}>
              {getIcon()}
            </div>

            {/* Title */}
            <h2 className={`font-bold text-foreground ${isYoung ? 'text-3xl' : isMedium ? 'text-2xl' : 'text-xl'}`}>
              {title}
            </h2>

            {/* Message */}
            <p className={`text-muted-foreground ${isYoung ? 'text-xl' : 'text-base'}`}>
              {message}
            </p>

            {/* Points earned */}
            {points > 0 && (
              <div className={`${isYoung ? 'text-3xl' : 'text-2xl'} font-bold text-primary`}>
                +{points} points! ⭐
              </div>
            )}

            {/* Close button */}
            <Button
              onClick={onClose}
              size={isYoung ? 'lg' : 'default'}
              className={`${isYoung ? 'text-lg px-8 py-6' : 'px-6'} mt-4`}
            >
              {isYoung ? '🎉 Awesome!' : 'Continue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
