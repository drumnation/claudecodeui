import React from "react";
import { Button } from "@/components/atoms/Button";
import type { ServerLog } from "../LivePreviewPanel.types";

interface ServerLogsProps {
  serverLogs: ServerLog[];
  onClearLogs: () => void;
}

export function ServerLogs({ serverLogs, onClearLogs }: ServerLogsProps) {
  return (
    <div className="h-48 border-t border-border dark:border-gray-700 bg-card dark:bg-gray-800 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-border dark:border-gray-700">
        <span className="text-sm font-medium dark:text-gray-200">Server Logs</span>
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
              className={`whitespace-pre-wrap ${
                log.type === "error" ? "text-red-500 dark:text-red-400" : ""
              }`}
            >
              {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
