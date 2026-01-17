/**
 * @fileoverview Nudge Banner Component
 * Full-width banner for displaying high-priority nudges at the top of pages.
 * Phase 4 Enhancement: Standalone banner component for Inner Odyssey K-12
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAINudges } from '@/hooks/useAINudges';

interface NudgeBannerProps {
  childId?: string;
  className?: string;
  variant?: 'default' | 'gradient' | 'subtle';
  dismissible?: boolean;
  autoHideMs?: number;
}

export function NudgeBanner({
  childId,
  className,
  variant = 'default',
  dismissible = true,
  autoHideMs,
}: NudgeBannerProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  
  const {
    nudges,
    isLoading,
    recordImpression,
    dismissNudge,
    completeNudge,
  } = useAINudges({
    childId,
    location: 'banner',
    maxNudges: 1,
    autoFetch: true,
  });

  // Get the first banner nudge
  const nudge = nudges[0];

  // Auto-hide after delay
  useState(() => {
    if (autoHideMs && nudge) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideMs);
      return () => clearTimeout(timer);
    }
  });

  // Record impression when nudge is shown
  useState(() => {
    if (nudge && isVisible) {
      recordImpression(nudge.id);
    }
  });

  if (isLoading || !nudge || !isVisible) {
    return null;
  }

  const handleAction = () => {
    if (nudge.actionUrl) {
      navigate(nudge.actionUrl);
      completeNudge(nudge.id);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    dismissNudge(nudge.id);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-primary-foreground';
      case 'subtle':
        return 'bg-muted border-b border-border';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'w-full py-2.5 px-4',
          getVariantClasses(),
          className
        )}
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Message */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <p className={cn(
              'text-sm font-medium truncate',
              variant === 'subtle' && 'text-foreground'
            )}>
              <span className="font-semibold mr-2">{nudge.title}</span>
              <span className={cn(
                'hidden sm:inline',
                variant === 'subtle' ? 'text-muted-foreground' : 'opacity-90'
              )}>
                {nudge.message}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {nudge.actionUrl && (
              <Button
                size="sm"
                variant={variant === 'subtle' ? 'default' : 'secondary'}
                onClick={handleAction}
                className="gap-1"
              >
                {nudge.actionLabel || 'Learn More'}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
            
            {dismissible && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDismiss}
                className={cn(
                  'h-7 w-7 shrink-0',
                  variant !== 'subtle' && 'text-inherit hover:bg-white/20'
                )}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NudgeBanner;
