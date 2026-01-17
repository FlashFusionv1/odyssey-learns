/**
 * Lazy-loaded MultiplayerGames page with error boundary and loading state
 */
import React, { Suspense } from 'react';
import { Loader2, Gamepad2 } from 'lucide-react';
import { PageContainer } from '@/components/ui/page-container';
import { GameErrorBoundary } from '@/components/error/GameErrorBoundary';

// Lazy load the heavy MultiplayerGames page
const MultiplayerGamesBase = React.lazy(() => 
  import('@/pages/MultiplayerGames')
);

interface MultiplayerGamesLazyProps {
  childId: string;
  gradeLevel: number;
}

function MultiplayerGamesFallback() {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative">
          <Gamepad2 className="w-16 h-16 text-primary/20" />
          <Loader2 className="w-8 h-8 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-muted-foreground">Loading multiplayer games...</p>
      </div>
    </PageContainer>
  );
}

export function MultiplayerGamesLazy(props: MultiplayerGamesLazyProps) {
  return (
    <GameErrorBoundary>
      <Suspense fallback={<MultiplayerGamesFallback />}>
        <MultiplayerGamesBase {...props} />
      </Suspense>
    </GameErrorBoundary>
  );
}

export default MultiplayerGamesLazy;
