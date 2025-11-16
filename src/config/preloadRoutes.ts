import { preloadOnIdle, preloadRoute } from './lazyRoutes';

/**
 * Critical routes to preload on hover (high priority)
 * These are routes users are likely to navigate to immediately
 */
export const criticalRoutePreloads = [
  () => import('@/pages/ParentDashboard'),
  () => import('@/pages/ChildDashboard'),
  () => import('@/pages/Lessons'),
  () => import('@/pages/LessonPlayer'),
];

/**
 * Secondary routes to preload on idle (medium priority)
 * These are routes users might navigate to after initial interaction
 */
export const secondaryRoutePreloads = [
  () => import('@/pages/LessonDetail'),
  () => import('@/pages/Badges'),
  () => import('@/pages/Settings'),
  () => import('@/pages/Rewards'),
];

/**
 * Admin routes to preload on idle (low priority)
 * Only preloaded for users with admin role
 */
export const adminRoutePreloads = [
  () => import('@/pages/AdminDashboard'),
  () => import('@/pages/BetaAnalytics'),
  () => import('@/pages/SecurityMonitoring'),
];

/**
 * Initialize route preloading strategy
 * Called once on app mount
 */
export const initializePreloading = (options?: {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}) => {
  const { isAuthenticated = false, isAdmin = false } = options || {};

  // Only preload routes if user is authenticated
  if (isAuthenticated) {
    // Preload critical routes on idle
    preloadOnIdle(criticalRoutePreloads);

    // Preload secondary routes after a short delay
    setTimeout(() => {
      preloadOnIdle(secondaryRoutePreloads);
    }, 3000);

    // Preload admin routes if user is admin
    if (isAdmin) {
      setTimeout(() => {
        preloadOnIdle(adminRoutePreloads);
      }, 5000);
    }
  }
};

/**
 * Preload a specific route on hover
 * Use this for navigation links
 * 
 * @example
 * <Link 
 *   to="/dashboard" 
 *   onMouseEnter={() => preloadRouteOnHover(() => import('@/pages/Dashboard'))}
 * >
 *   Dashboard
 * </Link>
 */
export const preloadRouteOnHover = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>
) => {
  preloadRoute(importFn);
};
