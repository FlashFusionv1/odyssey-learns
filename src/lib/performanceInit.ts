/**
 * Performance initialization and monitoring
 * Run at app startup for optimal performance
 */

import { prefetchCommonData, createQueryClient, clearQueryCache } from './queryConfig';
import { initializePerformanceMonitoring } from './performance';
import { initializePreloading } from '@/config/preloadRoutes';

// Track initialization state
let isInitialized = false;

/**
 * Initialize all performance optimizations
 */
export function initializePerformance(options?: {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  userId?: string;
}): void {
  if (isInitialized) return;
  isInitialized = true;
  
  // Initialize performance monitoring
  initializePerformanceMonitoring();
  
  // Initialize route preloading based on auth state
  initializePreloading({
    isAuthenticated: options?.isAuthenticated ?? false,
    isAdmin: options?.isAdmin ?? false,
  });
  
  // Log initialization
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance] Initialization complete', {
      isAuthenticated: options?.isAuthenticated,
      isAdmin: options?.isAdmin,
    });
  }
}

/**
 * Prefetch data for authenticated users
 */
export async function prefetchAuthenticatedData(
  queryClient: ReturnType<typeof createQueryClient>,
  userId: string
): Promise<void> {
  try {
    await prefetchCommonData(queryClient, userId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance] Prefetched authenticated data for user:', userId);
    }
  } catch (error) {
    console.warn('[Performance] Failed to prefetch data:', error);
  }
}

/**
 * Cleanup on logout
 */
export function cleanupOnLogout(
  queryClient: ReturnType<typeof createQueryClient>
): void {
  // Clear query cache
  clearQueryCache(queryClient);
  
  // Reset initialization for next login
  isInitialized = false;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance] Cleaned up on logout');
  }
}

/**
 * Report Core Web Vitals
 */
export function reportWebVitals(): void {
  if ('web-vitals' in window) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      const handleVital = (metric: { name: string; value: number }) => {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals] ${metric.name}:`, metric.value);
        }
        
        // Send to analytics in production
        // TODO: Integrate with analytics service
      };
      
      onCLS(handleVital);
      onFID(handleVital);
      onFCP(handleVital);
      onLCP(handleVital);
      onTTFB(handleVital);
    }).catch(() => {
      // web-vitals not available
    });
  }
}

/**
 * Defer non-critical initialization
 */
export function deferNonCritical(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 5000 });
  } else {
    setTimeout(callback, 2000);
  }
}

/**
 * Check if the app is running in a low-memory environment
 */
export function isLowMemoryDevice(): boolean {
  // @ts-ignore - deviceMemory is not in all browsers
  const deviceMemory = navigator.deviceMemory;
  return deviceMemory !== undefined && deviceMemory < 4;
}

/**
 * Get connection type for adaptive loading
 */
export function getConnectionType(): 'slow' | 'fast' | 'unknown' {
  // @ts-ignore - connection is not in all browsers
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return 'unknown';
  
  const { effectiveType, saveData } = connection;
  
  if (saveData) return 'slow';
  if (effectiveType === '4g') return 'fast';
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
  
  return 'unknown';
}

/**
 * Should we use reduced quality assets?
 */
export function shouldReduceQuality(): boolean {
  const connection = getConnectionType();
  const lowMemory = isLowMemoryDevice();
  
  return connection === 'slow' || lowMemory;
}
