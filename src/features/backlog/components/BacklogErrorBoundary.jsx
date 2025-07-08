import React from 'react';
import styled from '@emotion/styled';
import { AlertCircle } from 'lucide-react';
import { createLogger } from '@kit/logger/browser';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
  background-color: rgb(255 255 255);
  color: rgb(0 0 0);
  
  .dark & {
    background-color: rgb(17 24 39);
    color: rgb(255 255 255);
  }
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
`;

const ErrorMessage = styled.p`
  font-size: 0.875rem;
  color: rgb(107 114 128);
  margin: 0 0 2rem 0;
  max-width: 500px;
  
  .dark & {
    color: rgb(156 163 175);
  }
`;

const ErrorDetails = styled.pre`
  font-size: 0.75rem;
  font-family: monospace;
  background-color: rgb(249 250 251);
  padding: 1rem;
  border-radius: 0.375rem;
  max-width: 600px;
  overflow-x: auto;
  text-align: left;
  
  .dark & {
    background-color: rgb(31 41 55);
  }
`;

const logger = createLogger({ scope: 'backlog-error-boundary' });

export class BacklogErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Backlog error boundary caught error', {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      timestamp: Date.now(),
      backlogContext: this.getBacklogContext()
    });
    
    this.setState({
      error,
      errorInfo
    });
  }
  
  getBacklogContext() {
    return {
      hasError: this.state.hasError,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <AlertCircle size={48} color="#ef4444" />
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            The backlog feature encountered an error. Please refresh the page to try again.
          </ErrorMessage>
          {process.env.NODE_ENV === 'development' && (
            <ErrorDetails>
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}