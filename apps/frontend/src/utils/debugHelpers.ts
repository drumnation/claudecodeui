/**
 * Debug Helper Utilities for Runtime Inspection
 * 
 * This module provides runtime debugging tools for brain-monitor and session management.
 * All functions are exposed globally for browser console access.
 */

import { createLogger } from "@kit/logger/browser";
import type { Logger } from "@kit/logger/types";

const logger: Logger = createLogger({ scope: "DebugHelpers" });

// Global debug state tracking
let debugState = {
  initialized: false,
  startTime: Date.now(),
  functionsExposed: [] as string[]
};

/**
 * Brain Monitor Debugging Functions
 */
export const brainMonitorDebug = {
  /**
   * Check brain-monitor instance count and configuration
   */
  checkInstance: () => {
    const bmInstance = (window as any).__debugBrainMonitor?.();
    const bmInitialized = (window as any).__brainMonitorInitialized;
    const bmError = (window as any).__brainMonitorError;
    
    const result = {
      initialized: bmInitialized,
      hasInstance: !!bmInstance,
      hasError: !!bmError,
      config: bmInstance?.config,
      environment: bmInstance?.environment,
      error: bmError,
      activeTimers: bmInstance?.activeTimers || 0,
      recommendations: [] as string[]
    };
    
    // Add recommendations based on findings
    if (!bmInitialized) {
      result.recommendations.push("Brain monitor not initialized - check main.tsx");
    }
    if (bmError) {
      result.recommendations.push("Brain monitor initialization error - check console");
    }
    if (bmInstance?.config?.flushInterval !== 10000 && bmInstance?.environment === 'development') {
      result.recommendations.push("Unexpected flush interval in development");
    }
    
    return result;
  },

  /**
   * Monitor brain-monitor request frequency
   */
  monitorRequests: (duration = 30000) => {
    const startTime = Date.now();
    const requests: Array<{ timestamp: number, interval: number }> = [];
    
    // Store original fetch to intercept brain-monitor requests
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url] = args;
      if (typeof url === 'string' && url.includes('brain-monitor')) {
        const now = Date.now();
        const interval = requests.length > 0 ? now - requests[requests.length - 1].timestamp : 0;
        requests.push({ timestamp: now, interval });
        
        logger.info('Brain-monitor request intercepted', {
          url,
          interval,
          totalRequests: requests.length,
          duration: now - startTime
        });
      }
      
      return originalFetch.apply(window, args);
    };
    
    // Restore original fetch after duration
    setTimeout(() => {
      window.fetch = originalFetch;
      
      const analysis = {
        duration,
        totalRequests: requests.length,
        averageInterval: requests.length > 1 
          ? requests.reduce((sum, r) => sum + r.interval, 0) / (requests.length - 1)
          : 0,
        minInterval: Math.min(...requests.map(r => r.interval).slice(1)),
        maxInterval: Math.max(...requests.map(r => r.interval).slice(1)),
        requests: requests.slice(-10), // Last 10 requests
        issues: [] as string[]
      };
      
      if (analysis.averageInterval < 5000) {
        analysis.issues.push(`Average interval ${analysis.averageInterval.toFixed(0)}ms is faster than expected 5s`);
      }
      if (analysis.minInterval < 1000) {
        analysis.issues.push(`Minimum interval ${analysis.minInterval}ms indicates rapid polling`);
      }
      
      console.log('Brain-monitor request analysis:', analysis);
      return analysis;
    }, duration);
    
    return `Monitoring brain-monitor requests for ${duration}ms...`;
  }
};

/**
 * Session Management Debugging Functions
 */
