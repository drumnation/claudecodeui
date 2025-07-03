import React from 'react';
import { useLogger } from '@kit/logger/react';

export interface UserActionMetadata {
  component?: string;
  action: string;
  details?: Record<string, any>;
  timestamp?: string;
  sessionId?: string;
  projectName?: string;
  url?: string;
}

export const useUserActionLogger = (scope: string = 'user-actions') => {
  const logger = useLogger(scope);

  const logAction = (metadata: UserActionMetadata) => {
    const enrichedMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    logger.info(`USER_ACTION: ${metadata.action}`, enrichedMetadata);
  };

  // Convenience methods for common actions
  const logClick = (element: string, details?: Record<string, any>) => {
    logAction({
      action: 'click',
      component: element,
      details: { ...details, type: 'click' }
    });
  };

  const logNavigation = (from: string, to: string, details?: Record<string, any>) => {
    logAction({
      action: 'navigation',
      details: { from, to, ...details }
    });
  };

  const logFormSubmission = (formName: string, details?: Record<string, any>) => {
    logAction({
      action: 'form_submit',
      component: formName,
      details
    });
  };

  const logStateChange = (component: string, change: string, details?: Record<string, any>) => {
    logAction({
      action: 'state_change',
      component,
      details: { change, ...details }
    });
  };

  const logFileOperation = (operation: string, fileName?: string, details?: Record<string, any>) => {
    logAction({
      action: 'file_operation',
      details: { operation, fileName, ...details }
    });
  };

  const logSearch = (query: string, resultCount?: number, details?: Record<string, any>) => {
    logAction({
      action: 'search',
      details: { query, resultCount, ...details }
    });
  };

  // TRACE level for temporary debugging logs that should be removed
  const logTrace = (message: string, details?: Record<string, any>) => {
    const logger = useLogger('TRACE-TEMP');
    logger.debug(`🔍 TRACE: ${message}`, details);
  };

  // TEMP level for very temporary logs that should be cleaned up
  const logTemp = (message: string, details?: Record<string, any>) => {
    const logger = useLogger('TEMP');
    logger.debug(`⚡ TEMP: ${message}`, details);
  };

  return {
    logAction,
    logClick,
    logNavigation,
    logFormSubmission,
    logStateChange,
    logFileOperation,
    logSearch,
    logTrace,
    logTemp
  };
};

// Higher-order component for automatic interaction logging
export const withUserActionLogging = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> => {
  return (props: T) => {
    const { logAction } = useUserActionLogger('user-actions');

    React.useEffect(() => {
      logAction({
        action: 'component_mount',
        component: componentName,
        details: { props: Object.keys(props) }
      });

      return () => {
        logAction({
          action: 'component_unmount',
          component: componentName
        });
      };
    }, []);

    return React.createElement(Component, props);
  };
};