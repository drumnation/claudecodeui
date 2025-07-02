import React, {useState, useRef, useEffect} from 'react';
import {
  Globe,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Square,
  Terminal,
  AlertCircle,
} from 'lucide-react';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Badge} from './ui/badge';

function LivePreviewPanel({
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
}) {
  // Check if the current dev server is already running
  const isCurrentProjectServer =
    window.location.hostname === 'localhost' && window.location.port === '8766';
  const [url, setUrl] = useState('http://localhost:8766');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [showDevServerAnyway, setShowDevServerAnyway] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (serverUrl) {
      setUrl(serverUrl);
      setError(null);
    } else if (isCurrentProjectServer && serverStatus === 'stopped') {
      // If we're running on the dev server but status shows stopped,
      // it means the server is running outside of our control
      setUrl('http://localhost:8766');
      setError(null);
    }
  }, [serverUrl, isCurrentProjectServer, serverStatus]);

  // Debug logging for scripts
  useEffect(() => {
    console.log('📦 Available scripts:', availableScripts);
    console.log('📁 Selected project:', selectedProject);
  }, [availableScripts, selectedProject]);

  // Auto-show app if dev server is detected
  useEffect(() => {
    if (isCurrentProjectServer) {
      setShowDevServerAnyway(true);
      // Use the current page URL
      const currentUrl = window.location.origin;
      setUrl(currentUrl);
    }
  }, [isCurrentProjectServer]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setIframeKey((prev) => prev + 1);
    }
  };

  const handleGoBack = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
      } catch (e) {
        console.warn('Cannot access iframe history:', e);
      }
    }
  };

  const handleGoForward = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.forward();
      } catch (e) {
        console.warn('Cannot access iframe history:', e);
      }
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (url) {
      let processedUrl = url.trim();
      if (
        !processedUrl.startsWith('http://') &&
        !processedUrl.startsWith('https://')
      ) {
        processedUrl = 'http://' + processedUrl;
      }
      setUrl(processedUrl);
      setIsLoading(true);
      setError(null);
      // Force iframe reload by changing key
      setIframeKey((prev) => prev + 1);
    }
  };

  const handleScriptChange = (e) => {
    const script = e.target.value;
    if (script && onScriptSelect) {
      onScriptSelect(script);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
    // Don't try to access cross-origin location
  };

  const handleIframeError = (e) => {
    console.error('Iframe error:', e);
    setIsLoading(false);
    // Don't set error for cross-origin issues, as they're expected
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'running':
        return 'text-green-500';
      case 'starting':
        return 'text-yellow-500';
      case 'stopping':
        return 'text-orange-500';
      case 'stopped':
        return 'text-gray-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'running':
        return 'Running';
      case 'starting':
        return 'Starting...';
      case 'stopping':
        return 'Stopping...';
      case 'stopped':
        return 'Stopped';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background dark:bg-gray-900">
      {/* Header with navigation and controls */}
      <div className="flex-shrink-0 border-b border-border dark:border-gray-700 bg-card dark:bg-gray-800">
        <div className="flex items-center gap-2 p-2">
          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            disabled={!canGoBack || serverStatus !== 'running'}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoForward}
            disabled={!canGoForward || serverStatus !== 'running'}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={serverStatus !== 'running'}
            className="h-8 w-8"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>

          {/* URL bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:3000"
              disabled={
                serverStatus !== 'running' &&
                !isCurrentProjectServer &&
                !showDevServerAnyway
              }
              className="flex h-8 w-full rounded-md border border-input bg-card dark:bg-gray-700 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </form>

          {/* Close button for mobile */}
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
        </div>

        {/* Script selector and server controls */}
        <div
          className={`flex items-center gap-2 px-2 pb-2 ${isMobile ? 'flex-col' : ''}`}
        >
          <div
            className={`${isMobile ? 'w-full flex gap-2' : 'flex-1 flex gap-2'}`}
          >
            <select
              value={currentScript || ''}
              onChange={handleScriptChange}
              disabled={
                serverStatus === 'starting' || serverStatus === 'stopping'
              }
              className={`flex-1 h-10 px-3 text-base bg-card dark:bg-gray-700 text-foreground dark:text-gray-100 border border-border dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-blue-500`}
              style={{fontSize: '16px'}} // Prevent zoom on iOS
            >
              <option value="">Select a script...</option>
              {availableScripts.length > 0 ? (
                availableScripts.map((script) => (
                  <option key={script} value={script}>
                    {script}
                  </option>
                ))
              ) : (
                <option disabled>Loading scripts...</option>
              )}
            </select>

            {/* Server status badge */}
            <Badge
              variant="outline"
              className="gap-1.5 h-10 px-3 flex items-center dark:border-gray-600"
            >
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor()} ${serverStatus === 'running' ? 'animate-pulse' : ''}`}
              />
              {getStatusText()}
            </Badge>
          </div>

          <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
            {serverStatus === 'stopped' || serverStatus === 'error' ? (
              <Button
                size="sm"
                onClick={() => currentScript && onStartServer(currentScript)}
                disabled={!currentScript || serverStatus === 'starting'}
                className={`h-10 gap-1.5 ${isMobile ? 'flex-1' : ''}`}
              >
                <Play className="h-3.5 w-3.5" />
                Start
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={onStopServer}
                disabled={serverStatus === 'stopping'}
                className={`h-10 gap-1.5 ${isMobile ? 'flex-1' : ''}`}
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLogs(!showLogs)}
              className={`h-10 gap-1.5 ${isMobile ? 'flex-1' : ''} ${showLogs ? 'bg-accent dark:bg-gray-700' : ''}`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logs</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Logs panel (optional) */}
      {showLogs && (
        <div className="h-48 border-t border-border dark:border-gray-700 bg-card dark:bg-gray-800 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-2 border-b border-border dark:border-gray-700">
            <span className="text-sm font-medium dark:text-gray-200">
              Server Logs
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearLogs}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-xs dark:text-gray-300">
            {serverLogs.length === 0 ? (
              <div className="text-muted-foreground dark:text-gray-500">
                No logs yet...
              </div>
            ) : (
              serverLogs.map((log, index) => (
                <div
                  key={index}
                  className={`whitespace-pre-wrap ${log.type === 'error' ? 'text-red-500 dark:text-red-400' : ''}`}
                >
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Preview area */}
      <div className="flex-1 relative bg-white dark:bg-gray-900">
        {serverStatus === 'running' ||
        showDevServerAnyway ||
        isCurrentProjectServer ? (
          <>
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-gray-900/80 z-10">
                <div className="text-center p-4">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRefresh}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={url || serverUrl || 'http://localhost:8766'}
              className="w-full h-full border-0 bg-white"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
              title="Live Preview"
              allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 dark:bg-gray-900/50 z-20">
                <RefreshCw className="h-8 w-8 animate-spin text-primary dark:text-blue-400" />
              </div>
            )}
          </>
        ) : isCurrentProjectServer && !showDevServerAnyway ? (
          <div className="flex items-center justify-center h-full text-center p-8 dark:text-gray-200">
            <div>
              <Globe className="h-16 w-16 text-muted-foreground/30 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                Development Server Detected
              </h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                This app is currently running on the development server.
                <br />
                The preview panel works best when viewing a different project or
                production build.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowDevServerAnyway(true);
                  setUrl('http://localhost:8766');
                  setIframeKey((prev) => prev + 1);
                }}
                className="mt-2 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                View Current App Anyway
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8 dark:text-gray-200">
            <div>
              <Globe className="h-16 w-16 text-muted-foreground/30 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                No Server Running
              </h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                {availableScripts.length > 0
                  ? 'Select a script from the dropdown above and click Start to launch your development server.'
                  : 'Loading available scripts...'}
              </p>
              {serverStatus === 'starting' && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Starting server...
                </div>
              )}
              {serverStatus === 'error' && (
                <div className="text-sm text-destructive">
                  Server failed to start. Check the logs for details.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LivePreviewPanel;
