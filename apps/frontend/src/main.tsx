import React from "react";
import ReactDOM from "react-dom/client";
import { createLogger } from "@kit/logger/browser";
import { LoggerProvider } from "@kit/logger/react";
import type { Logger } from "@kit/logger/types";
import { initBrowserConsoleCapture } from "@kit/brain-monitor/browser";
import { ErrorBoundary } from "./components/atoms/ErrorBoundary";
import "./utils/debugHelpers"; // Initialize debug helpers
import App from "./App";
import "./index.css";

// Auto-initialization disabled in brain monitor source - manual init only

// Global flag to detect multiple initialization attempts
if (window.__brainMonitorInitialized) {
  console.error("DUPLICATE BRAIN MONITOR INITIALIZATION DETECTED! This may cause 2ms polling issues.");
} else {
  window.__brainMonitorInitialized = true;
  console.log("Brain monitor initialization starting...");
}

// Runtime debugging for brain-monitor initialization
const isDevelopment = import.meta.env.DEV;
const brainMonitorConfig = {
  endpoint: "/api/brain-monitor/browser-logs", // This will be proxied to backend
  flushInterval: isDevelopment ? 10000 : 30000, // 10s in dev, 30s in prod
  maxBufferSize: 50,   // Smaller buffer to prevent overload
};

// Log actual configuration being used
console.log("Brain monitor config:", brainMonitorConfig);

// Initialize brain monitor console capture with enhanced filtering and singleton protection
try {
  if (!window.__brainMonitorInstance) {
    const instance = initBrowserConsoleCapture(brainMonitorConfig);
    window.__brainMonitorInstance = instance;
    
    // Store debug function globally
    window.__debugBrainMonitor = () => {
      return {
        config: brainMonitorConfig,
        initialized: window.__brainMonitorInitialized,
        activeTimers: performance.getEntriesByType('measure').length,
        instance: window.__brainMonitorInstance,
        environment: isDevelopment ? 'development' : 'production'
      };
    };
    
    console.log("Brain monitor console capture initialized successfully", {
      flushInterval: brainMonitorConfig.flushInterval,
      maxBufferSize: brainMonitorConfig.maxBufferSize,
      environment: isDevelopment ? 'development' : 'production'
    });
    console.log("Use window.__debugBrainMonitor() in DevTools to inspect state");
    
    // Verify configuration after initialization
    setTimeout(() => {
      const debugInfo = window.__debugBrainMonitor?.();
      console.log("Brain monitor runtime verification:", debugInfo);
    }, 1000);
  } else {
    console.warn("Brain monitor already initialized, skipping duplicate initialization");
  }
  
} catch (error) {
  console.error("Failed to initialize brain monitor console capture:", error);
  window.__brainMonitorError = error;
}

// Create root logger instance
const logger: Logger = createLogger({ scope: "frontend" });

// Log startup
logger.info("Starting Claude Code UI frontend");

// Brain monitor console capture is now working - test logs removed

// Error boundary for root-level errors - DISABLED
window.addEventListener("error", (event: ErrorEvent) => {
  console.error("Uncaught error", event.error);
});

window.addEventListener(
  "unhandledrejection",
  (event: PromiseRejectionEvent) => {
    console.error("Unhandled promise rejection", event.reason);
  },
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Cannot start the application.");
}

// Logger Provider wrapper - StrictMode removed to prevent boot loop
const LoggerProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  try {
    return (
      <LoggerProvider scope="frontend" level="debug">
        {children}
      </LoggerProvider>
    );
  } catch (error) {
    console.error("Failed to initialize LoggerProvider:", error);
    // Fallback to app without logger context
    return <>{children}</>;
  }
};

ReactDOM.createRoot(rootElement).render(
  // StrictMode disabled to prevent boot loop issues
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error("Root error boundary caught error:", error, errorInfo);
    }}
  >
    <LoggerProviderWrapper>
      <App />
    </LoggerProviderWrapper>
  </ErrorBoundary>
);
