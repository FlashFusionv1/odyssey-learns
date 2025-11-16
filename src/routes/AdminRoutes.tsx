import { Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { adminRoutes } from '@/config/routes.config';
import { useToast } from '@/hooks/use-toast';

/**
 * Loading fallback for admin routes
 */
const AdminLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Loading admin dashboard...</p>
    </div>
  </div>
);

/**
 * Admin access denied component
 */
const AdminAccessDenied = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4 max-w-md p-8">
      <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-3xl">🚫</span>
      </div>
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground">
        You don't have permission to access the admin dashboard. 
        Please contact support if you believe this is an error.
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

/**
 * Admin routes component
 * Handles all admin-facing routes (dashboard, analytics, monitoring, etc.)
 * Requires authentication and admin role
 * Logs all admin access to audit trail
 */
export const AdminRoutes = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        // Check if user has admin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;

        const hasAdminRole = !!data;
        setIsAdmin(hasAdminRole);

        // Log admin access attempt
        if (hasAdminRole) {
          await supabase.from('security_access_log').insert({
            user_id: user.id,
            access_type: 'admin_dashboard',
            accessed_table: 'admin_routes',
            success: true,
          });
        } else {
          // Log unauthorized access attempt
          await supabase.from('security_access_log').insert({
            user_id: user.id,
            access_type: 'admin_dashboard',
            accessed_table: 'admin_routes',
            success: false,
            error_message: 'User does not have admin role',
          });

          toast({
            title: 'Access Denied',
            description: 'You do not have admin privileges.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdminRole();
  }, [user, toast]);

  // Show loading state while checking authentication and admin role
  if (authLoading || checking) {
    return <AdminLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show access denied if not admin
  if (isAdmin === false) {
    return <AdminAccessDenied />;
  }

  return (
    <Suspense fallback={<AdminLoader />}>
      <Routes>
        {adminRoutes.map((route) => (
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
