import React, {useEffect} from 'react';
import {NavigationBar} from '@/features/preview/NavigationBar';
import {ServerControls} from '@/features/preview/ServerControls';
import {LogsPanel} from '@/features/preview/LogsPanel';
import {PreviewFrame} from '@/features/preview/PreviewFrame';
import {useLivePreviewPanel} from '@/features/preview/LivePreviewPanel.hook';
import {isCurrentProjectServer} from '@/features/preview/LivePreviewPanel.logic';
import {Container, Header} from '@/features/preview/LivePreviewPanel.styles';
import {LivePreviewPanelProps} from './LivePreviewPanel.types';

interface LivePreviewPanelComponentProps extends LivePreviewPanelProps {
  serverStatus?: any;
  serverUrl?: string;
  availableScripts?: any[];
  onStartServer?: () => void;
  onStopServer?: () => void;
  onScriptSelect?: (script: any) => void;
  currentScript?: any;
  onClose?: () => void;
  isMobile?: boolean;
  serverLogs?: any[];
  onClearLogs?: () => void;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelComponentProps> = ({
  selectedProject,
  serverStatus,
  serverUrl,
  availableScripts,
  onStartServer,
  onStopServer,
  onScriptSelect,
  currentScript,
  onClose,
  isMobile,
  serverLogs = [],
  onClearLogs,
}) => {
  const isCurrentProject = isCurrentProjectServer();

  const {
    url,
    setUrl,
    canGoBack,
    canGoForward,
    isLoading,
    error,
    iframeKey,
    showDevServerAnyway,
    showLogs,
    iframeRef,
    handleRefresh,
    handleGoBack,
    handleGoForward,
    handleUrlSubmit,
    handleScriptChange,
    handleIframeLoad,
    handleIframeError,
    toggleLogs,
    showDevServerAnywayHandler,
  } = useLivePreviewPanel({
    serverUrl,
    serverStatus,
    isCurrentProjectServer: isCurrentProject,
    onScriptSelect,
    onClearLogs,
  });

  return (
    <Container>
      <Header>
        <NavigationBar
          url={url}
          setUrl={setUrl}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          isLoading={isLoading}
          serverStatus={serverStatus}
          isCurrentProjectServer={isCurrentProject}
          showDevServerAnyway={showDevServerAnyway}
          isMobile={isMobile}
          onClose={onClose}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          onRefresh={handleRefresh}
          onUrlSubmit={handleUrlSubmit}
        />

        <ServerControls
          availableScripts={availableScripts}
          currentScript={currentScript}
          serverStatus={serverStatus}
          isMobile={isMobile}
          showLogs={showLogs}
          onScriptChange={handleScriptChange}
          onStartServer={onStartServer}
          onStopServer={onStopServer}
          onToggleLogs={toggleLogs}
        />
      </Header>

      {showLogs && (
        <LogsPanel serverLogs={serverLogs} onClearLogs={onClearLogs} />
      )}

      <PreviewFrame
        serverStatus={serverStatus}
        serverUrl={serverUrl}
        url={url}
        iframeKey={iframeKey}
        iframeRef={iframeRef}
        isLoading={isLoading}
        error={error}
        showDevServerAnyway={showDevServerAnyway}
        isCurrentProjectServer={isCurrentProject}
        availableScripts={availableScripts}
        onIframeLoad={handleIframeLoad}
        onIframeError={handleIframeError}
        onRefresh={handleRefresh}
        onShowDevServerAnyway={showDevServerAnywayHandler}
      />
    </Container>
  );
};
