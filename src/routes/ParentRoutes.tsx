import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { parentRoutes } from '@/config/routes.config';

/**
 * Loading fallback for parent routes
 */
const ParentLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Loading parent dashboard...</p>
    </div>
  </div>
);

/**
 * Parent routes component
 * Handles all parent-facing routes (dashboard, setup, reports, settings)
 * Requires authentication and parent role
 */
export const ParentRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <ParentLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Suspense fallback={<ParentLoader />}>
      <Routes>
        {parentRoutes.map((route) => (
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
