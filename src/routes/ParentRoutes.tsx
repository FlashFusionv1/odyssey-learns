import { Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { parentRoutes } from '@/config/routes.config';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Lazy load child selector
const ChildSelector = lazy(() => import('@/pages/ChildSelector'));

const ParentLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm">Loading parent dashboard...</p>
    </div>
  </div>
);

/**
 * Parent routes
 * Returns an array of Route elements for parent dashboard and child management
 */
export const renderParentRoutes = () => {
  const routes = parentRoutes.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={
        <RouteErrorBoundary feature="parent">
          <RequireAuth>
            <Suspense fallback={<ParentLoader />}>
              <route.component />
            </Suspense>
          </RequireAuth>
        </RouteErrorBoundary>
      }
    />
  ));

  // Add child selector route
  routes.push(
    <Route
      key="/select-child"
      path="/select-child"
      element={
        <RouteErrorBoundary feature="parent">
          <RequireAuth>
            <Suspense fallback={<ParentLoader />}>
              <ChildSelector />
            </Suspense>
          </RequireAuth>
        </RouteErrorBoundary>
      }
    />
  );

  return routes;
};

export default renderParentRoutes;
