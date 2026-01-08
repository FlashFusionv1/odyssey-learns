import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface RequireChildProps {
  children: React.ReactNode;
}

/**
 * Route guard that requires user to be authenticated AND have a child selected
 * Redirects to login if not authenticated
 * Redirects to child selector if no child is selected
 */
export const RequireChild = ({ children }: RequireChildProps) => {
  const { user, loading: authLoading } = useAuth();
  const { childId, isValidating } = useValidatedChild();

  if (authLoading || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!childId) {
    return <Navigate to="/select-child" replace />;
  }

  return <>{children}</>;
};
