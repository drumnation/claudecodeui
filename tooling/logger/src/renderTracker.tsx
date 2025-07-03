/**
 * React Render Performance Tracker
 * 
 * A custom implementation similar to why-did-you-render but using our logger.
 * Automatically tracks component renders, prop changes, and re-render reasons.
 */

import React from 'react';
import { createLogger } from './browser.js';
import type { Logger } from './types.js';

// Custom log level for performance tracking
const PERF_LOG_LEVEL = 'trace' as const;

interface RenderTrackerOptions {
  /** Component name for logging */
  componentName: string;
  /** Track prop changes that cause re-renders */
  trackProps?: boolean;
  /** Track state changes that cause re-renders */
  trackState?: boolean;
  /** Track hook dependencies that cause re-renders */
  trackHooks?: boolean;
  /** Only log when render count exceeds threshold */
  renderThreshold?: number;
  /** Track render frequency over time */
  trackFrequency?: boolean;
}

interface PropChange {
  propName: string;
  oldValue: any;
  newValue: any;
  changed: boolean;
}

interface RenderStats {
  renderCount: number;
  lastRender: number;
  firstRender: number;
  averageRenderTime: number;
  renderFrequency: number; // renders per second
  propChanges: PropChange[];
}

const componentStats = new Map<string, RenderStats>();

/**
 * Deep comparison utility for detecting changes
 */
