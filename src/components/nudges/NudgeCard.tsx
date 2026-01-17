/**
 * @fileoverview AI Nudge Card Component
 * Displays a single nudge with actions and feedback options.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, Star, ThumbsUp, ThumbsDown,
  BookOpen, Lightbulb, Heart, Rocket, Brain, Trophy,
  Settings, Users, Sparkles, Gift, Compass, Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AINudge } from '@/types/onboarding';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Lightbulb,
  Heart,
  Rocket,
  Brain,
  Trophy,
  Settings,
  Users,
  Sparkles,
  Gift,
  Compass,
  Target,
  Star,
};

interface NudgeCardProps {
  nudge: AINudge;
  variant?: 'default' | 'compact' | 'banner';
  onDismiss?: (id: string) => void;
  onComplete?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  onImpression?: (id: string) => void;
  className?: string;
}

export function NudgeCard({
  nudge,
  variant = 'default',
  onDismiss,
  onComplete,
  onRate,
  onImpression,
  className,
}: NudgeCardProps) {
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  // Record impression on first render
  if (!hasBeenSeen && onImpression) {
    setHasBeenSeen(true);
    onImpression(nudge.id);
  }

  const IconComponent = ICON_MAP[nudge.icon] || Lightbulb;

  const handleAction = () => {
    if (nudge.actionUrl) {
      navigate(nudge.actionUrl);
      onComplete?.(nudge.id);
    }
  };

  const handleDismiss = () => {
    setShowFeedback(true);
  };

  const handleFeedback = (rating: number) => {
    onRate?.(nudge.id, rating);
    onDismiss?.(nudge.id);
    setShowFeedback(false);
  };

  const handleSkipFeedback = () => {
    onDismiss?.(nudge.id);
    setShowFeedback(false);
  };

  const getPriorityColor = () => {
    if (nudge.priority >= 8) return 'border-l-primary';
    if (nudge.priority >= 6) return 'border-l-warning';
    return 'border-l-muted-foreground';
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors',
          className
        )}
      >
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{nudge.title}</p>
          <p className="text-xs text-muted-foreground truncate">{nudge.message}</p>
        </div>
        {nudge.actionUrl && (
          <Button size="sm" variant="ghost" onClick={handleAction}>
            {nudge.actionLabel || 'View'}
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 w-6 h-6"
          onClick={() => onDismiss?.(nudge.id)}
        >
          <X className="w-3 h-3" />
        </Button>
      </motion.div>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b',
          className
        )}
      >
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <IconComponent className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <span className="font-medium">{nudge.title}</span>
            <span className="text-muted-foreground ml-2">{nudge.message}</span>
          </div>
          {nudge.actionUrl && (
            <Button size="sm" onClick={handleAction}>
              {nudge.actionLabel || 'Learn More'}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDismiss?.(nudge.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showFeedback ? (
        <motion.div
          key="feedback"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <Card className={cn('border-l-4 border-l-muted', className)}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Was this suggestion helpful?
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFeedback(5)}
                  className="gap-1"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFeedback(1)}
                  className="gap-1"
                >
                  <ThumbsDown className="w-4 h-4" />
                  No
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSkipFeedback}
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="nudge"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className={cn('border-l-4', getPriorityColor(), className)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground">{nudge.title}</h4>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 w-6 h-6 -mt-1 -mr-1"
                      onClick={handleDismiss}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {nudge.message}
                  </p>
                  {nudge.actionUrl && (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={handleAction}
                    >
                      {nudge.actionLabel || 'Take Action'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NudgeCard;
