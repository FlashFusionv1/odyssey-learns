import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { authRoutes } from '@/config/routes.config';

/**
 * Loading fallback for auth routes
 */
const AuthLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Loading authentication...</p>
    </div>
  </div>
);

/**
 * Authentication routes component
 * Handles login, password reset, and password update flows
 * Redirects authenticated users to dashboard
 */
export const AuthRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <AuthLoader />;
  }

  // Redirect to index if already authenticated
  if (user) {
    return <Navigate to="/index" replace />;
  }

  return (
    <Suspense fallback={<AuthLoader />}>
      <Routes>
        {authRoutes.map((route) => (
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
