import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: ", r);
      // Check for updates every 60 seconds
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
    // Force immediate update when new SW is available
    immediate: true,
  });

  // Force check for updates on mount and clear old caches
  useEffect(() => {
    const clearOldCaches = async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name => name.includes('workbox') || name.includes('sw-'))
            .map(name => caches.delete(name))
        );
      }
    };

    // If we detect the app is broken (no content rendered), force clear caches
    const checkAppHealth = () => {
      const root = document.getElementById('root');
      if (root && root.children.length === 0) {
        console.log('App appears broken, clearing caches...');
        clearOldCaches().then(() => {
          window.location.reload();
        });
      }
    };

    // Check after a short delay to allow React to render
    const timeout = setTimeout(checkAppHealth, 3000);
    return () => clearTimeout(timeout);
  }, []);

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

  return {
    isInstallable,
    installPWA,
    needRefresh,
    updateServiceWorker,
  };
}
