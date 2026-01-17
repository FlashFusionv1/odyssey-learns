/**
 * Performance initialization and monitoring
 * Run at app startup for optimal performance
 */

import { prefetchCommonData, createQueryClient, clearQueryCache } from './queryConfig';
import { initializePerformanceMonitoring } from './performance';
import { initializePreloading } from '@/config/preloadRoutes';

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize all performance optimizations
 * Returns a promise that resolves when critical initialization is complete
 */
export function initializePerformance(options?: {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  userId?: string;
}): Promise<void> {
  if (isInitialized) return Promise.resolve();
  
  // Prevent multiple initializations
  if (initializationPromise) return initializationPromise;
  
  initializationPromise = (async () => {
    try {
      // Initialize performance monitoring first (fast, sync-ish)
      initializePerformanceMonitoring();
      
      // Initialize route preloading based on auth state
      initializePreloading({
        isAuthenticated: options?.isAuthenticated ?? false,
        isAdmin: options?.isAdmin ?? false,
      });
      
      // Report Web Vitals if available
      deferNonCritical(reportWebVitals);
      
      isInitialized = true;
      
      // Log initialization
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance] Initialization complete', {
          isAuthenticated: options?.isAuthenticated,
          isAdmin: options?.isAdmin,
          connectionType: getConnectionType(),
          isLowMemory: isLowMemoryDevice(),
        });
      }
    } catch (error) {
      console.warn('[Performance] Initialization failed:', error);
      isInitialized = true; // Still mark as initialized to prevent loops
    }
  })();
  
  return initializationPromise;
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
  initializationPromise = null;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance] Cleaned up on logout');
  }
}

/**
 * Report Core Web Vitals
 */
export function reportWebVitals(): void {
  // Only run if web-vitals is available
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
    const handleVital = (metric: { name: string; value: number; rating: string }) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const rating = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(`[Web Vitals] ${rating} ${metric.name}: ${Math.round(metric.value)}ms`);
      }
      
      // In production, could send to analytics
      // recordWebVital(metric);
    };
    
    onCLS(handleVital);
    onFID?.(handleVital);
    onFCP(handleVital);
    onLCP(handleVital);
    onTTFB(handleVital);
    onINP?.(handleVital);
  }).catch(() => {
    // web-vitals not available, silently fail
  });
}

/**
 * Defer non-critical initialization
 */
export function deferNonCritical(callback: () => void, timeout = 5000): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
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

/**
 * Check if the browser supports modern features
 */
export function supportsModernFeatures(): boolean {
  return (
    'IntersectionObserver' in window &&
    'requestIdleCallback' in window &&
    'fetch' in window &&
    CSS.supports?.('display', 'grid')
  );
}

/**
 * Preload critical images for faster LCP
 */
export function preloadCriticalImages(imagePaths: string[]): void {
  imagePaths.forEach((path) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
  });
}

/**
 * Mark the app as fully interactive (for performance timing)
 */
export function markAppReady(): void {
  if ('performance' in window && 'mark' in performance) {
    performance.mark('app-ready');
    
    // Measure time from navigation start to app ready
    try {
      performance.measure('app-startup', 'navigationStart', 'app-ready');
      const measure = performance.getEntriesByName('app-startup')[0];
      if (measure && process.env.NODE_ENV === 'development') {
        console.log(`[Performance] App ready in ${Math.round(measure.duration)}ms`);
      }
    } catch {
      // Measurement failed, ignore
    }
  }
}
