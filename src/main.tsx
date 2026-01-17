import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { setupGlobalErrorHandlers } from "./lib/errorHandler";
import { initializePerformanceMonitoring } from "./lib/performance";
import { startHealthHeartbeat, markHealthy, wasRecovered, clearRecoveryParam } from "./lib/healthCheck";
import { PWA_VERSION, BUILD_TIMESTAMP } from "./config/pwaVersion";
import { markAppReady } from "./lib/performanceInit";
import "./lib/clearCache"; // Expose emergency cache clear

// Initialize global error handlers and performance monitoring
setupGlobalErrorHandlers();
initializePerformanceMonitoring();

// Log PWA version for debugging
console.log(`[Inner Odyssey] Version: ${PWA_VERSION} | Build: ${BUILD_TIMESTAMP}`);

// Check if we recovered from an issue
if (wasRecovered()) {
  console.log('[PWA] App recovered from previous issue');
  clearRecoveryParam();
  // Will show toast after React mounts
}

/**
 * Hide the initial loading screen
 */
function hideAppLoader(): void {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hide');
    // Remove from DOM after transition
    setTimeout(() => loader.remove(), 300);
  }
}

// Wrapper component to handle post-mount health check
function AppWithHealthCheck() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Mark app as healthy after successful render
    markHealthy();
    
    // Start the health heartbeat
    startHealthHeartbeat();
    
    // Hide loading screen and mark ready
    hideAppLoader();
    setIsReady(true);
    
    // Mark app as ready for performance timing
    markAppReady();
    
    // Show recovery toast if applicable
    if (window.location.search.includes('cacheBust')) {
      // Came from a force reload, clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    return () => {
      // Heartbeat will continue even after unmount in case of re-render
    };
  }, []);

  return <App />;
}

// Start rendering
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <AppWithHealthCheck />
      </ErrorBoundary>
    </StrictMode>
  );
} else {
  console.error('[Fatal] Root element not found');
}
