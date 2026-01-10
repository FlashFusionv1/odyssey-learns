import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { PWAUpdatePrompt } from "./components/pwa/PWAUpdatePrompt";
import { SessionTimeoutProvider } from "./components/auth/SessionTimeoutProvider";
import { OnboardingProvider } from "./components/onboarding";
import { createQueryClient } from "./lib/queryConfig";
import { useRoutePreload } from "./hooks/useRoutePreload";

// Feature-based route renderers
import { 
  renderAuthRoutes, 
  renderPublicRoutes, 
  renderParentRoutes, 
  renderChildRoutes, 
  renderAdminRoutes 
} from "./routes";

// Create optimized React Query client
const queryClient = createQueryClient();

/**
 * Route preloading wrapper component
 */
const RoutePreloader = ({ children }: { children: React.ReactNode }) => {
  useRoutePreload();
  return <>{children}</>;
};

/**
 * Main App Component
 * 
 * Route organization:
 * - AuthRoutes: Login, password reset, account recovery
 * - ParentRoutes: Parent dashboard, setup, child management
 * - ChildRoutes: Child dashboard, lessons, badges, rewards
 * - AdminRoutes: Admin dashboard, analytics, content management
 * - PublicRoutes: Landing, marketing pages, 404 fallback
 */
const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <SessionTimeoutProvider>
              <OnboardingProvider>
                <RoutePreloader>
                  <Toaster />
                  <Sonner />
                  <PWAInstallPrompt />
                  <PWAUpdatePrompt />
                  <Routes>
                    {renderAuthRoutes()}
                    {renderParentRoutes()}
                    {renderChildRoutes()}
                    {renderAdminRoutes()}
                    {renderPublicRoutes()}
                  </Routes>
                </RoutePreloader>
              </OnboardingProvider>
            </SessionTimeoutProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
