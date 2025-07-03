import React from "react";
import { Globe, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/atoms/Button";

interface PreviewDisplayProps {
  serverStatus: string;
  showDevServerAnyway: boolean;
  isCurrentProjectServer: boolean;
  availableScripts: string[];
  url: string;
  serverUrl: string;
  iframeKey: number;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onIframeLoad: () => void;
  onIframeError: (e: any) => void;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onShowDevServerAnyway: () => void;
}

export function PreviewDisplay({
  serverStatus,
  showDevServerAnyway,
  isCurrentProjectServer,
  availableScripts,
  url,
  serverUrl,
  iframeKey,
  iframeRef,
  onIframeLoad,
  onIframeError,
  isLoading,
  error,
  onRefresh,
  onShowDevServerAnyway
}: PreviewDisplayProps) {
  if (serverStatus === "running" || showDevServerAnyway || isCurrentProjectServer) {
    return (
      <>
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-gray-900/80 z-10">
            <div className="text-center p-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button size="sm" variant="outline" onClick={onRefresh} className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        )}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={url || serverUrl || "http://localhost:8766"}
          className="w-full h-full border-0 bg-white"
          onLoad={onIframeLoad}
          onError={onIframeError}
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
    );
  }

  if (isCurrentProjectServer && !showDevServerAnyway) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8 dark:text-gray-200">
        <div>
          <Globe className="h-16 w-16 text-muted-foreground/30 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 dark:text-white">
            Development Server Detected
          </h3>
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
            This app is currently running on the development server.
            <br />
            The preview panel works best when viewing a different project or production build.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={onShowDevServerAnyway}
            className="mt-2 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            View Current App Anyway
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-center p-8 dark:text-gray-200">
      <div>
        <Globe className="h-16 w-16 text-muted-foreground/30 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2 dark:text-white">No Server Running</h3>
        <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
          {availableScripts.length > 0
            ? "Select a script from the dropdown above and click Start to launch your development server."
            : "Loading available scripts..."}
        </p>
        {serverStatus === "starting" && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Starting server...
          </div>
        )}
        {serverStatus === "error" && (
          <div className="text-sm text-destructive">
            Server failed to start. Check the logs for details.
          </div>
        )}
      </div>
    </div>
  );
}
