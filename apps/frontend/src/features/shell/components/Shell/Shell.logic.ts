import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { ClipboardAddon } from "@xterm/addon-clipboard";
import { WebglAddon } from "@xterm/addon-webgl";
import type { ShellSession, InitPayload, InputPayload, WebSocketMessage } from "./Shell.types";
import type { Project, Session } from "@/app/types";

// Global store for shell sessions to persist across tab switches
const shellSessions = new Map<string, ShellSession>();

export const shellLogic = {
  // Session management
  getSessionKey(selectedProject: Project | null, selectedSession: Session | null): string {
    return selectedSession?.id || `project-${selectedProject?.name}`;
  },

  getStoredSession(sessionKey: string): ShellSession | undefined {
    return shellSessions.get(sessionKey);
  },

  storeSession(sessionKey: string, session: ShellSession): void {
    try {
      shellSessions.set(sessionKey, session);
    } catch (error) {
      console.warn('Failed to store shell session:', error);
    }
  },

  clearSession(sessionKey: string): void {
    shellSessions.delete(sessionKey);
  },

  clearProjectSessions(projectName: string): void {
    const sessionKeys = Array.from(shellSessions.keys()).filter((key) =>
      key.includes(projectName)
    );
    sessionKeys.forEach((key) => shellSessions.delete(key));
  },

  clearAllProjectSessions(projectName: string): void {
    const allKeys = Array.from(shellSessions.keys());
    allKeys.forEach((key) => {
      if (key.includes(projectName)) {
        shellSessions.delete(key);
      }
    });
  },

  // Terminal creation
  createTerminal(): Terminal {
    return new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      allowProposedApi: true,
      allowTransparency: false,
      convertEol: true,
      scrollback: 10000,
      tabStopWidth: 4,
      windowsMode: false,
      macOptionIsMeta: true,
      macOptionClickForcesSelection: false,
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        cursor: "#ffffff",
        cursorAccent: "#1e1e1e",
        selectionBackground: "#264f78",
        selectionForeground: "#ffffff",
        black: "#000000",
        red: "#cd3131",
        green: "#0dbc79",
        yellow: "#e5e510",
        blue: "#2472c8",
        magenta: "#bc3fbc",
        cyan: "#11a8cd",
        white: "#e5e5e5",
        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#23d18b",
        brightYellow: "#f5f543",
        brightBlue: "#3b8eea",
        brightMagenta: "#d670d6",
        brightCyan: "#29b8db",
        brightWhite: "#ffffff",
        extendedAnsi: [
          "#000000", "#800000", "#008000", "#808000",
          "#000080", "#800080", "#008080", "#c0c0c0",
          "#808080", "#ff0000", "#00ff00", "#ffff00",
          "#0000ff", "#ff00ff", "#00ffff", "#ffffff"
        ]
      }
    });
  },

  // Terminal utilities
  clearTerminal(terminal: Terminal): void {
    terminal.clear();
    terminal.write("\x1b[2J\x1b[H"); // Clear screen and move cursor to home
  },

  setupTerminalAddons(terminal: Terminal): FitAddon {
    const fitAddon = new FitAddon();
    const clipboardAddon = new ClipboardAddon();
    const webglAddon = new WebglAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(clipboardAddon);

    try {
      terminal.loadAddon(webglAddon);
    } catch (error) {
      // WebGL addon failed, continue without it
    }

    return fitAddon;
  },

  setupKeyboardHandlers(terminal: Terminal, ws: React.MutableRefObject<WebSocket | null>): void {
    terminal.attachCustomKeyEventHandler((event) => {
      // Ctrl+C or Cmd+C for copy (when text is selected)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "c" &&
        terminal.hasSelection()
      ) {
        document.execCommand("copy");
        return false;
      }

      // Ctrl+V or Cmd+V for paste
      if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        navigator.clipboard
          .readText()
          .then((text) => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
              ws.current.send(
                JSON.stringify({
                  type: "input",
                  data: text,
                } as InputPayload)
              );
            }
          })
          .catch((err) => {
            // Failed to read clipboard
          });
        return false;
      }

      return true;
    });
  },

  setupDataHandler(terminal: Terminal, ws: React.MutableRefObject<WebSocket | null>): void {
    terminal.onData((data) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "input",
            data: data,
          } as InputPayload)
        );
      }
    });
  },

  // WebSocket utilities
  async getWebSocketUrl(): Promise<string> {
    try {
      const configResponse = await fetch("/api/config");
      const config = await configResponse.json();
      let wsBaseUrl = config.wsUrl;

      // If the config returns localhost but we're not on localhost, use current host but with API server port
      if (
        wsBaseUrl.includes("localhost") &&
        !window.location.hostname.includes("localhost")
      ) {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const apiPort = window.location.port === "3001" ? "3002" : window.location.port;
        wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
      }

      return `${wsBaseUrl}/shell`;
    } catch (error) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const apiPort = window.location.port === "3001" ? "3002" : window.location.port;
      const wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
      return `${wsBaseUrl}/shell`;
    }
  },

  createInitPayload(
    selectedProject: Project | null,
    selectedSession: Session | null
  ): InitPayload {
    return {
      type: "init",
      projectPath: selectedProject?.fullPath,
      sessionId: selectedSession?.id,
      hasSession: !!selectedSession,
    };
  },

  processMessage(data: WebSocketMessage, terminal: Terminal): void {
    if (data.type === "output") {
      // Check for URLs in the output and make them clickable
      const urlRegex = /(https?:\/\/[^\s\x1b\x07]+)/g;
      const output = data.data || "";

      // Find URLs in the text (excluding ANSI escape sequences)
      const urls = [];
      let match;
      while (
        (match = urlRegex.exec(output.replace(/\x1b\[[0-9;]*m/g, ""))) !== null
      ) {
        urls.push(match[1]);
      }

      terminal.write(output);
    } else if (data.type === "url_open") {
      // Handle explicit URL opening requests from server
      if (data.url) {
        window.open(data.url, "_blank");
      }
    }
  },

  // Cleanup utilities
  disposeTerminal(terminal: Terminal): void {
    terminal.dispose();
  },

  closeWebSocket(ws: WebSocket): void {
    ws.close();
  }
};
