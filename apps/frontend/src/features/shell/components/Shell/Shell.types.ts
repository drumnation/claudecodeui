import type { Project, Session } from "@/app/types";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";

export interface ShellProps {
  selectedProject: Project | null;
  selectedSession: Session | null;
  isActive: boolean;
}

export interface ShellSession {
  terminal: Terminal;
  fitAddon: FitAddon;
  ws: WebSocket | null;
  isConnected: boolean;
}

export interface InitPayload {
  type: "init";
  projectPath?: string;
  sessionId?: string;
  hasSession: boolean;
}

export interface InputPayload {
  type: "input";
  data: string;
}

export interface WebSocketMessage {
  type: "output" | "url_open";
  data?: string;
  url?: string;
}
