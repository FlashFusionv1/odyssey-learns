import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { PWAUpdatePrompt } from "./components/pwa/PWAUpdatePrompt";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "./components/ui/loading-spinner";

// Eagerly loaded pages
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import UpdatePassword from "@/pages/UpdatePassword";
import About from "@/pages/About";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import Support from "@/pages/Support";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Discord from "@/pages/Discord";
import BetaProgram from "@/pages/BetaProgram";
import NotFound from "@/pages/NotFound";

// Lazy loaded pages
const ParentSetup = lazy(() => import("@/pages/ParentSetup"));
const ParentDashboard = lazy(() => import("@/pages/ParentDashboard"));
const ChildDashboard = lazy(() => import("@/pages/ChildDashboard"));
const ChildSelector = lazy(() => import("@/pages/ChildSelector"));
const Lessons = lazy(() => import("@/pages/Lessons"));
const LessonDetail = lazy(() => import("@/pages/LessonDetail"));
const LessonPlayer = lazy(() => import("@/pages/LessonPlayer"));
const CreatorDashboard = lazy(() => import("@/pages/CreatorDashboard"));
const CommunityLessons = lazy(() => import("@/pages/CommunityLessons"));
const Badges = lazy(() => import("@/pages/Badges"));
const Social = lazy(() => import("@/pages/Social"));
const Settings = lazy(() => import("@/pages/Settings"));
const Rewards = lazy(() => import("@/pages/Rewards"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminSetup = lazy(() => import("@/pages/AdminSetup"));
const BetaAnalytics = lazy(() => import("@/pages/BetaAnalytics"));
const BetaFeedbackAdmin = lazy(() => import("@/pages/BetaFeedbackAdmin"));
const LessonAnalytics = lazy(() => import("@/pages/LessonAnalytics"));
const Phase1LessonGeneration = lazy(() => import("@/pages/Phase1LessonGeneration"));
const SeedLessons = lazy(() => import("@/pages/SeedLessons"));
const LessonReview = lazy(() => import("@/pages/LessonReview"));
const LessonPerformanceAnalytics = lazy(() => import("@/pages/LessonPerformanceAnalytics"));
const StudentPerformanceReport = lazy(() => import("@/pages/StudentPerformanceReport"));
const SecurityMonitoring = lazy(() => import("@/pages/SecurityMonitoring"));
const SystemHealth = lazy(() => import("@/pages/SystemHealth"));

// Route guards
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireChild } from "./components/auth/RequireChild";
import { RequireAdmin } from "./components/auth/RequireAdmin";

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <PWAUpdatePrompt />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/support" element={<Support />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/discord" element={<Discord />} />
                <Route path="/beta-program" element={<BetaProgram />} />

                {/* Auth routes */}
                <Route path="/login" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/admin-setup" element={<AdminSetup />} />

                {/* Parent routes (require auth) */}
                <Route path="/parent" element={<RequireAuth><ParentDashboard /></RequireAuth>} />
                <Route path="/parent-setup" element={<RequireAuth><ParentSetup /></RequireAuth>} />
                <Route path="/select-child" element={<RequireAuth><ChildSelector /></RequireAuth>} />

                {/* Child routes (require auth + child selection) */}
                <Route path="/dashboard" element={<RequireChild><ChildDashboard /></RequireChild>} />
                <Route path="/lessons" element={<RequireChild><Lessons /></RequireChild>} />
                <Route path="/lessons/:id" element={<RequireChild><LessonDetail /></RequireChild>} />
                <Route path="/lessons/:id/play" element={<RequireChild><LessonPlayer /></RequireChild>} />
                <Route path="/creator" element={<RequireChild><CreatorDashboard /></RequireChild>} />
                <Route path="/community-lessons" element={<RequireChild><CommunityLessons /></RequireChild>} />
                <Route path="/badges" element={<RequireChild><Badges /></RequireChild>} />
                <Route path="/social" element={<RequireChild><Social /></RequireChild>} />
                <Route path="/settings" element={<RequireChild><Settings /></RequireChild>} />
                <Route path="/rewards" element={<RequireChild><Rewards /></RequireChild>} />

                {/* Admin routes (require admin role) */}
                <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                <Route path="/beta-analytics" element={<RequireAdmin><BetaAnalytics /></RequireAdmin>} />
                <Route path="/beta-feedback-admin" element={<RequireAdmin><BetaFeedbackAdmin /></RequireAdmin>} />
                <Route path="/lesson-analytics" element={<RequireAdmin><LessonAnalytics /></RequireAdmin>} />
                <Route path="/phase1-lesson-generation" element={<RequireAdmin><Phase1LessonGeneration /></RequireAdmin>} />
                <Route path="/seed-lessons" element={<RequireAdmin><SeedLessons /></RequireAdmin>} />
                <Route path="/lesson-review" element={<RequireAdmin><LessonReview /></RequireAdmin>} />
                <Route path="/lesson-performance-analytics" element={<RequireAdmin><LessonPerformanceAnalytics /></RequireAdmin>} />
                <Route path="/student-performance-report" element={<RequireAdmin><StudentPerformanceReport /></RequireAdmin>} />
                <Route path="/security-monitoring" element={<RequireAdmin><SecurityMonitoring /></RequireAdmin>} />
                <Route path="/system-health" element={<RequireAdmin><SystemHealth /></RequireAdmin>} />

                {/* Legacy redirects */}
                <Route path="/index" element={<Navigate to="/select-child" replace />} />
                <Route path="/parent-dashboard" element={<Navigate to="/parent" replace />} />

                {/* 404 fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
