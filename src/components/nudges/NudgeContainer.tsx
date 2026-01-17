/**
 * @fileoverview AI Nudge Container Component
 * Manages the display and lifecycle of nudges based on location.
 */

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAINudges } from '@/hooks/useAINudges';
import { NudgeCard } from './NudgeCard';
import { cn } from '@/lib/utils';
import type { NudgeDisplayLocation } from '@/types/onboarding';

interface NudgeContainerProps {
  location: NudgeDisplayLocation;
  childId?: string;
  maxNudges?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'banner';
}

export function NudgeContainer({
  location,
  childId,
  maxNudges = 3,
  className,
  variant,
}: NudgeContainerProps) {
  const {
    nudges,
    isLoading,
    recordImpression,
    dismissNudge,
    completeNudge,
    rateNudge,
  } = useAINudges({
    childId,
    location,
    maxNudges,
    autoFetch: true,
  });

  // Determine variant based on location if not specified
  const displayVariant = variant || (
    location === 'banner' ? 'banner' :
    location === 'sidebar' ? 'compact' :
    'default'
  );

  if (isLoading || nudges.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'space-y-3',
        location === 'banner' && 'space-y-0',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {nudges.map((nudge) => (
          <NudgeCard
            key={nudge.id}
            nudge={nudge}
            variant={displayVariant}
            onDismiss={dismissNudge}
            onComplete={completeNudge}
            onRate={rateNudge}
            onImpression={recordImpression}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default NudgeContainer;
