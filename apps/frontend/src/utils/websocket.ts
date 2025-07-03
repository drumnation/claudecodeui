import { useState, useEffect, useRef } from "react";
import { createLogger } from "@kit/logger/browser";
import type { Logger } from "@kit/logger/types";

const logger: Logger = createLogger({ scope: "WebSocket" });

export interface WSMessage {
  type:
    | "ping"
    | "chat"
    | "projects_updated"
    | "session-summary-updated"
    | "server:scripts"
    | "server:status"
    | "server:start"
    | "server:stop"
    | "server:error"
    | "server:log"
    | "claude-command"
    | "abort-session"
    | "session-created"
    | "claude-response"
    | "claude-tool-use"
    | "claude-tool-result"
    | "claude-error"
    | "claude-cancel"
    | "claude-debug"
    | "claude-interactive"
    | "speech-end"
    | "claude-output"
    | "claude-interactive-prompt"
    | "claude-complete"
    | "session-aborted"
    | "claude-status";
  data?: any;
  [key: string]: any;
}

export interface ServerConfig {
  wsUrl: string;
}

export interface WebSocketHook {
  ws: WebSocket | null;
  sendMessage: (message: WSMessage) => void;
  messages: WSMessage[];
  isConnected: boolean;
}

export function useWebSocket(): WebSocketHook {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    void connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const connect = async (): Promise<void> => {
    try {
      // Fetch server configuration to get the correct WebSocket URL
      let wsBaseUrl: string;
      try {
        const configResponse = await fetch("/api/config");
        const config: ServerConfig = await configResponse.json();
        wsBaseUrl = config.wsUrl;

        // If the config returns localhost but we're not on localhost, use current host but with API server port
        if (
          wsBaseUrl.includes("localhost") &&
          !window.location.hostname.includes("localhost")
        ) {
          logger.warn(
            "Config returned localhost, using current host with API server port instead",
          );
          const protocol: string =
            window.location.protocol === "https:" ? "wss:" : "ws:";
          // For development, API server is typically on port 8765 when Vite is on 8766
          const apiPort: string =
            window.location.port === "8766" ? "8765" : window.location.port;
          wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
        }
      } catch {
        logger.warn(
          "Could not fetch server config, falling back to current host with API server port",
        );
        const protocol: string =
          window.location.protocol === "https:" ? "wss:" : "ws:";
        // For development, API server is typically on port 8765 when Vite is on 8766
        const apiPort: string =
          window.location.port === "8766" ? "8765" : window.location.port;
        wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
      }

      const wsUrl = `${wsBaseUrl}/ws`;
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = (): void => {
        setIsConnected(true);
        setWs(websocket);
      };

      websocket.onmessage = (event: MessageEvent): void => {
        try {
          const data: WSMessage = JSON.parse(event.data);
          setMessages((prev) => [...prev, data]);
        } catch (error) {
          logger.error("Error parsing WebSocket message", { error });
        }
      };

      websocket.onclose = (): void => {
        setIsConnected(false);
        setWs(null);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          void connect();
        }, 3000);
      };

      websocket.onerror = (error: Event): void => {
        logger.error("WebSocket error", { error });
      };
    } catch (error) {
      logger.error("Error creating WebSocket connection", { error });
    }
  };

  const sendMessage = (message: WSMessage): void => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(message));
    } else {
      logger.warn("WebSocket not connected");
    }
  };

  return {
    ws,
    sendMessage,
    messages,
    isConnected,
  };
}
