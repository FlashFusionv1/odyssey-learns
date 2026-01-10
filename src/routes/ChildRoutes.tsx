import { Route } from 'react-router-dom';
import { Suspense, memo, useMemo } from 'react';
import { childRoutes } from '@/config/routes.config';
import { RouteErrorBoundary } from '@/components/error/RouteErrorBoundary';
import { RequireChild } from '@/components/auth/RequireChild';
import { DashboardSkeleton, LessonsSkeleton, LessonPlayerSkeleton } from '@/components/ui/skeleton-loaders';

/**
 * Get appropriate skeleton based on route path
 */
function getSkeletonForRoute(path: string): JSX.Element {
  if (path.includes('lesson-player') || path.includes('lesson/')) {
    return <LessonPlayerSkeleton />;
  }
  if (path.includes('lessons')) {
    return <LessonsSkeleton />;
  }
  return <DashboardSkeleton />;
}

/**
 * Memoized route wrapper for performance
 */
const ChildRouteElement = memo(({ 
  Component, 
  skeleton 
}: { 
  Component: React.ComponentType; 
  skeleton: JSX.Element;
}) => (
  <RouteErrorBoundary feature="child">
    <RequireChild>
      <Suspense fallback={skeleton}>
        <Component />
      </Suspense>
    </RequireChild>
  </RouteErrorBoundary>
));

ChildRouteElement.displayName = 'ChildRouteElement';

/**
 * Child routes
 * Returns an array of Route elements for child dashboard, lessons, and achievements
 */
export const renderChildRoutes = () => {
  return childRoutes.map((route) => {
    const skeleton = getSkeletonForRoute(route.path);
    
    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <ChildRouteElement 
            Component={route.component} 
            skeleton={skeleton} 
          />
        }
      />
    );
  });
};

export default renderChildRoutes;
