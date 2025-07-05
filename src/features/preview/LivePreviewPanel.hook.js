import { useState, useRef, useEffect } from 'react';

export const useLivePreviewPanel = ({
  serverUrl,
  serverStatus,
  isCurrentProjectServer,
  onScriptSelect,
  onClearLogs
}) => {
  const [url, setUrl] = useState('http://localhost:8766');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [showDevServerAnyway, setShowDevServerAnyway] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const iframeRef = useRef(null);

  // Update URL when server URL changes
  useEffect(() => {
    if (serverUrl) {
      setUrl(serverUrl);
      setError(null);
    } else if (isCurrentProjectServer && serverStatus === 'stopped') {
      setUrl('http://localhost:8766');
      setError(null);
    }
  }, [serverUrl, isCurrentProjectServer, serverStatus]);

  // Auto-show app if dev server is detected
  useEffect(() => {
    if (isCurrentProjectServer) {
      setShowDevServerAnyway(true);
      const currentUrl = window.location.origin;
      setUrl(currentUrl);
    }
  }, [isCurrentProjectServer]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setIframeKey(prev => prev + 1);
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
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'http://' + processedUrl;
      }
      setUrl(processedUrl);
      setIsLoading(true);
      setError(null);
      setIframeKey(prev => prev + 1);
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
  };

  const handleIframeError = (e) => {
    console.error('Iframe error:', e);
    setIsLoading(false);
  };

  const toggleLogs = () => setShowLogs(!showLogs);

  const showDevServerAnywayHandler = () => {
    setShowDevServerAnyway(true);
    setUrl('http://localhost:8766');
    setIframeKey(prev => prev + 1);
  };

  return {
    // State
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
    
    // Handlers
    handleRefresh,
    handleGoBack,
    handleGoForward,
    handleUrlSubmit,
    handleScriptChange,
    handleIframeLoad,
    handleIframeError,
    toggleLogs,
    showDevServerAnywayHandler
  };
};