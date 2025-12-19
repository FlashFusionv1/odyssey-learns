import { Route } from 'react-router-dom';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { adminRoutes } from '@/config/routes.config';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { RequireAdmin } from '@/components/auth/RequireAdmin';

const AdminLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm">Loading admin panel...</p>
    </div>
  </div>
);

/**
 * Admin routes
 * Returns an array of Route elements for admin dashboard and content management
 */
export const renderAdminRoutes = () => {
  return adminRoutes.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={
        <RouteErrorBoundary feature="admin">
          <RequireAdmin>
            <Suspense fallback={<AdminLoader />}>
              <route.component />
            </Suspense>
          </RequireAdmin>
        </RouteErrorBoundary>
      }
    />
  ));
};

export default renderAdminRoutes;