export const sessionDebug = {
  /**
   * Track session loading behavior
   */
  trackSessionLoads: () => {
    const sessionLoads: Array<{
      timestamp: number,
      sessionId: string,
      projectName: string,
      messageCount?: number
    }> = [];
    
    // Store session load tracking in global scope
    (window as any).__sessionLoadTracker = sessionLoads;
    
    // Intercept WebSocket messages to track session history
    const originalWS = window.WebSocket;
    
    window.WebSocket = class extends originalWS {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        
        this.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'session_history' && data.messages) {
              sessionLoads.push({
                timestamp: Date.now(),
                sessionId: data.sessionId || 'unknown',
                projectName: data.projectName || 'unknown',
                messageCount: data.messages.length
              });
              
              logger.info('Session history tracked', {
                sessionId: data.sessionId,
                messageCount: data.messages.length,
                totalLoads: sessionLoads.length
              });
            }
          } catch (e) {
            // Ignore parsing errors
          }
        });
      }
    };
    
    return `Session load tracking enabled. Check window.__sessionLoadTracker for data.`;
  },

  /**
   * Analyze session loading patterns
   */
  analyzeSessionLoads: () => {
    const sessionLoads = (window as any).__sessionLoadTracker || [];
    
    if (sessionLoads.length === 0) {
      return "No session loads tracked. Run sessionDebug.trackSessionLoads() first.";
    }
    
    const analysis = {
      totalLoads: sessionLoads.length,
      uniqueSessions: new Set(sessionLoads.map((l: any) => l.sessionId)).size,
      duplicateLoads: sessionLoads.length - new Set(sessionLoads.map((l: any) => l.sessionId)).size,
      timeSpan: sessionLoads.length > 1 
        ? sessionLoads[sessionLoads.length - 1].timestamp - sessionLoads[0].timestamp
        : 0,
      averageInterval: sessionLoads.length > 1
        ? (sessionLoads[sessionLoads.length - 1].timestamp - sessionLoads[0].timestamp) / (sessionLoads.length - 1)
        : 0,
      recentLoads: sessionLoads.slice(-5),
      issues: [] as string[]
    };
    
    if (analysis.duplicateLoads > 0) {
      analysis.issues.push(`${analysis.duplicateLoads} duplicate session loads detected`);
    }
    if (analysis.averageInterval < 5000 && analysis.totalLoads > 2) {
      analysis.issues.push(`Average load interval ${analysis.averageInterval.toFixed(0)}ms is too frequent`);
    }
    
    return analysis;
  }
};

/**
 * WebSocket Connection Debugging Functions
 */
export const webSocketDebug = {
  /**
   * Get WebSocket connection diagnostics
   */
  getConnectionInfo: () => {
    const wsDebug = (window as any).__debugWebSocket?.();
    
    if (!wsDebug) {
      return "WebSocket debug info not available. Ensure WebSocket is initialized.";
    }
    
    return {
      current: wsDebug.currentConnection,
      tracker: {
        totalConnections: wsDebug.connectionTracker.totalConnections,
        activeConnections: wsDebug.connectionTracker.activeConnections?.size || 0,
        recentHistory: wsDebug.connectionTracker.connectionHistory?.slice(-5) || []
      },
      messages: {
        total: wsDebug.totalMessages,
        recent: wsDebug.recentMessages
      },
      healthCheck: {
        isConnected: wsDebug.currentConnection?.isConnected,
        readyState: wsDebug.currentConnection?.readyState,
        hasExcessiveReconnects: wsDebug.currentConnection?.reconnectAttempts > 3,
        messageBalance: {
          sent: wsDebug.currentConnection?.messagesSent,
          received: wsDebug.currentConnection?.messagesReceived,
          ratio: wsDebug.currentConnection?.messagesSent > 0 
            ? (wsDebug.currentConnection?.messagesReceived / wsDebug.currentConnection?.messagesSent).toFixed(2)
            : 'N/A'
        }
      }
    };
  },

  /**
   * Check for multiple concurrent connections
   */
  checkConcurrentConnections: () => {
    const wsDebug = (window as any).__debugWebSocket?.();
    
    if (!wsDebug) {
      return "WebSocket debug info not available.";
    }
    
    const activeConnections = wsDebug.connectionTracker.activeConnections?.size || 0;
    const recentConnections = wsDebug.connectionTracker.connectionHistory
      ?.filter((conn: any) => !conn.disconnectTime || (Date.now() - conn.connectTime) < 30000) || [];
    
    return {
      activeConnections,
      recentConnections: recentConnections.length,
      totalConnections: wsDebug.connectionTracker.totalConnections,
      warning: activeConnections > 1 ? 'Multiple active connections detected!' : null,
      connectionDetails: recentConnections.slice(-3)
    };
  }
};

/**
 * Performance Monitoring Functions
 */
