/**
 * App-wide loading components and utilities
 * Used for consistent loading states across the application
 */

import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
} as const;

/**
 * Animated loading spinner with optional text
 */
export const LoadingSpinner = memo(({ 
  size = 'md', 
  className,
  text 
}: LoadingSpinnerProps) => (
  <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
    {text && (
      <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
    )}
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Full-screen loading overlay
 */
export const FullScreenLoader = memo(({ 
  text = 'Loading...' 
}: { 
  text?: string 
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
    <LoadingSpinner size="xl" text={text} />
  </div>
));

FullScreenLoader.displayName = 'FullScreenLoader';

/**
 * Page-level loading state
 */
export const PageLoader = memo(({ 
  text = 'Loading page...',
  minHeight = '50vh' 
}: { 
  text?: string;
  minHeight?: string;
}) => (
  <div 
    className="flex items-center justify-center w-full"
    style={{ minHeight }}
  >
    <LoadingSpinner size="lg" text={text} />
  </div>
));

PageLoader.displayName = 'PageLoader';

/**
 * Card-level loading skeleton
 */
export const CardSkeleton = memo(({ className }: { className?: string }) => (
  <div 
    className={cn(
      'rounded-lg border border-border bg-card p-6 animate-pulse',
      className
    )}
  >
    <div className="h-4 w-3/4 bg-muted rounded mb-4" />
    <div className="h-3 w-1/2 bg-muted rounded mb-2" />
    <div className="h-3 w-2/3 bg-muted rounded" />
  </div>
));

CardSkeleton.displayName = 'CardSkeleton';

/**
 * List skeleton loader
 */
export const ListSkeleton = memo(({ 
  count = 3,
  className 
}: { 
  count?: number;
  className?: string;
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i}
        className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card animate-pulse"
      >
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
        </div>
      </div>
    ))}
  </div>
));

ListSkeleton.displayName = 'ListSkeleton';

/**
 * Dashboard skeleton with cards
 */
export const DashboardSkeleton = memo(() => (
  <div className="space-y-6 p-4 md:p-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-10 w-24 bg-muted rounded animate-pulse" />
    </div>
    
    {/* Stats cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
    
    {/* Main content area */}
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <ListSkeleton count={3} />
      </div>
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <CardSkeleton className="h-64" />
      </div>
    </div>
  </div>
));

DashboardSkeleton.displayName = 'DashboardSkeleton';

/**
 * Lesson card skeleton
 */
export const LessonCardSkeleton = memo(({ className }: { className?: string }) => (
  <div 
    className={cn(
      'rounded-lg border border-border bg-card overflow-hidden animate-pulse',
      className
    )}
  >
    <div className="h-32 bg-muted" />
    <div className="p-4 space-y-3">
      <div className="h-5 w-3/4 bg-muted rounded" />
      <div className="h-3 w-full bg-muted rounded" />
      <div className="h-3 w-2/3 bg-muted rounded" />
      <div className="flex justify-between pt-2">
        <div className="h-6 w-16 bg-muted rounded" />
        <div className="h-6 w-20 bg-muted rounded" />
      </div>
    </div>
  </div>
));

LessonCardSkeleton.displayName = 'LessonCardSkeleton';

/**
 * Lessons grid skeleton
 */
export const LessonsGridSkeleton = memo(({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <LessonCardSkeleton key={i} />
    ))}
  </div>
));

LessonsGridSkeleton.displayName = 'LessonsGridSkeleton';
