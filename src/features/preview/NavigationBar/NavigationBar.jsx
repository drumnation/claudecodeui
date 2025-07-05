import React from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import { Button } from '@/shared-components/Button';
import { NavigationContainer, UrlForm, UrlInput } from '@/features/preview/NavigationBar/NavigationBar.styles';

export const NavigationBar = ({
  url,
  setUrl,
  canGoBack,
  canGoForward,
  isLoading,
  serverStatus,
  isCurrentProjectServer,
  showDevServerAnyway,
  isMobile,
  onClose,
  onGoBack,
  onGoForward,
  onRefresh,
  onUrlSubmit
}) => {
  return (
    <NavigationContainer>
      <Button
        variant="ghost"
        size="icon"
        onClick={onGoBack}
        disabled={!canGoBack || serverStatus !== 'running'}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onGoForward}
        disabled={!canGoForward || serverStatus !== 'running'}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        disabled={serverStatus !== 'running'}
        className="h-8 w-8"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>

      <UrlForm onSubmit={onUrlSubmit}>
        <UrlInput
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:3000"
          disabled={serverStatus !== 'running' && !isCurrentProjectServer && !showDevServerAnyway}
        />
      </UrlForm>

      {isMobile && onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </NavigationContainer>
  );
};