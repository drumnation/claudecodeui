/**
 * Chat Feature Types - Domain-specific type definitions
 * Following Bulletproof React feature-slice pattern
 */

import type { Logger } from "@kit/logger/types";
import type { Project, Session } from "@/App";
import type { WSMessage } from "@/utils/websocket";

// Chat message types
export interface ChatMessage {
  type: "user" | "assistant" | "tool_use" | "tool_result" | "error";
  content: any;
  isToolUse?: boolean;
  isInteractivePrompt?: boolean;
  timestamp?: string | number | Date;
  id?: string;
  tool_name?: string;
  toolName?: string; // Alternative property name used in some places
  toolId?: string;
  tool_input?: any;
  toolInput?: any; // Alternative property name
  tool_result?: any;
  toolResult?: any; // Alternative property name
  toolError?: boolean;
  toolResultTimestamp?: string | number | Date;
  inline?: boolean;
}

// Message component props
export interface MessageComponentProps {
  message: ChatMessage;
  index: number;
  prevMessage: ChatMessage | null;
  createDiff: (
    oldStr: string,
    newStr: string,
  ) => Array<{
    type: "added" | "removed" | "unchanged";
    content: string;
    lineNum: number;
  }>;
  onFileOpen: (
    filePath: string,
    diffOptions?: { old_string: string; new_string: string },
  ) => void;
  onShowSettings: () => void;
  autoExpandTools: boolean;
  showRawParameters: boolean;
  logger: Logger;
}

// Chat interface props
export interface ChatInterfaceProps {
  selectedProject: Project | null;
  selectedSession: Session | null;
  ws: WebSocket | null;
  sendMessage: (message: WSMessage) => void;
  messages: WSMessage[];
  onFileOpen: (
    filePath: string,
    diffOptions?: { old_string: string; new_string: string },
  ) => void;
  onInputFocusChange: (focused: boolean) => void;
  onSessionActive: (sessionId: string) => void;
  onSessionInactive: (sessionId: string) => void;
  onReplaceTemporarySession: (realSessionId: string) => void;
  onNavigateToSession: (sessionId: string) => void;
  onShowSettings: () => void;
  autoExpandTools: boolean;
  showRawParameters: boolean;
  autoScrollToBottom: boolean;
}

// Session protection types
export interface SessionProtection {
  onSessionActive: (sessionId: string) => void;
  onSessionInactive: (sessionId: string) => void;
  onReplaceTemporarySession: (realSessionId: string) => void;
}

// Chat configuration
export interface ChatConfig {
  autoExpandTools: boolean;
  showRawParameters: boolean;
  autoScrollToBottom: boolean;
}

// Chat events
export interface ChatEvents {
  onInputFocusChange: (focused: boolean) => void;
  onNavigateToSession: (sessionId: string) => void;
  onShowSettings: () => void;
  onFileOpen: (
    filePath: string,
    diffOptions?: { old_string: string; new_string: string },
  ) => void;
}