/**
 * Lazy component loading utilities with retry logic and error handling
 * Provides consistent lazy loading patterns across the app
 */

import { ComponentType, LazyExoticComponent, lazy, Suspense, ReactNode } from 'react';
import { PageLoader } from '@/components/ui/app-loading';

/**
 * Import with retry logic for resilience
 */
async function importWithRetry<T>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    if (retries <= 0) {
      console.error('[LazyLoader] Failed after all retries:', error);
      throw error;
    }
    
    console.warn(`[LazyLoader] Import failed, retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return importWithRetry(importFn, retries - 1, delay * 1.5);
  }
}

/**
 * Create a lazy-loaded component with retry logic
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(() => importWithRetry(importFn));
}

/**
 * Wrapper for lazy components with built-in Suspense
 */
export function LazyWrapper({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback ?? <PageLoader />}>
      {children}
    </Suspense>
  );
}

/**
 * Preload a lazy component before it's needed
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  importFn().catch(error => {
    console.warn('[LazyLoader] Preload failed:', error);
  });
}

/**
 * Preload multiple components on idle
 */
export function preloadOnIdle(
  components: Array<() => Promise<{ default: ComponentType<any> }>>
): void {
  const preload = () => {
    components.forEach(preloadComponent);
  };
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 3000 });
  } else {
    setTimeout(preload, 1500);
  }
}
