/**
 * Centralized Logger Utilities
 * 
 * This module provides consistent imports and helper functions for logging
 * across the application using @kit/logger.
 */

// Re-export core logger functions from @kit/logger/react
export { 
  useLogger, 
  useLoggerContext, 
  LoggerProvider 
} from '@kit/logger/react';

// Re-export browser logger for non-React utilities
export { createLogger } from '@kit/logger/browser';

// Standard scoping conventions as constants
export const SCOPING_CONVENTIONS = {
  // Component scopes: { component: 'ComponentName' }
  component: (name) => ({ component: name }),
  
  // Hook scopes: { hook: 'useHookName' }
  hook: (name) => ({ hook: name }),
  
  // Utility scopes: { scope: 'module-name' }
  scope: (name) => ({ scope: name }),
  
  // Service scopes: { service: 'serviceName' }
  service: (name) => ({ service: name })
};

// Helper functions for common logging patterns

/**
 * Create a logger for API operations with consistent context
 * @param {string} apiName - Name of the API being called
 * @returns {object} Logger instance with API context
 */
export function createApiLogger(apiName) {
  const { createLogger } = require('@kit/logger/browser');
  return createLogger({ scope: `api-${apiName}` });
}

/**
 * Create a logger for performance monitoring
 * @param {string} operation - Name of the operation being monitored
 * @returns {object} Logger instance with performance context
 */
export function createPerformanceLogger(operation) {
  const { createLogger } = require('@kit/logger/browser');
  return createLogger({ scope: `perf-${operation}` });
}

/**
 * Create a logger for error boundaries with enhanced context
 * @param {string} context - Context where error occurred
 * @returns {object} Logger instance with error context
 */
export function createErrorLogger(context) {
  const { createLogger } = require('@kit/logger/browser');
  return createLogger({ scope: `error-${context}` });
}

// Metadata helpers for consistent structured logging

/**
 * Safely log error objects with proper serialization
 * @param {Error} error - Error object to sanitize
 * @returns {object} Sanitized error metadata
 */
export function sanitizeError(error) {
  if (!error) return null;
  
  const sanitized = {
    message: error.message || error.toString() || 'Unknown error',
    name: error.name || 'Error',
    stack: error.stack,
    timestamp: Date.now()
  };
  
  // Safely add optional properties
  if (error.code !== undefined) {
    sanitized.code = error.code;
  }
  
  if (error.cause !== undefined) {
    // Recursively sanitize the cause if it's an Error object
    if (error.cause instanceof Error) {
      sanitized.cause = sanitizeError(error.cause);
    } else {
      sanitized.cause = String(error.cause);
    }
  }
  
  return sanitized;
}

/**
 * Truncate large data objects for logging to prevent memory issues
 * @param {any} data - Data to potentially truncate
 * @param {number} maxLength - Maximum string length (default: 1000)
 * @returns {any} Truncated data or original if small enough
 */
export function truncateData(data, maxLength = 1000) {
  if (!data) return data;
  
  try {
    // Handle circular references by using a replacer function
    const stringified = JSON.stringify(data, function(key, value) {
      // Skip emotion-related properties that cause circular references
      if (key === '__emotion_real' || key === '__emotion_base' || key === '__emotion_styles') {
        return '[Emotion Component]';
      }
      
      // Skip React-related circular references
      if (key === '_owner' || key === '_store' || key === 'stateNode') {
        return '[React Reference]';
      }
      
      // Skip function references
      if (typeof value === 'function') {
        return '[Function]';
      }
      
      // Skip DOM nodes
      if (value && typeof value === 'object' && value.nodeType) {
        return '[DOM Node]';
      }
      
      return value;
    });
    
    if (stringified.length <= maxLength) {
      return data;
    }
    
    return {
      _truncated: true,
      _originalLength: stringified.length,
      _preview: stringified.substring(0, maxLength) + '...',
      _dataType: typeof data,
      _size: stringified.length
    };
  } catch (error) {
    // If JSON.stringify still fails, return a safe representation
    return {
      _error: 'Unable to serialize data',
      _errorMessage: error.message,
      _dataType: typeof data,
      _toString: data?.toString?.() || '[Object]'
    };
  }
}

/**
 * Add timestamp information to metadata
 * @param {object} metadata - Existing metadata object
 * @returns {object} Metadata with timestamp information
 */
export function addTimestamp(metadata = {}) {
  return {
    ...metadata,
    timestamp: Date.now(),
    isoTimestamp: new Date().toISOString()
  };
}

