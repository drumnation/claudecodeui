import React from 'react';
import { Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/shared-components/Button';
import {
  PreviewContainer,
  StyledIframe,
  LoadingOverlay,
  ErrorOverlay,
  ErrorContent,
  ErrorIcon,
  ErrorText,
  EmptyStateContainer,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  LoadingIndicator,
  ErrorMessage
} from '@/features/preview/PreviewFrame/PreviewFrame.styles';

export const PreviewFrame = ({
  serverStatus,
  serverUrl,
  url,
  iframeKey,
  iframeRef,
  isLoading,
  error,
  showDevServerAnyway,
  isCurrentProjectServer,
  availableScripts,
  onIframeLoad,
  onIframeError,
  onRefresh,
  onShowDevServerAnyway
}) => {
  const shouldShowFrame = serverStatus === 'running' || showDevServerAnyway || isCurrentProjectServer;

  if (shouldShowFrame) {
    return (
      <PreviewContainer>
        {error && (
          <ErrorOverlay>
            <ErrorContent>
              <ErrorIcon>
                <AlertCircle className="w-full h-full" />
              </ErrorIcon>
              <ErrorText>{error}</ErrorText>
              <Button
                size="sm"
                variant="outline"
                onClick={onRefresh}
                className="mt-4"
              >
                Try Again
              </Button>
            </ErrorContent>
          </ErrorOverlay>
        )}
        <StyledIframe
          key={iframeKey}
          ref={iframeRef}
          src={url || serverUrl || 'http://localhost:8766'}
          onLoad={onIframeLoad}
          onError={onIframeError}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
          title="Live Preview"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone"
        />
        {isLoading && (
          <LoadingOverlay>
            <RefreshCw className="h-8 w-8 animate-spin text-primary dark:text-blue-400" />
          </LoadingOverlay>
        )}
      </PreviewContainer>
    );
  }

  if (isCurrentProjectServer && !showDevServerAnyway) {
    return (
      <EmptyStateContainer>
        <EmptyStateContent>
          <EmptyStateIcon>
            <Globe className="w-full h-full" />
          </EmptyStateIcon>
          <EmptyStateTitle>Development Server Detected</EmptyStateTitle>
          <EmptyStateDescription>
            This app is currently running on the development server.<br/>
            The preview panel works best when viewing a different project or production build.
          </EmptyStateDescription>
          <Button
            size="sm"
            variant="outline"
            onClick={onShowDevServerAnyway}
            className="mt-2 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            View Current App Anyway
          </Button>
        </EmptyStateContent>
      </EmptyStateContainer>
    );
  }

  return (
    <EmptyStateContainer>
      <EmptyStateContent>
        <EmptyStateIcon>
          <Globe className="w-full h-full" />
        </EmptyStateIcon>
        <EmptyStateTitle>No Server Running</EmptyStateTitle>
        <EmptyStateDescription>
          {availableScripts.length > 0 
            ? "Select a script from the dropdown above and click Start to launch your development server."
            : "Loading available scripts..."
          }
        </EmptyStateDescription>
        {serverStatus === 'starting' && (
          <LoadingIndicator>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Starting server...
          </LoadingIndicator>
        )}
        {serverStatus === 'error' && (
          <ErrorMessage>
            Server failed to start. Check the logs for details.
          </ErrorMessage>
        )}
      </EmptyStateContent>
    </EmptyStateContainer>
  );
};