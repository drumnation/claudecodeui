import React from "react";
import { PreviewHeader } from "./components/PreviewHeader";
import { ServerControls } from "./components/ServerControls";
import { ServerLogs } from "./components/ServerLogs";
import { PreviewDisplay } from "./components/PreviewDisplay";
import { useLivePreview } from "./LivePreviewPanel.hook";
import type { LivePreviewPanelProps } from "./LivePreviewPanel.types";

export function LivePreviewPanel({
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
}: LivePreviewPanelProps) {
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
    setShowLogs,
    isCurrentProjectServer,
    iframeRef,
    handleRefresh,
    handleGoBack,
    handleGoForward,
    handleUrlSubmit,
    handleIframeLoad,
    handleIframeError,
    handleShowDevServerAnyway,
  } = useLivePreview({
    selectedProject,
    serverStatus,
    serverUrl,
    availableScripts,
  });

  return (
    <div className="flex flex-col h-full bg-background dark:bg-gray-900">
      {/* Header with navigation and controls */}
      <div className="flex-shrink-0 border-b border-border dark:border-gray-700 bg-card dark:bg-gray-800">
        <PreviewHeader
          url={url}
          onUrlChange={setUrl}
          onUrlSubmit={handleUrlSubmit}
          onGoBack={handleGoBack}
          onGoForward={handleGoForward}
          onRefresh={handleRefresh}
          onClose={onClose}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          isLoading={isLoading}
          serverStatus={serverStatus}
          isCurrentProjectServer={isCurrentProjectServer}
          showDevServerAnyway={showDevServerAnyway}
          isMobile={isMobile}
        />

        <ServerControls
          availableScripts={availableScripts}
          currentScript={currentScript}
          serverStatus={serverStatus}
          onScriptSelect={onScriptSelect}
          onStartServer={onStartServer}
          onStopServer={onStopServer}
          onToggleLogs={() => setShowLogs(!showLogs)}
          showLogs={showLogs}
          isMobile={isMobile}
        />
      </div>

      {/* Logs panel (optional) */}
      {showLogs && <ServerLogs serverLogs={serverLogs} onClearLogs={onClearLogs} />}

      {/* Preview area */}
      <div className="flex-1 relative bg-white dark:bg-gray-900">
        <PreviewDisplay
          serverStatus={serverStatus}
          showDevServerAnyway={showDevServerAnyway}
          isCurrentProjectServer={isCurrentProjectServer}
          availableScripts={availableScripts}
          url={url}
          serverUrl={serverUrl}
          iframeKey={iframeKey}
          iframeRef={iframeRef}
          onIframeLoad={handleIframeLoad}
          onIframeError={handleIframeError}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          onShowDevServerAnyway={handleShowDevServerAnyway}
        />
      </div>
    </div>
  );
}
