import { Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { publicRoutes, errorRoutes } from '@/config/routes.config';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ROUTE_PATHS } from '@/constants/routePaths';

const PublicLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

/**
 * Public routes
 * Returns an array of Route elements for landing, marketing, and info pages
 */
export const renderPublicRoutes = () => {
  const routes = publicRoutes.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={
        <RouteErrorBoundary feature="public">
          <Suspense fallback={<PublicLoader />}>
            {route.requireAuth ? (
              <RequireAuth>
                <route.component />
              </RequireAuth>
            ) : (
              <route.component />
            )}
          </Suspense>
        </RouteErrorBoundary>
      }
    />
  ));

  // Add legacy redirects
  routes.push(
    <Route 
      key="legacy-parent-dashboard"
      path="/parent-dashboard" 
      element={<Navigate to={ROUTE_PATHS.PARENT.DASHBOARD} replace />} 
    />
  );

  // Add 404 fallback
  errorRoutes.forEach((route) => {
    routes.push(
      <Route
        key={route.path}
        path={route.path}
        element={
          <RouteErrorBoundary feature="public">
            <Suspense fallback={<PublicLoader />}>
              <route.component />
            </Suspense>
          </RouteErrorBoundary>
        }
      />
    );
  });

  return routes;
};

export default renderPublicRoutes;