/**
 * Add performance timing information to metadata
 * @param {number} startTime - Start time from Date.now() or performance.now()
 * @param {object} metadata - Existing metadata object
 * @returns {object} Metadata with timing information
 */
export function addTiming(startTime, metadata = {}) {
  const duration = Date.now() - startTime;
  return {
    ...metadata,
    duration,
    startTime,
    endTime: Date.now()
  };
}

/**
 * Add user context information to metadata
 * @param {object} userContext - User context object
 * @param {object} metadata - Existing metadata object
 * @returns {object} Metadata with user context
 */
export function addUserContext(userContext, metadata = {}) {
  return {
    ...metadata,
    user: {
      id: userContext?.id,
      email: userContext?.email,
      role: userContext?.role,
      // Never log sensitive user data
      _sanitized: true
    }
  };
}

/**
 * Add request context information to metadata
 * @param {object} requestContext - Request context object
 * @param {object} metadata - Existing metadata object
 * @returns {object} Metadata with request context
 */
export function addRequestContext(requestContext, metadata = {}) {
  return {
    ...metadata,
    request: {
      id: requestContext?.id,
      method: requestContext?.method,
      url: requestContext?.url,
      userAgent: requestContext?.userAgent,
      ip: requestContext?.ip,
      // Never log sensitive request data like headers with tokens
      _sanitized: true
    }
  };
}

/**
 * Add session context information to metadata
 * @param {object} sessionContext - Session context object
 * @param {object} metadata - Existing metadata object
 * @returns {object} Metadata with session context
 */
export function addSessionContext(sessionContext, metadata = {}) {
  return {
    ...metadata,
    session: {
      id: sessionContext?.id,
      projectName: sessionContext?.projectName,
      duration: sessionContext?.duration,
      messageCount: sessionContext?.messageCount,
      // Never log sensitive session data
      _sanitized: true
    }
  };
}

/**
 * Create a child logger with additional context
 * @param {object} parentLogger - Parent logger instance
 * @param {object} context - Additional context to add
 * @returns {object} Child logger with enhanced context
 */
export function createChildLogger(parentLogger, context) {
  if (typeof parentLogger.child === 'function') {
    return parentLogger.child(context);
  }
  
  // Fallback for loggers without child method
  return parentLogger;
}

/**
 * Check if a log level is enabled to optimize performance
 * @param {object} logger - Logger instance
 * @param {string} level - Log level to check
 * @returns {boolean} True if level is enabled
 */
export function isLevelEnabled(logger, level) {
  if (!logger) {
    return false;
  }
  
  if (typeof logger.isLevelEnabled === 'function') {
    try {
      return logger.isLevelEnabled(level);
    } catch (error) {
      // If there's an error (like invalid hook call), fallback to true
      console.warn('Logger level check failed:', error.message);
      return true;
    }
  }
  
  // Fallback - assume enabled if method not available
  return true;
}

/**
 * Create a safe logger that won't break if hooks are called incorrectly
 * @param {object} context - Logger context
 * @returns {object} Safe logger instance
 */
export function createSafeLogger(context) {
  try {
    // Try to use browser logger first (safe for any context)
    const { createLogger } = require('@kit/logger/browser');
    return createLogger(context);
  } catch (error) {
    // Fallback to console logging if all else fails
    return {
      error: (...args) => console.error(...args),
      warn: (...args) => console.warn(...args),
      info: (...args) => console.info(...args),
      debug: (...args) => console.debug(...args),
      trace: (...args) => console.trace(...args),
      isLevelEnabled: () => true
    };
  }
}

// Export default patterns for common use cases
export const DEFAULT_PATTERNS = {
  // API operation logging
  apiStart: (operation, params) => ({
    operation,
    params: truncateData(params),
    ...addTimestamp()
  }),
  
  apiSuccess: (operation, result, startTime) => ({
    operation,
    success: true,
    result: truncateData(result),
    ...addTiming(startTime)
  }),
  
  apiError: (operation, error, startTime) => ({
    operation,
    success: false,
    error: sanitizeError(error),
    ...addTiming(startTime)
  }),
  
  // User action logging
  userAction: (action, context) => ({
    action,
    context: truncateData(context),
    ...addTimestamp()
  }),
  
  // Performance monitoring
  performanceStart: (operation) => ({
    operation,
    phase: 'start',
    ...addTimestamp()
  }),
  
  performanceEnd: (operation, metrics, startTime) => ({
    operation,
    phase: 'end',
    metrics,
    ...addTiming(startTime)
  }),
  
  // Error reporting
  errorOccurred: (error, context) => ({
    error: sanitizeError(error),
    context: truncateData(context),
    ...addTimestamp()
  })
};