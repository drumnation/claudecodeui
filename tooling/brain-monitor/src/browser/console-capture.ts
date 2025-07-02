/* eslint-disable no-console */
/**
 * Browser Console Capture Utility
 *
 * This module provides a mechanism to capture all console logs in the browser
 * and send them to a backend endpoint for centralized logging. It's designed
 * to be injected into any React/Vue/Angular application with minimal setup.
 */

interface LogEntry {
  level: string;
  timestamp: string;
  message: string;
  source: string;
  url: string;
  userAgent: string;
  stack?: string;
}

type ConsoleMethod = "log" | "warn" | "error" | "info" | "debug";

interface ConsoleCapturConfig {
  endpoint?: string;
  maxBufferSize?: number;
  flushInterval?: number;
  includeStack?: boolean;
}

class BrowserConsoleCapture {
  private originalMethods: Record<ConsoleMethod, (...args: any[]) => void>;
  private capturedLogs: LogEntry[];
  private maxBufferSize: number;
  private isCapturing: boolean;
  private endpoint: string;
  private flushInterval: number;
  private flushTimer?: NodeJS.Timeout;
  private includeStack: boolean;

  constructor(config: ConsoleCapturConfig = {}) {
    this.originalMethods = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    this.capturedLogs = [];
    this.maxBufferSize = config.maxBufferSize || 1000;
    this.isCapturing = false;
    this.endpoint = config.endpoint || "/_brain-monitor/browser-logs";
    this.flushInterval = config.flushInterval || 5000; // 5 seconds
    this.includeStack = config.includeStack ?? true;
  }

  start(): void {
    if (this.isCapturing) {
      this.originalMethods.warn(
        "Brain-monitor console capture already started",
      );
      return;
    }

    this.isCapturing = true;

    // Override console methods
    (Object.keys(this.originalMethods) as ConsoleMethod[]).forEach((method) => {
      console[method] = (...args: any[]) => {
        // Call original method
        this.originalMethods[method].apply(console, args);

        // Capture the log
        this.capture(method, args);
      };
    });

    // Start flush timer
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, this.flushInterval);

    // Flush on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        void this.flush();
      });
    }

    this.originalMethods.info("[Brain-Monitor] Console capture started");
  }

  stop(): void {
    if (!this.isCapturing) {
      return;
    }

    // Restore original console methods
    (Object.keys(this.originalMethods) as ConsoleMethod[]).forEach((method) => {
      console[method] = this.originalMethods[method];
    });

    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    // Final flush
    void this.flush();

    this.isCapturing = false;
    this.originalMethods.info("[Brain-Monitor] Console capture stopped");
  }

  private capture(level: string, args: any[]): void {
    try {
      const logEntry: LogEntry = {
        level,
        timestamp: new Date().toISOString(),
        message: this.formatArgs(args),
        source: "browser",
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Add stack trace for errors
      if (this.includeStack && (level === "error" || level === "warn")) {
        const error = new Error();
        logEntry.stack = error.stack;
      }

      // Add to buffer
      this.capturedLogs.push(logEntry);

      // Trim buffer if too large
      if (this.capturedLogs.length > this.maxBufferSize) {
        this.capturedLogs.shift();
      }

      // Flush if buffer is getting full
      if (this.capturedLogs.length >= this.maxBufferSize * 0.8) {
        this.flush();
      }
    } catch (error) {
      // Use original method to avoid infinite loop
      this.originalMethods.error(
        "[Brain-Monitor] Failed to capture console log:",
        error,
      );
    }
  }

  private formatArgs(args: any[]): string {
    return args
      .map((arg) => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}\n${arg.stack}`;
        }
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");
  }

  private async flush(): Promise<void> {
    if (this.capturedLogs.length === 0) {
      return;
    }

    const logsToSend = [...this.capturedLogs];
    this.capturedLogs = [];

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logs: logsToSend,
          sessionInfo: {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
        }),
      });
    } catch (error) {
      // Re-add logs to buffer if send failed
      this.capturedLogs.unshift(...logsToSend);
      this.originalMethods.error("[Brain-Monitor] Failed to send logs:", error);
    }
  }

  getBufferedLogs(): LogEntry[] {
    return [...this.capturedLogs];
  }

  clearBuffer(): void {
    this.capturedLogs = [];
  }
}

// Singleton instance
let instance: BrowserConsoleCapture | null = null;

/**
 * Initialize browser console capture
 * Should be called as early as possible in your application
 */
export function initBrowserConsoleCapture(
  config?: ConsoleCapturConfig,
): BrowserConsoleCapture {
  if (!instance) {
    instance = new BrowserConsoleCapture(config);
    instance.start();
  }
  return instance;
}

/**
 * Get the console capture instance
 */
export function getConsoleCapture(): BrowserConsoleCapture | null {
  return instance;
}

/**
 * Auto-initialize if this script is loaded directly
 */
if (typeof window !== "undefined" && typeof document !== "undefined") {
  // Check if we should auto-init based on a meta tag or global config
  const autoInit = (window as any).__BRAIN_MONITOR_AUTO_INIT__ !== false;

  if (autoInit) {
    // Wait for DOM ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initBrowserConsoleCapture();
      });
    } else {
      initBrowserConsoleCapture();
    }
  }
}

export type { LogEntry, ConsoleCapturConfig };
