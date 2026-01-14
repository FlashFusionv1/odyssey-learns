import { Route } from 'react-router-dom';
import { Suspense, lazy, memo } from 'react';
import { parentRoutes } from '@/config/routes.config';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';

// Lazy load child selector with retry
const ChildSelector = lazy(() => 
  import('@/pages/ChildSelector').catch(() => {
    // Retry once on failure
    return new Promise(resolve => setTimeout(resolve, 1000))
      .then(() => import('@/pages/ChildSelector'));
  })
);

/**
 * Memoized parent loading component with skeleton
 */
const ParentLoader = memo(() => <DashboardSkeleton />);

ParentLoader.displayName = 'ParentLoader';

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
