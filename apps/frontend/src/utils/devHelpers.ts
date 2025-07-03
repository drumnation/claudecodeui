/**
 * Development helpers for debugging and performance monitoring
 */

import { 
  logPerformanceSummary, 
  clearPerformanceStats, 
  enableGlobalAutoTracking,
  configureAutoTracking
} from '@kit/logger';

// Enable trace-level logging in development
export function enablePerformanceLogging() {
  // Set log level to trace to see render tracking
  if (typeof window !== 'undefined') {
    localStorage.setItem('vite_log_level', 'trace');
    console.log('🔍 Performance logging enabled! Set VITE_LOG_LEVEL=trace to persist across reloads.');
    console.log('Use devHelpers.showPerformanceStats() to see render performance summary.');
  }
}

// Enable automatic render tracking for all components
export function enableAutoTracking() {
  enableGlobalAutoTracking();
  console.log('🎯 Auto-tracking enabled! All components will be monitored automatically.');
}

// Configure what gets tracked
export function configureTracking(config: {
  include?: string[];
  exclude?: string[];
  threshold?: number;
}) {
  configureAutoTracking({
    enabled: true,
    include: config.include,
    exclude: config.exclude,
    defaultThreshold: config.threshold
  });
  console.log('⚙️ Tracking configured:', config);
}

// Show performance summary in console
export function showPerformanceStats() {
  logPerformanceSummary();
}

// Clear performance stats
export function clearStats() {
  clearPerformanceStats();
  console.log('📊 Performance stats cleared');
}

// Enable everything for debugging render issues
export function debugRenders() {
  enablePerformanceLogging();
  enableAutoTracking();
  console.log('🐛 Render debugging enabled! Check trace logs for detailed information.');
}

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).devHelpers = {
    enablePerformanceLogging,
    enableAutoTracking,
    configureTracking,
    showPerformanceStats,
    clearStats,
    debugRenders
  };
  
  console.log('🛠️ Development helpers available:');
  console.log('  devHelpers.enablePerformanceLogging() - Enable trace-level render tracking');
  console.log('  devHelpers.enableAutoTracking() - Auto-track ALL components');
  console.log('  devHelpers.configureTracking({include, exclude, threshold}) - Configure tracking');
  console.log('  devHelpers.showPerformanceStats() - Show render performance summary');
  console.log('  devHelpers.clearStats() - Clear performance statistics');
  console.log('  devHelpers.debugRenders() - Enable everything for debugging');
}

export const devHelpers = {
  enablePerformanceLogging,
  enableAutoTracking,
  configureTracking,
  showPerformanceStats,
  clearStats,
  debugRenders
};