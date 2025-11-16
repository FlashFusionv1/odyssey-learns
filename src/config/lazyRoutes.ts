import { ComponentType, LazyExoticComponent, lazy } from 'react';

/**
 * Cache for preloaded route modules to avoid duplicate imports
 */
const preloadCache = new Map<string, Promise<{ default: ComponentType<any> }>>();

/**
 * Retry configuration for failed lazy imports
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
};

/**
 * Options for creating a lazy route
 */
interface LazyRouteOptions {
  /** Whether to enable preloading for this route */
  preload?: boolean;
  /** Maximum number of retry attempts for failed imports */
  maxRetries?: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;
}

/**
 * Create a lazy-loaded route with retry logic and optional preloading
 * 
 * @param importFn - Function that returns a dynamic import promise
 * @param options - Configuration options for the lazy route
 * @returns LazyExoticComponent that can be used in React Router
 * 
 * @example
 * const Dashboard = createLazyRoute(
 *   () => import('./pages/Dashboard'),
 *   { preload: true, maxRetries: 3 }
 * );
 */
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyRouteOptions = {}
): LazyExoticComponent<T> {
  const {
    preload = false,
    maxRetries = RETRY_CONFIG.maxRetries,
    retryDelay = RETRY_CONFIG.retryDelay,
  } = options;

  // Create a unique key for this import function
  const importKey = importFn.toString();

  /**
   * Import with retry logic
   */
  const importWithRetry = async (retriesLeft = maxRetries): Promise<{ default: T }> => {
    try {
      // Check cache first
      if (preloadCache.has(importKey)) {
        return preloadCache.get(importKey) as Promise<{ default: T }>;
      }

      // Perform the import
      const modulePromise = importFn();
      
      // Cache if preloading is enabled
      if (preload) {
        preloadCache.set(importKey, modulePromise);
      }

      return await modulePromise;
    } catch (error) {
      // If retries are exhausted, throw the error
      if (retriesLeft <= 0) {
        console.error(`Failed to load route after ${maxRetries} attempts:`, error);
        throw error;
      }

      // Wait before retrying
      console.warn(`Route load failed, retrying... (${retriesLeft} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // Retry the import
      return importWithRetry(retriesLeft - 1);
    }
  };

  return lazy(() => importWithRetry());
}

/**
 * Preload a route component without rendering it
 * Useful for hover preloading or preloading on idle
 * 
 * @param importFn - Function that returns a dynamic import promise
 * @returns Promise that resolves when the module is loaded
 * 
 * @example
 * <Link 
 *   to="/dashboard" 
 *   onMouseEnter={() => preloadRoute(() => import('./pages/Dashboard'))}
 * >
 *   Dashboard
 * </Link>
 */
export async function preloadRoute(
  importFn: () => Promise<{ default: ComponentType<any> }>
): Promise<void> {
  const importKey = importFn.toString();

  // Return cached promise if available
  if (preloadCache.has(importKey)) {
    await preloadCache.get(importKey);
    return;
  }

  // Start preloading and cache the promise
  const modulePromise = importFn();
  preloadCache.set(importKey, modulePromise);

  try {
    await modulePromise;
  } catch (error) {
    // Remove from cache on error so it can be retried
    preloadCache.delete(importKey);
    console.error('Failed to preload route:', error);
  }
}

/**
 * Preload multiple routes in parallel
 * 
 * @param importFns - Array of import functions to preload
 * @returns Promise that resolves when all routes are loaded
 * 
 * @example
 * preloadMultipleRoutes([
 *   () => import('./pages/Dashboard'),
 *   () => import('./pages/Lessons'),
 *   () => import('./pages/Settings'),
 * ]);
 */
export async function preloadMultipleRoutes(
  importFns: Array<() => Promise<{ default: ComponentType<any> }>>
): Promise<void> {
  await Promise.all(importFns.map(preloadRoute));
}

/**
 * Preload routes when the browser is idle
 * Uses requestIdleCallback if available, falls back to setTimeout
 * 
 * @param importFns - Array of import functions to preload
 * @param priority - Priority level (1 = high, 2 = medium, 3 = low)
 */
export function preloadOnIdle(
  importFns: Array<() => Promise<{ default: ComponentType<any> }>>
): void {
  const preload = () => {
    preloadMultipleRoutes(importFns).catch((error) => {
      console.error('Failed to preload routes on idle:', error);
    });
  };

  // Use requestIdleCallback if available
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 2000 });
  } else {
    // Fallback to setTimeout
    setTimeout(preload, 1000);
  }
}

/**
 * Clear the preload cache (useful for testing or memory management)
 */
export function clearPreloadCache(): void {
  preloadCache.clear();
}

/**
 * Get the size of the preload cache
 */
export function getPreloadCacheSize(): number {
  return preloadCache.size;
}
