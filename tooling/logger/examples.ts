/**
 * @kit/logger Examples for React Frontend Components
 * 
 * This file demonstrates best practices for logging in React components
 * following the bulletproof architecture patterns implemented in the frontend.
 */

import { useLogger } from '@kit/logger/react';
import type { Logger } from '@kit/logger/types';

// ============================================================================
// BASIC COMPONENT LOGGING PATTERNS
// ============================================================================

/**
 * Example 1: Basic Button Component with User Interaction Logging
 * 
 * Demonstrates:
 * - Scope naming conventions
 * - Click event logging with metadata
 * - State-based logging
 * - Performance considerations
 */
export function ExampleButtonLogging() {
  const logger = useLogger({ scope: 'Button' });

  const handleClick = (variant: string, disabled: boolean) => {
    if (disabled) {
      logger.debug('Button click attempted while disabled', { variant });
      return;
    }

    logger.debug('Button clicked', {
      variant,
      disabled,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  };

  return { handleClick };
}

/**
 * Example 2: Input Component with Validation and User Behavior Logging
 * 
 * Demonstrates:
 * - Form interaction logging
 * - Validation error logging
 * - User behavior patterns
 * - Privacy-conscious logging (no sensitive data)
 */
export function ExampleInputLogging() {
  const logger = useLogger({ scope: 'Input' });

  const handleFocus = (type: string, label?: string) => {
    logger.debug('Input focused', { 
      type, 
      label: label || 'unlabeled',
      focusMethod: 'user-interaction'
    });
  };

  const handleValidationError = (error: string, type: string) => {
    logger.warn('Input validation error', { 
      error, 
      type, 
      errorCategory: 'validation',
      timestamp: Date.now()
    });
  };

  const handleValueChange = (valueLength: number, type: string) => {
    logger.debug('Input value changed', { 
      type, 
      valueLength, // Log length, not actual value for privacy
      isEmpty: valueLength === 0
    });
  };

  return { handleFocus, handleValidationError, handleValueChange };
}

// ============================================================================
// COMPLEX COMPONENT LOGGING PATTERNS
// ============================================================================

/**
 * Example 3: MicButton Component with Audio Recording Metrics
 * 
 * Demonstrates:
 * - Performance timing logging
 * - Error logging with context
 * - State transition logging
 * - WebAPI interaction logging
 */
export function ExampleMicButtonLogging() {
  const logger = useLogger({ scope: 'MicButton' });

  const logRecordingStart = (mimeType: string) => {
    logger.info('Recording started successfully', { 
      mimeType,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  };

  const logTranscriptionMetrics = (
    transcriptionTime: number, 
    textLength: number, 
    whisperMode: string
  ) => {
    logger.info('Transcription completed', {
      transcriptionTime: Math.round(transcriptionTime),
      textLength,
      wordsCount: Math.round(textLength / 5), // Approximate word count
      whisperMode,
      performanceCategory: transcriptionTime > 5000 ? 'slow' : 'fast'
    });
  };

  const logRecordingError = (error: Error, context: Record<string, any>) => {
    logger.error('Recording operation failed', {
      error: error.message,
      stack: error.stack,
      context,
      errorCategory: 'media-api',
      timestamp: Date.now()
    });
  };

  return { logRecordingStart, logTranscriptionMetrics, logRecordingError };
}

/**
 * Example 4: FileTree Component with File System Interactions
 * 
 * Demonstrates:
 * - API call logging
 * - File system operation logging
 * - User navigation tracking
 * - Error context preservation
 */
export function ExampleFileTreeLogging() {
  const logger = useLogger({ scope: 'FileTree' });

  const logFilesFetch = (
    projectName: string, 
    fileCount: number, 
    success: boolean,
    responseTime?: number
  ) => {
    if (success) {
      logger.info('Files fetched successfully', {
        projectName,
        fileCount,
        responseTime,
        performanceCategory: responseTime && responseTime > 1000 ? 'slow' : 'fast'
      });
    } else {
      logger.warn('File fetch failed', {
        projectName,
        responseTime,
        failureCategory: 'api-error'
      });
    }
  };

  const logDirectoryToggle = (path: string, isExpanding: boolean) => {
    logger.debug('Directory toggled', {
      path,
      isExpanding,
      action: isExpanding ? 'expand' : 'collapse',
      userInteraction: true
    });
  };

  const logFileSelection = (fileName: string, fileType: 'code' | 'image') => {
    logger.debug('File selected for viewing', {
      fileName,
      fileType,
      action: fileType === 'image' ? 'image-view' : 'code-edit',
      userInteraction: true
    });
  };

  return { logFilesFetch, logDirectoryToggle, logFileSelection };
}

// ============================================================================
// ORGANISM-LEVEL LOGGING PATTERNS
// ============================================================================

/**
 * Example 5: ChatInterface Organism with Session and WebSocket Logging
 * 
 * Demonstrates:
 * - Session-scoped logging
 * - WebSocket event logging
 * - Message flow tracking
 * - Performance monitoring
 */
export function ExampleChatInterfaceLogging() {
  const logger = useLogger({ scope: 'ChatInterface' });

  const createSessionLogger = (sessionId: string) => {
    return logger.child({ sessionId });
  };

  const logSessionStart = (sessionLogger: Logger, projectName: string) => {
    sessionLogger.info('Chat session started', {
      projectName,
      timestamp: Date.now(),
      sessionType: 'new'
    });
  };

  const logWebSocketEvent = (
    sessionLogger: Logger, 
    event: string, 
    success: boolean,
    metadata?: Record<string, any>
  ) => {
    const logLevel = success ? 'debug' : 'warn';
    sessionLogger[logLevel]('WebSocket event', {
      event,
      success,
      ...metadata,
      websocketCategory: success ? 'connection' : 'error'
    });
  };

  const logMessageFlow = (
    sessionLogger: Logger,
    messageType: 'user' | 'assistant' | 'tool_use',
    messageLength: number
  ) => {
    sessionLogger.debug('Message processed', {
      messageType,
      messageLength,
      timestamp: Date.now(),
      flowCategory: 'message-processing'
    });
  };

  const logPerformanceMetric = (
    sessionLogger: Logger,
    operation: string,
    duration: number,
    threshold: number = 1000
  ) => {
    const logLevel = duration > threshold ? 'warn' : 'debug';
    sessionLogger[logLevel]('Performance metric', {
      operation,
      duration: Math.round(duration),
      threshold,
      performanceCategory: duration > threshold ? 'slow' : 'fast',
      needsOptimization: duration > threshold
    });
  };

  return { 
    createSessionLogger, 
    logSessionStart, 
    logWebSocketEvent, 
    logMessageFlow, 
    logPerformanceMetric 
  };
}

/**
 * Example 6: Sidebar Organism with Project Management Logging
 * 
 * Demonstrates:
 * - Bulk operation logging
 * - User workflow tracking
 * - API orchestration logging
 * - State management logging
 */
export function ExampleSidebarLogging() {
  const logger = useLogger({ scope: 'Sidebar' });

  const logProjectsLoad = (projectCount: number, loadTime: number) => {
    logger.info('Projects loaded', {
      projectCount,
      loadTime: Math.round(loadTime),
      performanceCategory: loadTime > 2000 ? 'slow' : 'fast'
    });
  };

  const logProjectOperation = (
    operation: 'create' | 'edit' | 'delete' | 'select',
    projectName: string,
    success: boolean,
    error?: string
  ) => {
    const logLevel = success ? 'info' : 'error';
    logger[logLevel]('Project operation', {
      operation,
      projectName,
      success,
      error,
      timestamp: Date.now(),
      operationCategory: 'project-management'
    });
  };

  const logSessionManagement = (
    action: 'create' | 'switch' | 'delete',
    sessionId: string,
    projectName: string
  ) => {
    logger.debug('Session management action', {
      action,
      sessionId,
      projectName,
      userWorkflow: true,
      timestamp: Date.now()
    });
  };

  return { logProjectsLoad, logProjectOperation, logSessionManagement };
}

// ============================================================================
// ERROR HANDLING AND DEBUGGING PATTERNS
// ============================================================================

/**
 * Example 7: Comprehensive Error Logging Patterns
 * 
 * Demonstrates:
 * - Error categorization
 * - Context preservation
 * - Recovery action logging
 * - Debug information collection
 */
export function ExampleErrorLogging() {
  const logger = useLogger({ scope: 'ErrorHandler' });

  const logApiError = (
    endpoint: string,
    status: number,
    errorMessage: string,
    requestContext: Record<string, any>
  ) => {
    logger.error('API request failed', {
      endpoint,
      status,
      error: errorMessage,
      requestContext,
      errorCategory: 'api-error',
      retryable: status >= 500,
      timestamp: Date.now()
    });
  };

  const logComponentError = (
    componentName: string,
    error: Error,
    props: Record<string, any>,
    userAction?: string
  ) => {
    logger.error('Component error', {
      componentName,
      error: error.message,
      stack: error.stack,
      props: JSON.stringify(props),
      userAction,
      errorCategory: 'component-error',
      timestamp: Date.now()
    });
  };

  const logRecoveryAction = (
    action: string,
    success: boolean,
    context: Record<string, any>
  ) => {
    const logLevel = success ? 'info' : 'warn';
    logger[logLevel]('Recovery action attempted', {
      action,
      success,
      context,
      recoveryCategory: success ? 'successful' : 'failed',
      timestamp: Date.now()
    });
  };

  return { logApiError, logComponentError, logRecoveryAction };
}

// ============================================================================
// PERFORMANCE AND OPTIMIZATION PATTERNS
// ============================================================================

/**
 * Example 8: Performance Monitoring and Optimization Logging
 * 
 * Demonstrates:
 * - Render performance tracking
 * - Memory usage monitoring
 * - Bundle loading metrics
 * - User interaction responsiveness
 */
export function ExamplePerformanceLogging() {
  const logger = useLogger({ scope: 'Performance' });

  const logRenderPerformance = (
    componentName: string,
    renderTime: number,
    propsCount: number
  ) => {
    logger.debug('Component render metrics', {
      componentName,
      renderTime: Math.round(renderTime),
      propsCount,
      performanceCategory: renderTime > 16 ? 'slow-render' : 'fast-render',
      needsOptimization: renderTime > 16
    });
  };

  const logChunkLoading = (
    chunkName: string,
    loadTime: number,
    cacheHit: boolean
  ) => {
    logger.debug('Code chunk loaded', {
      chunkName,
      loadTime: Math.round(loadTime),
      cacheHit,
      performanceCategory: loadTime > 1000 ? 'slow-load' : 'fast-load',
      optimization: cacheHit ? 'cache-hit' : 'network-load'
    });
  };

  const logUserInteractionLatency = (
    interaction: string,
    latency: number,
    threshold: number = 100
  ) => {
    const logLevel = latency > threshold ? 'warn' : 'debug';
    logger[logLevel]('User interaction latency', {
      interaction,
      latency: Math.round(latency),
      threshold,
      userExperience: latency > threshold ? 'poor' : 'good',
      needsImprovement: latency > threshold
    });
  };

  return { logRenderPerformance, logChunkLoading, logUserInteractionLatency };
}

// ============================================================================
// BEST PRACTICES SUMMARY
// ============================================================================

/**
 * Logging Best Practices Demonstrated:
 * 
 * 1. **Scope Naming**: Use component name as scope (e.g., 'Button', 'ChatInterface')
 * 
 * 2. **Metadata Structure**: Include relevant context without sensitive data
 *    - Performance metrics (timing, counts)
 *    - User interaction flags
 *    - Error categories and contexts
 *    - State and operation details
 * 
 * 3. **Log Levels**:
 *    - trace: Detailed debugging (rarely used)
 *    - debug: Development insights, user interactions
 *    - info: Significant events, lifecycle, successes
 *    - warn: Recoverable issues, performance problems
 *    - error: Failures, exceptions, critical issues
 * 
 * 4. **Privacy Considerations**:
 *    - Log data lengths, not actual content
 *    - Use categories and flags instead of raw data
 *    - Avoid logging personally identifiable information
 * 
 * 5. **Performance Considerations**:
 *    - Use logger.isLevelEnabled() for expensive operations
 *    - Include timing metrics for optimization
 *    - Log both success and failure paths
 * 
 * 6. **Error Context**:
 *    - Include error messages and stack traces
 *    - Add operation context and user actions
 *    - Categorize errors for easier debugging
 * 
 * 7. **Child Loggers**:
 *    - Use for session or request scoping
 *    - Inherit context while adding specific metadata
 *    - Maintain consistent scope hierarchy
 */