/**
 * PWA Health Check System - Simplified
 * Monitors app health without aggressive recovery that causes loops
 */

const HEALTH_KEY = 'pwa_health_timestamp';
const HEARTBEAT_INTERVAL = 5000; // 5 seconds

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Update the health timestamp
 */
function updateHealthTimestamp(): void {
  try {
    localStorage.setItem(HEALTH_KEY, Date.now().toString());
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Start the health heartbeat - called after React renders
 */
export function startHealthHeartbeat(): void {
  updateHealthTimestamp();
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  heartbeatInterval = setInterval(updateHealthTimestamp, HEARTBEAT_INTERVAL);
}

/**
 * Stop the health heartbeat
 */
export function stopHealthHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

/**
 * Mark the app as healthy
 */
export function markHealthy(): void {
  updateHealthTimestamp();
}

/**
 * Mark app as mounting
 */
export function markMounting(): void {
  updateHealthTimestamp();
}

/**
 * Set init state (compatibility function)
 */
export function setInitState(_state: 'starting' | 'mounting' | 'ready'): void {
  updateHealthTimestamp();
}

/**
 * Get recovery attempts (always 0 now - no recovery system)
 */
export function getRecoveryAttempts(): number {
  return 0;
}

/**
 * Check if recovered from issue
 */
export function wasRecovered(): boolean {
  const url = new URL(window.location.href);
  return url.searchParams.has('recovery') || url.searchParams.has('cacheBust');
}

/**
 * Clear recovery params from URL
 */
export function clearRecoveryParam(): void {
  const url = new URL(window.location.href);
  if (url.searchParams.has('recovery') || url.searchParams.has('cacheBust')) {
    url.searchParams.delete('recovery');
    url.searchParams.delete('cacheBust');
    window.history.replaceState({}, '', url.pathname + (url.search || ''));
  }
}

/**
 * Observe React mount (simplified)
 */
export function observeReactMount(callback: () => void): () => void {
  const root = document.getElementById('root');
  if (!root) return () => {};

  if (root.children.length > 0) {
    callback();
    return () => {};
  }

  const observer = new MutationObserver(() => {
    if (root.children.length > 0) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}

/**
 * Get health status for debugging
 */
export function getHealthStatus(): Record<string, unknown> {
  return {
    heartbeatActive: heartbeatInterval !== null,
    timestamp: localStorage.getItem(HEALTH_KEY),
  };
}
