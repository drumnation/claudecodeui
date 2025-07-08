import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import * as S from './ErrorBoundary.styles';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You could also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  copyErrorDetails = () => {
    const errorDetails = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.toString()}
Component Stack: ${this.state.errorInfo?.componentStack}
Stack Trace: ${this.state.error?.stack}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      // You could show a toast notification here
      console.log('Error details copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy error details:', err);
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default beautiful error UI
      return (
        <S.ErrorContainer>
          <S.ErrorContent>
            <S.ErrorIcon>
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </S.ErrorIcon>
            
            <S.ErrorHeader>
              <S.ErrorTitle>Oops! Something went wrong</S.ErrorTitle>
              <S.ErrorSubtitle>
                {this.props.level === 'page' 
                  ? "We're having trouble loading this page"
                  : "This component encountered an unexpected error"
                }
              </S.ErrorSubtitle>
            </S.ErrorHeader>

            <S.ErrorId>
              Error ID: {this.state.errorId}
            </S.ErrorId>

            <S.ErrorActions>
              <S.PrimaryButton onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4" />
                Try Again
              </S.PrimaryButton>
              
              {this.props.level === 'page' && (
                <S.SecondaryButton onClick={this.handleGoHome}>
                  <Home className="w-4 h-4" />
                  Go Home
                </S.SecondaryButton>
              )}
              
              <S.SecondaryButton onClick={this.copyErrorDetails}>
                <Bug className="w-4 h-4" />
                Copy Error Details
              </S.SecondaryButton>
            </S.ErrorActions>

            {this.props.showDetails && this.state.error && (
              <S.ErrorDetails>
                <S.ErrorDetailsTitle>Error Details</S.ErrorDetailsTitle>
                <S.ErrorDetailsContent>
                  <strong>Error:</strong> {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      <br /><br />
                      <strong>Stack Trace:</strong>
                      <S.ErrorStack>{this.state.error.stack}</S.ErrorStack>
                    </>
                  )}
                </S.ErrorDetailsContent>
              </S.ErrorDetails>
            )}

            <S.ErrorFooter>
              If this problem persists, please contact support with the error ID above.
            </S.ErrorFooter>
          </S.ErrorContent>
        </S.ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;