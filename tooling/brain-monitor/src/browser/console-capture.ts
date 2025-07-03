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
      const message = this.formatArgs(args);
      
      // Enhanced filtering to prevent infinite loops
      if (
        // Skip brain monitor's own logs
        message.includes("[Brain-Monitor]") || 
        message.includes("brain-monitor") ||
        message.includes("Brain monitor console capture") ||
        
        // Skip only brain monitor's own pino logs that could cause loops
        args.some(arg => 
          typeof arg === 'object' && 
          arg !== null && 
          (arg.scope === 'brain-monitor' || 
           (arg.msg && typeof arg.msg === 'string' && arg.msg.includes('brain-monitor')))
        ) ||
        
        // Skip service worker logs
        message.includes("SW:") ||
        message.includes("Service Worker") ||
        
        // Skip React DevTools and development noise
        message.includes("ReactRefresh") ||
        message.includes("HMR") ||
        message.includes("Fast Refresh") ||
        
        // Skip Vite development logs
        message.includes("[vite]") ||
        message.includes("hmr update")
      ) {
        return;
      }

      const logEntry: LogEntry = {
        level,
        timestamp: new Date().toISOString(),
        message,
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
            // Compact JSON formatting for better token efficiency
            return JSON.stringify(arg, null, 0);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ")
      // Remove color codes and console formatting at source
      .replace(/color:\s*#[A-Fa-f0-9]{6}\s*/g, '')
      .replace(/color:\s*#[A-Fa-f0-9]{3}\s*/g, '')
      .replace(/%c/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isFlushInProgress = false;
  private lastFlushTime = 0;
  private readonly MIN_FLUSH_INTERVAL = 1000; // 1 second minimum between flushes
  private flushQueue: LogEntry[][] = [];

  private async flush(): Promise<void> {
    if (this.capturedLogs.length === 0) {
      return;
    }

    const now = Date.now();
    
    // Rate limiting: prevent excessive flush frequency
    if (now - this.lastFlushTime < this.MIN_FLUSH_INTERVAL) {
      // Queue this flush request for later
      if (this.flushQueue.length === 0) {
        setTimeout(() => {
          void this.processFlushQueue();
        }, this.MIN_FLUSH_INTERVAL - (now - this.lastFlushTime));
      }
      this.flushQueue.push([...this.capturedLogs]);
      this.capturedLogs = [];
      return;
    }

    // Prevent concurrent flush operations
    if (this.isFlushInProgress) {
      this.flushQueue.push([...this.capturedLogs]);
      this.capturedLogs = [];
      return;
    }

    this.isFlushInProgress = true;
    this.lastFlushTime = now;

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
      // Re-add logs to buffer if send failed, but implement exponential backoff
      this.capturedLogs.unshift(...logsToSend);
      this.originalMethods.error("[Brain-Monitor] Failed to send logs:", error);
      
      // Exponential backoff: delay next flush attempt
      const backoffDelay = Math.min(5000, 1000 * Math.pow(2, this.flushQueue.length));
      setTimeout(() => {
        this.isFlushInProgress = false;
        void this.processFlushQueue();
      }, backoffDelay);
      return;
    } finally {
      this.isFlushInProgress = false;
    }

    // Process any queued flush requests
    void this.processFlushQueue();
  }

  private async processFlushQueue(): Promise<void> {
    if (this.flushQueue.length === 0 || this.isFlushInProgress) {
      return;
    }

    // Merge all queued logs and flush once
    const allQueuedLogs = this.flushQueue.flat();
    this.flushQueue = [];
    
    if (allQueuedLogs.length > 0) {
      this.capturedLogs.unshift(...allQueuedLogs);
      await this.flush();
    }
  }

  getBufferedLogs(): LogEntry[] {
    return [...this.capturedLogs];
  }

  clearBuffer(): void {
    this.capturedLogs = [];
  }
}

// Singleton instance with stronger protection
let instance: BrowserConsoleCapture | null = null;
let instanceId: string | null = null;

/**
 * Initialize browser console capture
 * Should be called as early as possible in your application
 */
export function initBrowserConsoleCapture(
  config?: ConsoleCapturConfig,
): BrowserConsoleCapture {
  const currentInstanceId = `instance-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  if (!instance) {
    console.log(`[Brain-Monitor] Creating new instance: ${currentInstanceId}`);
    instanceId = currentInstanceId;
    instance = new BrowserConsoleCapture(config);
    instance.start();
  } else {
    console.warn(`[Brain-Monitor] Instance already exists (${instanceId}), rejecting duplicate initialization attempt: ${currentInstanceId}`);
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
 * DISABLED: Manual initialization only to prevent conflicts
 */
// Auto-initialization disabled to prevent conflicts with manual initialization

export type { LogEntry, ConsoleCapturConfig };
