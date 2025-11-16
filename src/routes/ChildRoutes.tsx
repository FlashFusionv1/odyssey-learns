import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useValidatedChild } from '@/hooks/useValidatedChild';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { childRoutes } from '@/config/routes.config';

/**
 * Loading fallback for child routes
 */
const ChildLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Loading your adventure...</p>
    </div>
  </div>
);

/**
 * Child routes component
 * Handles all child-facing routes (dashboard, lessons, badges, social, etc.)
 * Requires authentication and child selection
 * Enforces screen time limits and lesson quotas
 */
export const ChildRoutes = () => {
  const { user, loading: authLoading } = useAuth();
  const { childId, isValidating } = useValidatedChild();

  // Show loading state while checking authentication and child validation
  if (authLoading || isValidating) {
    return <ChildLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to index if no child selected
  if (!childId) {
    return <Navigate to="/index" replace />;
  }

  return (
    <Suspense fallback={<ChildLoader />}>
      <Routes>
        {childRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </Suspense>
  );
};
