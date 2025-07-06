/**
 * @kit/logger React Integration
 *
 * Context and hooks for using the logger in React applications.
 */

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import {createLogger} from './browser.js';
import type {Logger, LoggerOptions, LoggerMetadata} from './types.js';

interface LoggerContextValue {
  logger: Logger;
}

const LoggerContext = createContext<LoggerContextValue | null>(null);

interface LoggerProviderProps extends LoggerOptions {
  children: ReactNode;
}

/**
 * Logger Provider
 *
 * Creates and manages a logger instance for the React app.
 * Place at the root of your app to enable logging throughout.
 *
 * @example
 * ```tsx
 * import { LoggerProvider } from '@kit/logger';
 *
 * function App() {
 *   return (
 *     <LoggerProvider level="debug" isDevelopment={import.meta.env.DEV}>
 *       <YourApp />
 *     </LoggerProvider>
 *   );
 * }
 * ```
 */
export function LoggerProvider({children, ...options}: LoggerProviderProps) {
  // Create logger instance once and maintain it
  const loggerRef = useRef<Logger | null>(null);

  if (!loggerRef.current) {
    loggerRef.current = createLogger(options);
  }

  const value = useMemo(
    () => ({logger: loggerRef.current!}),
    [], // Logger instance never changes
  );

  return React.createElement(LoggerContext.Provider, {value}, children);
}

/**
 * Use Logger Context
 *
 * Access the root logger instance directly.
 * Useful when you need the full logger API.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { logger } = useLoggerContext();
 *
 *   useEffect(() => {
 *     logger.debug('Component mounted');
 *   }, []);
 * }
 * ```
 */
export function useLoggerContext(): LoggerContextValue {
  const context = useContext(LoggerContext);

  if (!context) {
    throw new Error(
      'useLoggerContext must be used within a LoggerProvider. ' +
        'Wrap your app with <LoggerProvider> at the root.',
    );
  }

  return context;
}

/**
 * Use Logger Hook
 *
 * Get a scoped logger for a specific component or module.
 * The scope helps identify where logs are coming from.
 *
 * @example
 * ```tsx
 * function TodoList() {
 *   const logger = useLogger({ component: 'TodoList' });
 *
 *   const handleAdd = (todo: Todo) => {
 *     logger.info('Adding todo', { id: todo.id, title: todo.title });
 *     // ... add logic
 *   };
 *
 *   const handleError = (error: Error) => {
 *     logger.error('Failed to save todo', { error });
 *   };
 * }
 * ```
 */
export function useLogger(scope: LoggerMetadata): Logger {
  const {logger} = useLoggerContext();

  // Memoize the scoped logger to avoid recreating it on every render
  const scopedLogger = useMemo(() => logger.child(scope), [logger, scope]);

  return scopedLogger;
}

/**
 * Logger Boundary
 *
 * Catches errors in child components and logs them.
 * Useful for debugging React error boundaries.
 *
 * @example
 * ```tsx
 * <LoggerBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </LoggerBoundary>
 * ```
 */
interface LoggerBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  scope?: string;
}

interface LoggerBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class LoggerBoundary extends React.Component<
  LoggerBoundaryProps,
  LoggerBoundaryState
> {
  static contextType = LoggerContext;
  declare context: React.ContextType<typeof LoggerContext>;
  declare state: LoggerBoundaryState;
  declare props: LoggerBoundaryProps;

  constructor(props: LoggerBoundaryProps) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error): LoggerBoundaryState {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Get logger from context if available
    if (this.context?.logger) {
      const scope = this.props.scope || 'ErrorBoundary';
      const boundaryLogger = this.context.logger.child({component: scope});

      boundaryLogger.error('React error boundary caught error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  render(): any {
    if (this.state.hasError) {
      return (
        this.props.fallback ||
        React.createElement('div', null, 'Something went wrong.')
      );
    }

    return this.props.children;
  }
}

/**
 * Development Logger
 *
 * Higher-order component that adds logging to component lifecycle.
 * Only active in development mode.
 *
 * @example
 * ```tsx
 * export default withDevLogger(MyComponent, 'MyComponent');
 * ```
 */
export function withDevLogger<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
): React.ComponentType<P> {
  if (process.env.NODE_ENV !== 'development') {
    return Component;
  }

  return function LoggedComponent(props: P) {
    const logger = useLogger({scope: componentName});

    React.useEffect(() => {
      logger.debug('Component mounted', {props});

      return () => {
        logger.debug('Component unmounted');
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
      logger.debug('Component updated', {props});
    });

    return React.createElement(Component, props);
  };
}
