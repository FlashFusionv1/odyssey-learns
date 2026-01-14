// PWA Types for Inner Odyssey
// Proper typing for PWA-related features

/**
 * BeforeInstallPromptEvent - Web API event for PWA installation
 * This event is fired when the browser detects the app can be installed
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
 */
export interface BeforeInstallPromptEvent extends Event {
  /**
   * Platforms on which the app can be installed
   */
  readonly platforms: string[];

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;

  /**
   * Shows a prompt asking the user if they want to install the app.
   * This method can only be called once and will throw if called again.
   */
  prompt(): Promise<void>;
}

/**
 * Extended Window interface with PWA-related properties
 */
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/**
 * PWA Update status states
 */
export type PWAUpdateStatus = 'idle' | 'checking' | 'available' | 'updating' | 'error';

/**
 * PWA installation state
 */
export interface PWAInstallState {
  isInstallable: boolean;
  isStandalone: boolean;
  isInstalled: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

/**
 * PWA update state
 */
export interface PWAUpdateState {
  status: PWAUpdateStatus;
  lastChecked: Date | null;
  error: string | null;
}

/**
 * PWA hook return type
 */
export interface UsePWAReturn {
  // Install-related
  isInstallable: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  install: () => Promise<boolean>;
  
  // Update-related
  updateStatus: PWAUpdateStatus;
  lastChecked: Date | null;
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => Promise<void>;
  
  // Upgrade prompt
  isUpgrading: boolean;
  upgradeMessage: string;
  dismissUpgrade: () => void;
}
