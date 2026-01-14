import { Route } from 'react-router-dom';
import { Suspense, memo } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { authRoutes } from '@/config/routes.config';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';

/**
 * Memoized auth loading component
 */
const AuthLoader = memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm">Loading authentication...</p>
    </div>
  </div>
));

AuthLoader.displayName = 'AuthLoader';

/**
 * Authentication routes
 * Returns an array of Route elements for login, password reset flows
 */
export const renderAuthRoutes = () => {
  return authRoutes.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={
        <RouteErrorBoundary feature="auth">
          <Suspense fallback={<AuthLoader />}>
            <route.component />
          </Suspense>
        </RouteErrorBoundary>
      }
    />
  ));
};

export default renderAuthRoutes;
