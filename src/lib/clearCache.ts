/**
 * PWA Cache Management with Version Awareness
 * Clear all caches and unregister service workers
 */

import { 
  PWA_VERSION, 
  BUILD_TIMESTAMP,
  getStoredVersion, 
  getStoredBuildTimestamp,
  setStoredVersion,
  hasVersionMismatch 
} from '@/config/pwaVersion';
import { logUpdateEvent } from './updateLogger';

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorkers(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
    console.log('[PWA Cache] All service workers unregistered');
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<string[]> {
  const clearedCaches: string[] = [];
  
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(async (name) => {
        await caches.delete(name);
        clearedCaches.push(name);
      })
    );
    console.log('[PWA Cache] All caches cleared:', clearedCaches);
  }
  
  return clearedCaches;
}

/**
 * Clear PWA-related localStorage items
 */
export function clearPWALocalStorage(): string[] {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('sw') || 
      key.includes('workbox') ||
      key === 'pwa_health_timestamp' ||
      key === 'pwa_recovery_attempts'
    )) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log('[PWA Cache] Cleared localStorage keys:', keysToRemove);
  
  return keysToRemove;
}

/**
 * Check for version mismatch and perform upgrade if needed
 * Returns true if upgrade was performed
 */
export async function checkAndPerformVersionUpgrade(): Promise<boolean> {
  const storedVersion = getStoredVersion();
  const storedBuildTimestamp = getStoredBuildTimestamp();
  
  console.log('[PWA Version] Current:', PWA_VERSION, 'Build:', BUILD_TIMESTAMP);
  console.log('[PWA Version] Stored:', storedVersion, 'Build:', storedBuildTimestamp);
  
  // Fresh install - just set the version
  if (!storedVersion) {
    console.log('[PWA Version] Fresh install detected');
    setStoredVersion(PWA_VERSION);
    logUpdateEvent({
      type: 'version_upgrade',
      toVersion: PWA_VERSION,
      success: true,
      details: 'Fresh install',
    });
    return false;
  }
  
  // Check for version or build timestamp mismatch
  if (hasVersionMismatch()) {
    console.log('[PWA Version] Mismatch detected! Upgrading...');
    
    try {
      // Clear everything
      await unregisterServiceWorkers();
      await clearAllCaches();
      clearPWALocalStorage();
      
      // Update stored version
      setStoredVersion(PWA_VERSION);
      
      logUpdateEvent({
        type: 'version_upgrade',
        fromVersion: storedVersion,
        toVersion: PWA_VERSION,
        success: true,
        details: 'Auto-upgrade on version mismatch',
      });
      
      return true;
    } catch (error) {
      console.error('[PWA Version] Upgrade failed:', error);
      
      logUpdateEvent({
        type: 'version_upgrade',
        fromVersion: storedVersion,
        toVersion: PWA_VERSION,
        success: false,
        details: String(error),
      });
      
      return false;
    }
  }
  
  console.log('[PWA Version] Up to date');
  return false;
}

/**
 * Force reload the app with cache bypass
 */
export function forceReload(): void {
  // Force hard reload bypassing cache
  window.location.href = window.location.origin + '?cacheBust=' + Date.now();
}

/**
 * Full reset: clear caches, update version, and reload
 */
export async function fullReset(): Promise<void> {
  const storedVersion = getStoredVersion();
  
  logUpdateEvent({
    type: 'manual_refresh',
    fromVersion: storedVersion || undefined,
    toVersion: PWA_VERSION,
    success: true,
    details: 'Manual full reset triggered',
  });
  
  await unregisterServiceWorkers();
  await clearAllCaches();
  clearPWALocalStorage();
  setStoredVersion(PWA_VERSION);
  forceReload();
}

/**
 * Emergency clear - for recovery from white screen
 */
export async function emergencyClear(): Promise<void> {
  logUpdateEvent({
    type: 'recovery',
    success: true,
    details: 'Emergency cache clear',
  });
  
  await unregisterServiceWorkers();
  await clearAllCaches();
  // Don't clear PWA localStorage here to preserve recovery tracking
}

// Expose to window for emergency debugging
if (typeof window !== 'undefined') {
  (window as any).__clearPWACache = fullReset;
  (window as any).__emergencyClear = emergencyClear;
  (window as any).__checkPWAVersion = checkAndPerformVersionUpgrade;
}