function deepCompare(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (typeof obj1 !== typeof obj2) return false;
  
  if (typeof obj1 !== 'object') return obj1 === obj2;
  
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepCompare(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Analyze prop changes to determine what caused a re-render
 */
function analyzePropChanges(prevProps: any, currentProps: any): PropChange[] {
  const changes: PropChange[] = [];
  
  if (!prevProps || !currentProps) return changes;
  
  const allKeys = new Set([...Object.keys(prevProps), ...Object.keys(currentProps)]);
  
  for (const key of allKeys) {
    const oldValue = prevProps[key];
    const newValue = currentProps[key];
    const changed = !deepCompare(oldValue, newValue);
    
    changes.push({
      propName: key,
      oldValue: oldValue,
      newValue: newValue,
      changed
    });
  }
  
  return changes;
}

/**
 * Format value for logging (truncate long objects/arrays)
 */
function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value.slice(0, 50)}${value.length > 50 ? '...' : ''}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`;
  }
  return String(value);
}

/**
 * Main render tracking hook
 */
export function useRenderTracker(options: RenderTrackerOptions) {
  const logger = React.useMemo(() => createLogger({ scope: 'RenderTracker' }), []);
  const { componentName, trackProps = true, renderThreshold = 5, trackFrequency = true } = options;
  
  const renderCountRef = React.useRef(0);
  const prevPropsRef = React.useRef<any>(null);
  const renderStartRef = React.useRef(0);
  
  React.useEffect(() => {
    renderCountRef.current += 1;
    const renderTime = Date.now();
    renderStartRef.current = renderTime;
    
    // Update or create component stats
    const stats = componentStats.get(componentName) || {
      renderCount: 0,
      lastRender: renderTime,
      firstRender: renderTime,
      averageRenderTime: 0,
      renderFrequency: 0,
      propChanges: []
    };
    
    stats.renderCount = renderCountRef.current;
    stats.lastRender = renderTime;
    
    // Calculate render frequency (renders per second over last 10 seconds)
    if (trackFrequency && stats.renderCount > 1) {
      const timeDiff = (renderTime - stats.firstRender) / 1000; // seconds
      stats.renderFrequency = timeDiff > 0 ? stats.renderCount / timeDiff : 0;
    }
    
    componentStats.set(componentName, stats);
    
    // Log performance warning if exceeding threshold
    if (renderCountRef.current >= renderThreshold) {
      logger.warn('🚨 High render frequency detected', {
        component: componentName,
        renderCount: renderCountRef.current,
        renderFrequency: stats.renderFrequency.toFixed(2) + ' renders/sec',
        timeSinceMount: ((renderTime - stats.firstRender) / 1000).toFixed(2) + 's'
      });
    }
    
    // Always log at trace level for detailed tracking
    logger.trace('🔄 Component render', {
      component: componentName,
      renderCount: renderCountRef.current,
      renderFrequency: stats.renderFrequency.toFixed(2) + ' renders/sec',
      timestamp: new Date(renderTime).toISOString()
    });
    
  });
  
  // Return tracking utilities
  return {
    renderCount: renderCountRef.current,
    logPropChanges: (currentProps: any) => {
      if (!trackProps) return;
      
      const changes = analyzePropChanges(prevPropsRef.current, currentProps);
      const significantChanges = changes.filter(change => change.changed);
      
      if (significantChanges.length > 0) {
        logger.trace('📝 Props changed causing re-render', {
          component: componentName,
          renderCount: renderCountRef.current,
          changedProps: significantChanges.map(change => ({
            prop: change.propName,
            oldValue: formatValue(change.oldValue),
            newValue: formatValue(change.newValue)
          }))
        });
      }
      
      prevPropsRef.current = currentProps;
    },
    
    logRenderReason: (reason: string, details?: any) => {
      logger.trace('🎯 Render reason', {
        component: componentName,
        renderCount: renderCountRef.current,
        reason,
        details
      });
    },
    
    getStats: () => componentStats.get(componentName),
    
    resetStats: () => {
      componentStats.delete(componentName);
      renderCountRef.current = 0;
    }
  };
}

/**
 * Configuration for automatic render tracking
 */
interface AutoTrackConfig {
  enabled: boolean;
  /** Components to include (if empty, tracks all) */
  include?: string[];
  /** Components to exclude */
  exclude?: string[];
  /** Default render threshold */
  defaultThreshold?: number;
  /** Track prop changes by default */
  trackProps?: boolean;
}

let autoTrackConfig: AutoTrackConfig = {
  enabled: false,
  exclude: ['Router', 'Route', 'Switch', 'BrowserRouter', 'Fragment'],
  defaultThreshold: 3,
  trackProps: true
};

/**
 * Configure automatic render tracking
 */
export function configureAutoTracking(config: Partial<AutoTrackConfig>) {
  autoTrackConfig = { ...autoTrackConfig, ...config };
}

/**
 * Check if component should be auto-tracked
 */
function shouldTrackComponent(componentName: string): boolean {
  if (!autoTrackConfig.enabled) return false;
  
  // Check exclusions
  if (autoTrackConfig.exclude?.some(pattern => 
    componentName.toLowerCase().includes(pattern.toLowerCase())
  )) {
    return false;
  }
  
  // Check inclusions (if specified)
  if (autoTrackConfig.include && autoTrackConfig.include.length > 0) {
    return autoTrackConfig.include.some(pattern => 
      componentName.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  return true;
}

/**
 * Automatic HOC for tracking component renders without manual code changes
 */
export function withAutoRenderTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
  
  // Skip if component shouldn't be tracked
  if (!shouldTrackComponent(componentName)) {
    return WrappedComponent;
  }
  
  const TrackedComponent = React.forwardRef<any, P>((props, ref) => {
    const tracker = useRenderTracker({ 
      componentName,
      trackProps: autoTrackConfig.trackProps,
      renderThreshold: autoTrackConfig.defaultThreshold
    });
    
    // Track prop changes
    React.useEffect(() => {
      tracker.logPropChanges(props);
    });
    
    return <WrappedComponent {...(props as P)} ref={ref} />;
  });
  
  TrackedComponent.displayName = `AutoTracked(${componentName})`;
  
  return TrackedComponent;
}

/**
 * Babel plugin or webpack loader utility to automatically wrap components
 * This would be implemented as a build-time transform
 */
export function enableGlobalAutoTracking() {
  if (typeof window === 'undefined') return;
  
  // Enable auto-tracking
  configureAutoTracking({ enabled: true });
  
  // Monkey-patch React.createElement to automatically wrap components
  const originalCreateElement = React.createElement;
  
  (React as any).createElement = function(type: any, props: any, ...children: any[]) {
    if (typeof type === 'function' && type.name && shouldTrackComponent(type.name)) {
      // Only wrap once
      if (!type.__autoTracked) {
        type = withAutoRenderTracking(type);
        type.__autoTracked = true;
      }
    }
    
    return originalCreateElement.call(this, type, props, ...children);
  };
  
  console.log('🔍 Global render tracking enabled! Components will be automatically monitored.');
}

/**
 * Get performance summary for all tracked components
 */
export function getPerformanceSummary() {
  const summary = Array.from(componentStats.entries()).map(([name, stats]) => ({
    component: name,
    renderCount: stats.renderCount,
    renderFrequency: stats.renderFrequency.toFixed(2) + ' renders/sec',
    totalTime: ((stats.lastRender - stats.firstRender) / 1000).toFixed(2) + 's'
  }));
  
  return summary.sort((a, b) => b.renderCount - a.renderCount);
}

/**
 * Log performance summary to console
 */
export function logPerformanceSummary() {
  const logger = createLogger({ scope: 'PerformanceSummary' });
  const summary = getPerformanceSummary();
  
  logger.info('📊 Render Performance Summary', {
    components: summary,
    totalComponents: summary.length,
    highestRenderCount: summary[0]?.renderCount || 0
  });
  
  console.table(summary);
}

/**
 * Clear all performance stats
 */
export function clearPerformanceStats() {
  componentStats.clear();
}