export const performanceDebug = {
  /**
   * Analyze request frequencies and timing
   */
  analyzeRequestTiming: () => {
    const now = Date.now();
    const performanceEntries = performance.getEntriesByType('navigation');
    const resourceEntries = performance.getEntriesByType('resource')
      .filter((entry: any) => entry.name.includes('brain-monitor') || entry.name.includes('/api/'))
      .slice(-10);
    
    return {
      navigation: performanceEntries[0] || null,
      recentAPIRequests: resourceEntries.map((entry: any) => ({
        name: entry.name,
        duration: entry.duration,
        startTime: entry.startTime,
        timestamp: new Date(now - (performance.now() - entry.startTime)).toISOString()
      })),
      memoryUsage: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : 'Not available',
      timing: {
        domContentLoaded: performanceEntries[0]?.domContentLoadedEventEnd || 0,
        loadComplete: performanceEntries[0]?.loadEventEnd || 0
      }
    };
  },

  /**
   * Start performance monitoring
   */
  startMonitoring: (duration = 60000) => {
    const startTime = performance.now();
    const metrics: Array<{
      timestamp: number,
      memory?: any,
      requestCount: number
    }> = [];
    
    const interval = setInterval(() => {
      const resourceCount = performance.getEntriesByType('resource').length;
      const memoryInfo = (performance as any).memory;
      
      metrics.push({
        timestamp: performance.now(),
        memory: memoryInfo ? {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize
        } : undefined,
        requestCount: resourceCount
      });
    }, 5000);
    
    setTimeout(() => {
      clearInterval(interval);
      
      const analysis = {
        duration: performance.now() - startTime,
        samples: metrics.length,
        memoryTrend: metrics.filter(m => m.memory).map(m => m.memory?.used),
        requestGrowth: metrics[metrics.length - 1]?.requestCount - metrics[0]?.requestCount,
        averageMemoryUsage: metrics.filter(m => m.memory).reduce((sum, m) => sum + (m.memory?.used || 0), 0) / metrics.filter(m => m.memory).length
      };
      
      console.log('Performance monitoring complete:', analysis);
      return analysis;
    }, duration);
    
    return `Performance monitoring started for ${duration}ms...`;
  }
};

/**
 * Initialize all debug helpers and expose them globally
 */
export const initializeDebugHelpers = () => {
  if (debugState.initialized) {
    logger.warn('Debug helpers already initialized');
    return;
  }
  
  // Expose all debug functions globally
  const globalDebug = {
    brainMonitor: brainMonitorDebug,
    session: sessionDebug,
    webSocket: webSocketDebug,
    performance: performanceDebug,
    
    // Convenience functions
    checkAll: () => ({
      brainMonitor: brainMonitorDebug.checkInstance(),
      webSocket: webSocketDebug.getConnectionInfo(),
      performance: performanceDebug.analyzeRequestTiming()
    }),
    
    // Help function
    help: () => {
      console.log(`
🔧 Debug Helpers Available:

Brain Monitor:
  debug.brainMonitor.checkInstance()     - Check brain-monitor setup
  debug.brainMonitor.monitorRequests()   - Monitor request frequency

Session Management:
  debug.session.trackSessionLoads()      - Start tracking session loads
  debug.session.analyzeSessionLoads()    - Analyze loading patterns

WebSocket:
  debug.webSocket.getConnectionInfo()    - Get connection diagnostics
  debug.webSocket.checkConcurrentConnections() - Check for multiple connections

Performance:
  debug.performance.analyzeRequestTiming() - Analyze request performance
  debug.performance.startMonitoring()      - Start performance monitoring

General:
  debug.checkAll()                       - Run all basic checks
  debug.help()                          - Show this help

Use these functions in the browser console to debug 2ms polling and session reload issues.
      `);
    }
  };
  
  // Make globally available
  (window as any).debug = globalDebug;
  
  debugState = {
    initialized: true,
    startTime: Date.now(),
    functionsExposed: Object.keys(globalDebug)
  };
  
  logger.info('Debug helpers initialized and exposed globally', {
    functions: debugState.functionsExposed,
    usage: 'Type debug.help() in console for available functions'
  });
  
  // Auto-run basic diagnostics
  setTimeout(() => {
    console.log('🔧 Debug helpers ready! Basic diagnostics:');
    console.log(globalDebug.checkAll());
    console.log('💡 Type debug.help() for all available functions');
  }, 1000);
  
  return debugState;
};

// Auto-initialize in development
if (import.meta.env.DEV) {
  // Wait for page load to ensure all other initialization is complete
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeDebugHelpers, 2000);
    });
  } else {
    setTimeout(initializeDebugHelpers, 2000);
  }
}

export default {
  brainMonitorDebug,
  sessionDebug,
  webSocketDebug,
  performanceDebug,
  initializeDebugHelpers
};