/**
 * PWA Health Check System
 * Monitors app health and enables recovery from white screen issues
 */

const HEALTH_KEY = 'pwa_health_timestamp';
const RECOVERY_KEY = 'pwa_recovery_attempts';
const HEARTBEAT_INTERVAL = 2000; // 2 seconds

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Update the health timestamp to indicate the app is alive
 */
function updateHealthTimestamp(): void {
  try {
    localStorage.setItem(HEALTH_KEY, Date.now().toString());
  } catch (e) {
    console.warn('Failed to update health timestamp:', e);
  }
}

/**
 * Start the health heartbeat - should be called after React renders
 */
export function startHealthHeartbeat(): void {
  // Update immediately
  updateHealthTimestamp();
  
  // Clear any existing interval
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  // Start periodic updates
  heartbeatInterval = setInterval(updateHealthTimestamp, HEARTBEAT_INTERVAL);
  
  console.log('[PWA Health] Heartbeat started');
}

/**
 * Stop the health heartbeat - call on unmount
 */
export function stopHealthHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  console.log('[PWA Health] Heartbeat stopped');
}

/**
 * Mark the app as healthy - clears recovery attempts counter
 * Call this after successful React render
 */
export function markHealthy(): void {
  try {
    localStorage.removeItem(RECOVERY_KEY);
    updateHealthTimestamp();
    console.log('[PWA Health] App marked as healthy');
  } catch (e) {
    console.warn('Failed to mark healthy:', e);
  }
}

/**
 * Get the current recovery attempts count
 */
export function getRecoveryAttempts(): number {
  try {
    return parseInt(localStorage.getItem(RECOVERY_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

/**
 * Check if the app was recovered from an issue
 * Returns true if URL contains recovery parameter
 */
export function wasRecovered(): boolean {
  const url = new URL(window.location.href);
  return url.searchParams.has('recovery');
}

/**
 * Clear the recovery parameter from URL
 */
export function clearRecoveryParam(): void {
  const url = new URL(window.location.href);
  if (url.searchParams.has('recovery')) {
    url.searchParams.delete('recovery');
    window.history.replaceState({}, '', url.pathname + url.search);
  }
}

/**
 * Get health check status for debugging
 */
export function getHealthStatus(): {
  lastHealthTimestamp: number | null;
  recoveryAttempts: number;
  isHealthy: boolean;
} {
  try {
    const lastHealth = localStorage.getItem(HEALTH_KEY);
    const recoveryAttempts = getRecoveryAttempts();
    const lastHealthTimestamp = lastHealth ? parseInt(lastHealth, 10) : null;
    
    return {
      lastHealthTimestamp,
      recoveryAttempts,
      isHealthy: recoveryAttempts === 0 && lastHealthTimestamp !== null,
    };
  } catch {
    return {
      lastHealthTimestamp: null,
      recoveryAttempts: 0,
      isHealthy: false,
    };
  }
}
