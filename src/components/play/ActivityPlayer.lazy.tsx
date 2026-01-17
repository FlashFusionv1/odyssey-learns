/**
 * Lazy-loaded ActivityPlayer with error boundary and loading state
 */
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ActivityErrorBoundary } from '@/components/error/ActivityErrorBoundary';

// Lazy load the heavy ActivityPlayer component
const ActivityPlayerBase = React.lazy(() => 
  import('./ActivityPlayer').then(module => ({ default: module.ActivityPlayer }))
);

interface ActivityPlayerLazyProps {
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

function ActivityPlayerFallback() {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Loading activity...</p>
      </div>
    </div>
  );
}

export function ActivityPlayerLazy(props: ActivityPlayerLazyProps) {
  return (
    <ActivityErrorBoundary onClose={props.onClose}>
      <Suspense fallback={<ActivityPlayerFallback />}>
        <ActivityPlayerBase {...props} />
      </Suspense>
    </ActivityErrorBoundary>
  );
}

export default ActivityPlayerLazy;
