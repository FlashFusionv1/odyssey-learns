/**
 * PWA Health Check System
 * Monitors app health and enables recovery from white screen issues
 * 
 * Improved with:
 * - MutationObserver for reliable React mount detection
 * - Graduated recovery strategies
 * - Cooldown periods to prevent loops
 * - Debug logging toggle
 */

const HEALTH_KEY = 'pwa_health_timestamp';
const RECOVERY_KEY = 'pwa_recovery_attempts';
const INIT_STATE_KEY = 'pwa_init_state';
const DEBUG_KEY = 'pwa_debug_enabled';
const HEARTBEAT_INTERVAL = 3000; // 3 seconds (increased from 2s)
const INIT_GRACE_PERIOD = 5000; // 5 seconds grace period for initialization

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let initState: 'starting' | 'mounting' | 'ready' = 'starting';

/**
 * Debug logger - only logs if debug mode is enabled
 */
function debugLog(...args: unknown[]): void {
  try {
    if (localStorage.getItem(DEBUG_KEY) === 'true') {
      console.log('[PWA Health]', ...args);
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Update the health timestamp to indicate the app is alive
 */
function updateHealthTimestamp(): void {
  try {
    localStorage.setItem(HEALTH_KEY, Date.now().toString());
    localStorage.setItem(INIT_STATE_KEY, initState);
  } catch (e) {
    console.warn('Failed to update health timestamp:', e);
  }
}

/**
 * Mark the initialization state
 */
export function setInitState(state: 'starting' | 'mounting' | 'ready'): void {
  initState = state;
  debugLog('Init state changed to:', state);
  updateHealthTimestamp();
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
  
  debugLog('Heartbeat started');
}

/**
 * Stop the health heartbeat - call on unmount
 */
export function stopHealthHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  debugLog('Heartbeat stopped');
}

/**
 * Mark the app as healthy - clears recovery attempts counter
 * Call this after successful React render
 */
export function markHealthy(): void {
  try {
    // Only clear recovery attempts after a grace period
    // This prevents clearing too early if there's a delayed crash
    setTimeout(() => {
      const currentRecoveryAttempts = getRecoveryAttempts();
      if (currentRecoveryAttempts > 0) {
        localStorage.removeItem(RECOVERY_KEY);
        debugLog('Cleared recovery attempts after grace period');
      }
    }, INIT_GRACE_PERIOD);
    
    setInitState('ready');
    updateHealthTimestamp();
    debugLog('App marked as healthy');
  } catch (e) {
    console.warn('Failed to mark healthy:', e);
  }
}

/**
 * Mark app as mounting (between start and ready)
 */
export function markMounting(): void {
  setInitState('mounting');
  debugLog('App mounting');
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
  initState: string;
  isHealthy: boolean;
  heartbeatActive: boolean;
} {
  try {
    const lastHealth = localStorage.getItem(HEALTH_KEY);
    const recoveryAttempts = getRecoveryAttempts();
    const lastHealthTimestamp = lastHealth ? parseInt(lastHealth, 10) : null;
    const storedInitState = localStorage.getItem(INIT_STATE_KEY) || 'unknown';
    
    return {
      lastHealthTimestamp,
      recoveryAttempts,
      initState: storedInitState,
      isHealthy: recoveryAttempts === 0 && lastHealthTimestamp !== null && initState === 'ready',
      heartbeatActive: heartbeatInterval !== null,
    };
  } catch {
    return {
      lastHealthTimestamp: null,
      recoveryAttempts: 0,
      initState: 'unknown',
      isHealthy: false,
      heartbeatActive: false,
    };
  }
}

/**
 * Enable/disable debug logging
 */
export function setDebugMode(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(DEBUG_KEY, 'true');
      console.log('[PWA Health] Debug mode enabled');
    } else {
      localStorage.removeItem(DEBUG_KEY);
      console.log('[PWA Health] Debug mode disabled');
    }
  } catch {
    // Ignore
  }
}

/**
 * Use MutationObserver to detect when React mounts
 * More reliable than timeout-based checks
 */
export function observeReactMount(callback: () => void): () => void {
  const root = document.getElementById('root');
  if (!root) {
    console.warn('[PWA Health] Root element not found');
    return () => {};
  }

  // If React already mounted, call immediately
  if (root.children.length > 0 && root.innerHTML.length > 100) {
    callback();
    return () => {};
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        // Check if meaningful content was added
        if (root.innerHTML.length > 100) {
          observer.disconnect();
          callback();
          return;
        }
      }
    }
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
  });

  // Cleanup function
  return () => observer.disconnect();
}

// Expose to window for debugging in console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__pwaHealth = {
    getStatus: getHealthStatus,
    setDebug: setDebugMode,
    markHealthy,
    getRecoveryAttempts,
  };
}
