import type { Project } from "@/app/types";

export interface ServerLog {
  type: string;
  message: string;
  timestamp?: any;
}

export interface LivePreviewPanelProps {
  selectedProject: Project | null;
  serverStatus: string;
  serverUrl: string;
  availableScripts: string[];
  onStartServer: (script: string) => void;
  onStopServer: () => void;
  onScriptSelect: (script: string) => void;
  currentScript: string;
  onClose: () => void;
  isMobile: boolean;
  serverLogs?: ServerLog[];
  onClearLogs: () => void;
}

export type ServerStatus = "running" | "starting" | "stopping" | "stopped" | "error";
