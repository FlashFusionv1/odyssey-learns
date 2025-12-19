import { Route } from 'react-router-dom';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { childRoutes } from '@/config/routes.config';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { RequireChild } from '@/components/auth/RequireChild';

const ChildLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm">Loading your adventure...</p>
    </div>
  </div>
);

/**
 * Child routes
 * Returns an array of Route elements for child dashboard, lessons, and achievements
 */
export const renderChildRoutes = () => {
  return childRoutes.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={
        <RouteErrorBoundary feature="child">
          <RequireChild>
            <Suspense fallback={<ChildLoader />}>
              <route.component />
            </Suspense>
          </RequireChild>
        </RouteErrorBoundary>
      }
    />
  ));
};

export default renderChildRoutes;
