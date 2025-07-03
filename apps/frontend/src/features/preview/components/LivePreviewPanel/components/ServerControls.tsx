import React from "react";
import { Play, Square, Terminal } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { previewLogic } from "../LivePreviewPanel.logic";

interface ServerControlsProps {
  availableScripts: string[];
  currentScript: string;
  serverStatus: string;
  onScriptSelect: (script: string) => void;
  onStartServer: (script: string) => void;
  onStopServer: () => void;
  onToggleLogs: () => void;
  showLogs: boolean;
  isMobile: boolean;
}

export function ServerControls({
  availableScripts,
  currentScript,
  serverStatus,
  onScriptSelect,
  onStartServer,
  onStopServer,
  onToggleLogs,
  showLogs,
  isMobile
}: ServerControlsProps) {
  const handleScriptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const script = e.target.value;
    if (script && onScriptSelect) {
      onScriptSelect(script);
    }
  };

  return (
    <div className={`flex items-center gap-2 px-2 pb-2 ${isMobile ? "flex-col" : ""}`}>
      <div className={`${isMobile ? "w-full flex gap-2" : "flex-1 flex gap-2"}`}>
        <select
          value={currentScript || ""}
          onChange={handleScriptChange}
          disabled={serverStatus === "starting" || serverStatus === "stopping"}
          className="flex-1 h-10 px-3 text-base bg-card dark:bg-gray-700 text-foreground dark:text-gray-100 border border-border dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-blue-500"
          style={{ fontSize: "16px" }} // Prevent zoom on iOS
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
            className={`w-2 h-2 rounded-full ${previewLogic.getStatusColor(serverStatus)} ${
              serverStatus === "running" ? "animate-pulse" : ""
            }`}
          />
          {previewLogic.getStatusText(serverStatus)}
        </Badge>
      </div>

      <div className={`flex gap-2 ${isMobile ? "w-full" : ""}`}>
        {serverStatus === "stopped" || serverStatus === "error" ? (
          <Button
            size="sm"
            onClick={() => currentScript && onStartServer(currentScript)}
            disabled={!currentScript || serverStatus.includes("starting")}
            className={`h-10 gap-1.5 ${isMobile ? "flex-1" : ""}`}
          >
            <Play className="h-3.5 w-3.5" />
            Start
          </Button>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            onClick={onStopServer}
            disabled={serverStatus === "stopping"}
            className={`h-10 gap-1.5 ${isMobile ? "flex-1" : ""}`}
          >
            <Square className="h-3.5 w-3.5" />
            Stop
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={onToggleLogs}
          className={`h-10 gap-1.5 ${isMobile ? "flex-1" : ""} ${
            showLogs ? "bg-accent dark:bg-gray-700" : ""
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logs</span>
        </Button>
      </div>
    </div>
  );
}
