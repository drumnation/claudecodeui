import {ReactNode} from 'react';

export interface BacklogErrorBoundaryProps {
  children: ReactNode;
}

export interface BacklogErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: {
    componentStack: string;
  } | null;
}

export interface BacklogContext {
  hasError: boolean;
  url: string;
  userAgent: string;
  timestamp: string;
}
