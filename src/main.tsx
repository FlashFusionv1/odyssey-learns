import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { setupGlobalErrorHandlers } from "./lib/errorHandler";
import { initializePerformanceMonitoring } from "./lib/performance";
import { startHealthHeartbeat, markHealthy, wasRecovered, clearRecoveryParam } from "./lib/healthCheck";
import { PWA_VERSION, BUILD_TIMESTAMP } from "./config/pwaVersion";
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

// Wrapper component to handle post-mount health check
function AppWithHealthCheck() {
  useEffect(() => {
    // Mark app as healthy after successful render
    markHealthy();
    
    // Start the health heartbeat
    startHealthHeartbeat();
    
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppWithHealthCheck />
    </ErrorBoundary>
  </StrictMode>
);
