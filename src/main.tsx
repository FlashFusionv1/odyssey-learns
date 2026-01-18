import { StrictMode, useEffect, useState, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { setupGlobalErrorHandlers } from "./lib/errorHandler";
import { initializePerformanceMonitoring } from "./lib/performance";
import { 
  startHealthHeartbeat, 
  markHealthy, 
  markMounting,
  wasRecovered, 
  clearRecoveryParam,
  observeReactMount
} from "./lib/healthCheck";
import { PWA_VERSION, BUILD_TIMESTAMP } from "./config/pwaVersion";
import { markAppReady } from "./lib/performanceInit";

// Initialize global error handlers and performance monitoring early
setupGlobalErrorHandlers();
initializePerformanceMonitoring();

// Log PWA version for debugging
console.log(`[Inner Odyssey] Version: ${PWA_VERSION} | Build: ${BUILD_TIMESTAMP}`);

// Check if we recovered from an issue
if (wasRecovered()) {
  console.log('[PWA] App recovered from previous issue');
  clearRecoveryParam();
}

/**
 * Update loading progress text in the HTML loader
 */
function updateLoadingProgress(text: string): void {
  const progressEl = document.getElementById('loading-progress');
  if (progressEl) {
    progressEl.textContent = text;
  }
}

/**
 * Hide the initial loading screen with smooth transition
 */
function hideAppLoader(): void {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hide');
    // Remove from DOM after transition
    setTimeout(() => loader.remove(), 300);
  }
}

/**
 * Minimal loading fallback for Suspense
 */
const MinimalLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

/**
 * Wrapper component to handle post-mount health check and initialization
 */
function AppWithHealthCheck() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Mark that we're in the mounting phase
    markMounting();
    updateLoadingProgress('Mounting components...');
    
    // Use a small delay to ensure React has fully rendered
    const initTimer = setTimeout(() => {
      // Mark app as healthy after successful render
      markHealthy();
      
      // Start the health heartbeat
      startHealthHeartbeat();
      
      // Hide loading screen and mark ready
      hideAppLoader();
      setIsReady(true);
      
      // Mark app as ready for performance timing
      markAppReady();
      
      console.log('[App] Initialization complete');
    }, 100);
    
    // Show recovery toast if applicable
    if (window.location.search.includes('cacheBust')) {
      // Came from a force reload, clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    return () => {
      clearTimeout(initTimer);
      // Note: We don't stop heartbeat on unmount - it should continue
    };
  }, []);

  return (
    <Suspense fallback={<MinimalLoader />}>
      <App />
    </Suspense>
  );
}

// Update progress before starting React
updateLoadingProgress('Loading React...');

// Set up React mount observer for additional reliability
const cleanupObserver = observeReactMount(() => {
  console.log('[PWA] React mount detected via MutationObserver');
  updateLoadingProgress('React mounted, initializing...');
});

// Start rendering
const root = document.getElementById("root");
if (root) {
  updateLoadingProgress('Creating React root...');
  
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <AppWithHealthCheck />
      </ErrorBoundary>
    </StrictMode>
  );
} else {
  console.error('[Fatal] Root element not found');
  // Try to show error in loader
  updateLoadingProgress('Error: Root element not found');
}

// Cleanup observer after a delay (React should have mounted by then)
setTimeout(() => {
  cleanupObserver();
}, 10000);
