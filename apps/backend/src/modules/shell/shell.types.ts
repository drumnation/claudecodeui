export interface ShellInitMessage {
  type: 'init';
  projectPath: string;
  sessionId?: string;
  hasSession?: boolean;
}

export interface ShellInputMessage {
  type: 'input';
  data: string;
}

export interface ShellResizeMessage {
  type: 'resize';
  cols: number;
  rows: number;
}

export type ShellMessage = ShellInitMessage | ShellInputMessage | ShellResizeMessage;

export interface ShellOutputMessage {
  type: 'output';
  data: string;
}

export interface ShellErrorMessage {
  type: 'error';
  message: string;
}

export interface ShellUrlOpenMessage {
  type: 'url_open';
  url: string;
}

export type ShellWebSocketMessage = ShellOutputMessage | ShellErrorMessage | ShellUrlOpenMessage;