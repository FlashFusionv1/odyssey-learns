import { Route } from 'react-router-dom';
import { Suspense, memo } from 'react';
import { adminRoutes } from '@/config/routes.config';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { DashboardSkeleton } from '@/components/ui/skeleton-loaders';

/**
 * Memoized admin loading component with skeleton
 */
const AdminLoader = memo(() => <DashboardSkeleton />);

AdminLoader.displayName = 'AdminLoader';

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
