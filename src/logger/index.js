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
  
  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
    code: error.code,
    cause: error.cause,
    timestamp: Date.now()
  };
}

/**
 * Truncate large data objects for logging to prevent memory issues
 * @param {any} data - Data to potentially truncate
 * @param {number} maxLength - Maximum string length (default: 1000)
 * @returns {any} Truncated data or original if small enough
 */
export function truncateData(data, maxLength = 1000) {
  if (!data) return data;
  
  const stringified = JSON.stringify(data);
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
  if (typeof logger.isLevelEnabled === 'function') {
    return logger.isLevelEnabled(level);
  }
  
  // Fallback - assume enabled if method not available
  return true;
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