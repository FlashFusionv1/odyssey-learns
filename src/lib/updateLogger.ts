/**
 * PWA Update Event Logger
 * Tracks update events for debugging
 */

const UPDATE_LOG_KEY = 'pwa_update_history';
const MAX_LOG_ENTRIES = 10;

export interface UpdateEvent {
  timestamp: number;
  type: 'version_upgrade' | 'cache_clear' | 'sw_update' | 'recovery' | 'manual_refresh';
  fromVersion?: string;
  toVersion?: string;
  success: boolean;
  details?: string;
}

/**
 * Log an update event
 */
export function logUpdateEvent(event: Omit<UpdateEvent, 'timestamp'>): void {
  try {
    const history = getUpdateHistory();
    const newEvent: UpdateEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    // Add new event at the beginning
    history.unshift(newEvent);
    
    // Keep only the last MAX_LOG_ENTRIES
    const trimmedHistory = history.slice(0, MAX_LOG_ENTRIES);
    
    localStorage.setItem(UPDATE_LOG_KEY, JSON.stringify(trimmedHistory));
    
    console.log('[PWA Update]', event.type, event.success ? '✓' : '✗', event.details || '');
  } catch (e) {
    console.warn('Failed to log update event:', e);
  }
}

/**
 * Get update history
 */
export function getUpdateHistory(): UpdateEvent[] {
  try {
    const stored = localStorage.getItem(UPDATE_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear update history
 */
export function clearUpdateHistory(): void {
  try {
    localStorage.removeItem(UPDATE_LOG_KEY);
  } catch (e) {
    console.warn('Failed to clear update history:', e);
  }
}

/**
 * Get a human-readable summary of recent updates
 */
export function getUpdateSummary(): string {
  const history = getUpdateHistory();
  
  if (history.length === 0) {
    return 'No recent updates';
  }
  
  const lastUpdate = history[0];
  const date = new Date(lastUpdate.timestamp);
  const timeAgo = getTimeAgo(lastUpdate.timestamp);
  
  return `Last update: ${lastUpdate.type} (${timeAgo})`;
}

/**
 * Helper to format time ago
 */
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).__getPWAUpdateHistory = getUpdateHistory;
}
