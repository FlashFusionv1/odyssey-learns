import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface RequireAdminProps {
  children: React.ReactNode;
}

/**
 * Route guard that requires user to be authenticated AND have admin role
 * Redirects to login if not authenticated
 * Redirects to parent dashboard if not admin
 */
export const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/parent" replace />;
  }

  return <>{children}</>;
};
