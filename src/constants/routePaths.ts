/**
 * Centralized route paths for the entire application
 * Use these constants instead of hardcoding paths in components
 */
export const ROUTE_PATHS = {
  // Root
  ROOT: '/',
  INDEX: '/index',
  
  // Authentication
  AUTH: {
    LOGIN: '/login',
    RESET_PASSWORD: '/reset-password',
    UPDATE_PASSWORD: '/update-password',
  },
  
  // Public pages
  PUBLIC: {
    LANDING: '/',
    ABOUT: '/about',
    FEATURES: '/features',
    PRICING: '/pricing',
    CONTACT: '/contact',
    SUPPORT: '/support',
    TERMS: '/terms',
    PRIVACY: '/privacy',
    DISCORD: '/discord',
    BETA_PROGRAM: '/beta-program',
  },
  
  // Parent routes
  PARENT: {
    DASHBOARD: '/parent',
    SETUP: '/parent-setup',
  },
  
  // Child routes
  CHILD: {
    DASHBOARD: '/dashboard',
    LESSONS: '/lessons',
    LESSON_DETAIL: '/lessons/:id',
    LESSON_PLAYER: '/lessons/:id/play',
    CREATOR_DASHBOARD: '/creator',
    COMMUNITY_LESSONS: '/community-lessons',
    BADGES: '/badges',
    SOCIAL: '/social',
    SETTINGS: '/settings',
    REWARDS: '/rewards',
    PROGRESS: '/progress',
    VIDEO_LIBRARY: '/videos',
    VIDEO_PLAYER: '/video/:id',
    KIDS_ROOM: '/my-room',
    INTERACTIVE: '/play',
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin',
    SETUP: '/admin-setup',
    ANALYTICS: '/beta-analytics',
    FEEDBACK: '/beta-feedback-admin',
    LESSON_ANALYTICS: '/lesson-analytics',
    LESSON_GENERATION: '/phase1-lesson-generation',
    SEED_LESSONS: '/seed-lessons',
    LESSON_REVIEW: '/lesson-review',
    LESSON_PERFORMANCE: '/lesson-performance-analytics',
    STUDENT_PERFORMANCE: '/student-performance-report',
    SECURITY_MONITORING: '/security-monitoring',
    SYSTEM_HEALTH: '/system-health',
    TEACHER_PORTAL: '/teacher',
  },
  
  // Error pages
  NOT_FOUND: '/404',
} as const;

/**
 * Build a lesson detail path with ID
 */
export const buildLessonDetailPath = (lessonId: string): string => {
  return ROUTE_PATHS.CHILD.LESSON_DETAIL.replace(':id', lessonId);
};

/**
 * Build a lesson player path with ID
 */
export const buildLessonPlayerPath = (lessonId: string): string => {
  return ROUTE_PATHS.CHILD.LESSON_PLAYER.replace(':id', lessonId);
};

/**
 * Check if a path matches a route pattern
 */
export const matchesRoutePath = (currentPath: string, routePattern: string): boolean => {
  const pattern = routePattern.replace(/:[^/]+/g, '[^/]+');
  const regex = new RegExp(`^${pattern}$`);
  return regex.test(currentPath);
};

/**
 * Get the base path from a full path (e.g., '/parent/dashboard' -> '/parent')
 */
export const getBasePath = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 ? `/${parts[0]}` : '/';
};
