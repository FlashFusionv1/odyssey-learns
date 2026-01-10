/**
 * Clear all caches and unregister service workers
 * Use this to force a clean slate when the PWA is broken
 */
export async function clearAllCaches(): Promise<void> {
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
    console.log('All service workers unregistered');
  }

  // Clear all caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('All caches cleared:', cacheNames);
  }

  // Clear localStorage items related to PWA/SW
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('sw') || key.includes('pwa') || key.includes('workbox'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('PWA cache cleanup complete');
}

/**
 * Force reload the app with cache bypass
 */
export function forceReload(): void {
  // Force hard reload bypassing cache
  window.location.href = window.location.href + '?cacheBust=' + Date.now();
}

/**
 * Full reset: clear caches and reload
 */
export async function fullReset(): Promise<void> {
  await clearAllCaches();
  forceReload();
}

// Expose to window for emergency debugging
if (typeof window !== 'undefined') {
  (window as any).__clearPWACache = fullReset;
}
