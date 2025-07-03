import { useState, useRef, useEffect, useCallback } from "react";
import { useLogger } from "@kit/logger/react";
import type { Logger } from "@kit/logger/types";
import type { LivePreviewPanelProps } from "./LivePreviewPanel.types";
import { previewLogic } from "./LivePreviewPanel.logic";

type UseLivePreviewProps = Pick<LivePreviewPanelProps, 'selectedProject' | 'serverStatus' | 'serverUrl' | 'availableScripts'>;

export function useLivePreview({
  selectedProject,
  serverStatus,
  serverUrl,
  availableScripts
}: UseLivePreviewProps) {
  const logger: Logger = useLogger({ scope: "LivePreviewPanel" });
  
  // State
  const isCurrentProjectServer = previewLogic.isCurrentProjectServer();
  const [url, setUrl] = useState<string>("http://localhost:8766");
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [showDevServerAnyway, setShowDevServerAnyway] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Effects
  useEffect(() => {
    if (serverUrl) {
      setUrl(serverUrl);
      setError(null);
    } else if (isCurrentProjectServer && serverStatus === "stopped") {
      setUrl("http://localhost:8766");
      setError(null);
    }
  }, [serverUrl, isCurrentProjectServer, serverStatus]);

  useEffect(() => {
    if (availableScripts.length > 0) {
      logger.debug("Available scripts loaded", {
        scripts: availableScripts,
        project: selectedProject?.name,
      });
    }
  }, [availableScripts.length, selectedProject?.name, logger]);

  useEffect(() => {
    if (isCurrentProjectServer) {
      setShowDevServerAnyway(true);
      const currentUrl = previewLogic.getCurrentOrigin();
      setUrl(currentUrl);
    }
  }, [isCurrentProjectServer]);

  // Handlers
  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      setIframeKey((prev) => prev + 1);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
      } catch (e) {
        logger.warn("Cannot access iframe history", {
          error: (e as Error).message,
        });
      }
    }
  }, [logger]);

  const handleGoForward = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.forward();
      } catch (e) {
        logger.warn("Cannot access iframe history", {
          error: (e as Error).message,
        });
      }
    }
  }, [logger]);

  const handleUrlSubmit = useCallback((e: React.FormEvent, newUrl: string) => {
    e.preventDefault();
    if (newUrl) {
      const processedUrl = previewLogic.processUrl(newUrl);
      setUrl(processedUrl);
      setIsLoading(true);
      setError(null);
      setIframeKey((prev) => prev + 1);
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const handleIframeError = useCallback((e: any) => {
    if (e.message && !e.message.includes("cross-origin")) {
      logger.error("Iframe error", { error: e.message });
    }
    setIsLoading(false);
  }, [logger]);

  const handleShowDevServerAnyway = useCallback(() => {
    setShowDevServerAnyway(true);
    setUrl("http://localhost:8766");
    setIframeKey((prev) => prev + 1);
  }, []);

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
    setShowLogs,
    isCurrentProjectServer,
    
    // Refs
    iframeRef,
    
    // Handlers
    handleRefresh,
    handleGoBack,
    handleGoForward,
    handleUrlSubmit,
    handleIframeLoad,
    handleIframeError,
    handleShowDevServerAnyway,
    
    // Logger
    logger
  };
}
