/**
 * PWA Version Configuration
 * Used for detecting stale service workers and forcing updates
 */

// Increment this version when deploying breaking changes
// Format: MAJOR.MINOR.PATCH
export const PWA_VERSION = '1.0.1';

// Build timestamp injected at build time (fallback to current time for dev)
export const BUILD_TIMESTAMP = typeof __PWA_BUILD_TIMESTAMP__ !== 'undefined' 
  ? __PWA_BUILD_TIMESTAMP__ 
  : Date.now();

// Storage keys
export const VERSION_STORAGE_KEY = 'pwa_version';
export const LAST_UPDATE_KEY = 'pwa_last_update';
export const BUILD_TIMESTAMP_KEY = 'pwa_build_timestamp';

/**
 * Get the current app version
 */
export function getCurrentVersion(): string {
  return PWA_VERSION;
}

/**
 * Get the stored version from localStorage
 */
export function getStoredVersion(): string | null {
  try {
    return localStorage.getItem(VERSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Set the stored version in localStorage
 */
export function setStoredVersion(version: string): void {
  try {
    localStorage.setItem(VERSION_STORAGE_KEY, version);
    localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());
    localStorage.setItem(BUILD_TIMESTAMP_KEY, BUILD_TIMESTAMP.toString());
  } catch (e) {
    console.error('Failed to store PWA version:', e);
  }
}

/**
 * Get the stored build timestamp
 */
export function getStoredBuildTimestamp(): number | null {
  try {
    const stored = localStorage.getItem(BUILD_TIMESTAMP_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Check if there's a version mismatch
 */
export function hasVersionMismatch(): boolean {
  const storedVersion = getStoredVersion();
  const storedBuildTimestamp = getStoredBuildTimestamp();
  
  // If no stored version, this is a fresh install
  if (!storedVersion) {
    return false;
  }
  
  // Check version string mismatch
  if (storedVersion !== PWA_VERSION) {
    return true;
  }
  
  // Check build timestamp mismatch (for same version but new build)
  if (storedBuildTimestamp && storedBuildTimestamp !== BUILD_TIMESTAMP) {
    return true;
  }
  
  return false;
}

/**
 * Get last update timestamp
 */
export function getLastUpdateTime(): Date | null {
  try {
    const timestamp = localStorage.getItem(LAST_UPDATE_KEY);
    return timestamp ? new Date(parseInt(timestamp, 10)) : null;
  } catch {
    return null;
  }
}

// Declare the global type for the build timestamp
declare global {
  const __PWA_BUILD_TIMESTAMP__: number;
}
