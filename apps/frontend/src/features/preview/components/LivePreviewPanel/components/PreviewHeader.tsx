import React from "react";
import { ChevronLeft, ChevronRight, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";

interface PreviewHeaderProps {
  url: string;
  onUrlChange: (url: string) => void;
  onUrlSubmit: (e: React.FormEvent, url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onRefresh: () => void;
  onClose?: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  serverStatus: string;
  isCurrentProjectServer: boolean;
  showDevServerAnyway: boolean;
  isMobile: boolean;
}

export function PreviewHeader({
  url,
  onUrlChange,
  onUrlSubmit,
  onGoBack,
  onGoForward,
  onRefresh,
  onClose,
  canGoBack,
  canGoForward,
  isLoading,
  serverStatus,
  isCurrentProjectServer,
  showDevServerAnyway,
  isMobile
}: PreviewHeaderProps) {
  return (
    <div className="flex items-center gap-2 p-2">
      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onGoBack}
        disabled={!canGoBack || serverStatus !== "running"}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onGoForward}
        disabled={!canGoForward || serverStatus !== "running"}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        disabled={serverStatus !== "running"}
        className="h-8 w-8"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      </Button>

      {/* URL bar */}
      <form onSubmit={(e) => onUrlSubmit(e, url)} className="flex-1 flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="http://localhost:3000"
          disabled={
            serverStatus !== "running" &&
            !isCurrentProjectServer &&
            !showDevServerAnyway
          }
          className="flex h-8 w-full rounded-md border border-input bg-card dark:bg-gray-700 px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </form>

      {/* Close button for mobile */}
      {isMobile && onClose && (
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
