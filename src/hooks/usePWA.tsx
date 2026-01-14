import { useEffect, useState, useCallback } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { 
  PWA_VERSION, 
  getLastUpdateTime, 
  hasVersionMismatch 
} from "@/config/pwaVersion";
import { 
  checkAndPerformVersionUpgrade, 
  fullReset, 
  clearAllCaches,
  unregisterServiceWorkers 
} from "@/lib/clearCache";
import { logUpdateEvent } from "@/lib/updateLogger";

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'updating' | 'error';

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("[PWA] SW Registered:", r);
      // Check for updates every 60 seconds
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log("[PWA] SW registration error", error);
      setUpdateStatus('error');
    },
    onNeedRefresh() {
      console.log("[PWA] New content available");
      setUpdateStatus('available');
      logUpdateEvent({
        type: 'sw_update',
        success: true,
        details: 'New service worker available',
      });
    },
    immediate: true,
  });

  // Check for version mismatch on mount
  useEffect(() => {
    const checkVersion = async () => {
      if (hasVersionMismatch()) {
        setIsUpgrading(true);
        setUpgradeMessage('Updating to latest version...');
        
        const upgraded = await checkAndPerformVersionUpgrade();
        
        if (upgraded) {
          setUpgradeMessage('Update complete! Reloading...');
          // Wait a moment to show the message, then reload
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setIsUpgrading(false);
          setUpgradeMessage('');
        }
      }
    };
    
    checkVersion();
  }, []);

  // App health check on mount
  useEffect(() => {
    const checkAppHealth = async () => {
      const root = document.getElementById('root');
      
      // If root is empty after 5 seconds, something is wrong
      const healthTimeout = setTimeout(async () => {
        if (root && root.children.length === 0) {
          console.log('[PWA] App appears broken, clearing caches...');
          await clearAllCaches();
          await unregisterServiceWorkers();
          window.location.reload();
        }
      }, 5000);
      
      return () => clearTimeout(healthTimeout);
    };

    checkAppHealth();
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }
    return false;
  };

  const checkForUpdates = useCallback(async () => {
    setUpdateStatus('checking');
    setLastChecked(new Date());
    
    try {
      // Get the SW registration and check for updates
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          console.log('[PWA] Manual update check completed');
        }
      }
      
      // If no new update found, set back to idle after a short delay
      setTimeout(() => {
        if (updateStatus === 'checking') {
          setUpdateStatus('idle');
        }
      }, 2000);
    } catch (error) {
      console.error('[PWA] Update check failed:', error);
      setUpdateStatus('error');
    }
  }, [updateStatus]);

  const forceUpdate = useCallback(async () => {
    setUpdateStatus('updating');
    setUpgradeMessage('Forcing update...');
    
    try {
      await fullReset();
    } catch (error) {
      console.error('[PWA] Force update failed:', error);
      setUpdateStatus('error');
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    setUpdateStatus('updating');
    setUpgradeMessage('Installing update...');
    
    try {
      await updateServiceWorker(true);
      logUpdateEvent({
        type: 'sw_update',
        toVersion: PWA_VERSION,
        success: true,
        details: 'Update applied via prompt',
      });
    } catch (error) {
      console.error('[PWA] Apply update failed:', error);
      setUpdateStatus('error');
    }
  }, [updateServiceWorker]);

  // Check if running as installed PWA
  const isStandalone = typeof window !== 'undefined' && 
    (window.matchMedia('(display-mode: standalone)').matches ||
     (window.navigator as any).standalone === true);

  return {
    // Install
    isInstallable,
    installPWA,
    isStandalone,
    
    // Update state
    needRefresh,
    updateStatus,
    isUpgrading,
    upgradeMessage,
    
    // Update actions
    updateServiceWorker: applyUpdate,
    checkForUpdates,
    forceUpdate,
    
    // Info
    appVersion: PWA_VERSION,
    lastChecked,
    lastUpdateTime: getLastUpdateTime(),
  };
}
