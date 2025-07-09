import {Component, ErrorInfo, ReactNode} from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: ErrorInfo;
  level?: 'page' | 'section' | 'component';
}
