import { useEffect, useRef, useCallback } from 'react';
import { useLocation, Link, LinkProps } from 'react-router-dom';
import { preloadRoute } from '@/config/lazyRoutes';
import { useAuth } from './useAuth';

/**
 * Route import map for preloading
 */
const routeImportMap: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
  '/parent-dashboard': () => import('@/pages/ParentDashboard'),
  '/parent/dashboard': () => import('@/pages/ParentDashboard'),
  '/parent-setup': () => import('@/pages/ParentSetup'),
  '/parent/setup': () => import('@/pages/ParentSetup'),
  '/child-dashboard': () => import('@/pages/ChildDashboard'),
  '/child/dashboard': () => import('@/pages/ChildDashboard'),
  '/lessons': () => import('@/pages/Lessons'),
  '/child/lessons': () => import('@/pages/Lessons'),
  '/badges': () => import('@/pages/Badges'),
  '/child/badges': () => import('@/pages/Badges'),
  '/rewards': () => import('@/pages/Rewards'),
  '/child/rewards': () => import('@/pages/Rewards'),
  '/settings': () => import('@/pages/Settings'),
  '/child/settings': () => import('@/pages/Settings'),
  '/progress': () => import('@/pages/LearningProgress'),
  '/child/progress': () => import('@/pages/LearningProgress'),
  '/my-room': () => import('@/pages/KidsRoom'),
  '/play': () => import('@/pages/Play'),
  '/social': () => import('@/pages/Social'),
  '/child/social': () => import('@/pages/Social'),
  '/admin-dashboard': () => import('@/pages/AdminDashboard'),
  '/admin/dashboard': () => import('@/pages/AdminDashboard'),
  '/video-library': () => import('@/pages/VideoLibrary'),
  '/child/video-library': () => import('@/pages/VideoLibrary'),
};

/**
 * Get the import function for a route path
 */
function getRouteImport(path: string): (() => Promise<{ default: React.ComponentType<any> }>) | null {
  // Direct match
  if (routeImportMap[path]) {
    return routeImportMap[path];
  }
  
  // Try without leading slash
  const withoutSlash = path.startsWith('/') ? path.slice(1) : path;
  if (routeImportMap[`/${withoutSlash}`]) {
    return routeImportMap[`/${withoutSlash}`];
  }
  
  // Check for dynamic routes
  if (path.includes('/lesson/')) {
    return () => import('@/pages/LessonDetail');
  }
  if (path.includes('/lesson-player/')) {
    return () => import('@/pages/LessonPlayer');
  }
  if (path.includes('/video/')) {
    return () => import('@/pages/VideoPlayer');
  }
  
  return null;
}

/**
 * Preload a route by path
 */
export function preloadRoutePath(path: string): void {
  const importFn = getRouteImport(path);
  if (importFn) {
    preloadRoute(importFn);
  }
}

/**
 * Hook for initializing route preloading
 */
export function useRoutePreload(): void {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const preloadedRef = useRef(new Set<string>());

  // Preload adjacent routes based on current location
  useEffect(() => {
    if (loading) return;
    
    const currentPath = location.pathname;
    
    // Define adjacent routes for common pages
    const adjacentRoutes: Record<string, string[]> = {
      '/': user ? ['/select-child', '/parent/dashboard', '/child/dashboard'] : ['/login'],
      '/login': ['/parent-setup', '/parent/dashboard'],
      '/select-child': ['/child/dashboard', '/parent/dashboard'],
      '/parent/dashboard': ['/parent/setup', '/child/dashboard'],
      '/parent-dashboard': ['/parent-setup', '/child-dashboard'],
      '/child/dashboard': ['/child/lessons', '/child/badges', '/child/progress', '/my-room'],
      '/child-dashboard': ['/lessons', '/badges', '/progress', '/my-room'],
      '/child/lessons': ['/child/dashboard', '/child/badges'],
      '/lessons': ['/child-dashboard', '/badges'],
      '/child/badges': ['/child/rewards', '/child/dashboard'],
      '/badges': ['/rewards', '/child-dashboard'],
    };
    
    // Preload routes adjacent to current location
    const routesToPreload = adjacentRoutes[currentPath] || [];
    
    // Also preload admin routes if user is admin
    if (isAdmin && !routesToPreload.some(r => r.includes('admin'))) {
      routesToPreload.push('/admin/dashboard');
    }
    
    // Preload each route (only once per session)
    routesToPreload.forEach(route => {
      if (!preloadedRef.current.has(route)) {
        preloadedRef.current.add(route);
        // Use requestIdleCallback for non-critical preloading
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => preloadRoutePath(route), { timeout: 3000 });
        } else {
          setTimeout(() => preloadRoutePath(route), 1000);
        }
      }
    });
  }, [location.pathname, user, isAdmin, loading]);
}

/**
 * Enhanced Link component that preloads routes on hover/focus
 */
export function PreloadLink({ to, children, ...props }: LinkProps): JSX.Element {
  const handleInteraction = useCallback(() => {
    if (typeof to === 'string') {
      preloadRoutePath(to);
    } else if (to.pathname) {
      preloadRoutePath(to.pathname);
    }
  }, [to]);
  
  return (
    <Link
      to={to}
      onMouseEnter={handleInteraction}
      onFocus={handleInteraction}
      onTouchStart={handleInteraction}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Hook that preloads a route when an element is visible
 */
export function useVisibilityPreload(
  elementRef: React.RefObject<HTMLElement>,
  path: string
): void {
  const preloadedRef = useRef(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element || preloadedRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !preloadedRef.current) {
            preloadedRef.current = true;
            preloadRoutePath(path);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [path]);
}
