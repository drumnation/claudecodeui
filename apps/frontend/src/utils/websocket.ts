import { useState, useEffect, useRef } from "react";
import { createLogger } from "@kit/logger/browser";
import type { Logger } from "@kit/logger/types";

const logger: Logger = createLogger({ scope: "WebSocket" });

// WebSocket connection tracking for debugging
const wsConnectionTracker = {
  totalConnections: 0,
  connectionHistory: [] as Array<{
    id: string,
    url: string,
    connectTime: number,
    disconnectTime?: number,
    messagesSent: number,
    messagesReceived: number,
    reconnectAttempts: number
  }>,
  activeConnection: null as any
};

export interface WSMessage {
  type:
    | "ping"
    | "chat"
    | "projects_updated"
    | "session-summary-updated"
    | "session_history"
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
    | "claude-status"
    | "load_session"
    | "user_message";
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
  const connectionIdRef = useRef<string | null>(null);
  const messageCountRef = useRef({ sent: 0, received: 0 });
  const reconnectAttemptsRef = useRef(0);

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
      const connectStartTime = Date.now();
      
      // Create connection tracking ID
      const connectionId = `ws-${connectStartTime}-${Math.random().toString(36).substr(2, 9)}`;
      connectionIdRef.current = connectionId;
      
      logger.info('WebSocket connection attempt starting', {
        connectionId,
        reconnectAttempt: reconnectAttemptsRef.current,
        totalConnections: wsConnectionTracker.totalConnections + 1
      });
      
      // Fetch server configuration to get the correct WebSocket URL
      let wsBaseUrl: string;
      try {
        const configResponse = await fetch("/api/config");
        const config: ServerConfig = await configResponse.json();
        wsBaseUrl = config.wsUrl;
        
        logger.debug('WebSocket config fetched', {
          connectionId,
          configUrl: wsBaseUrl,
          fetchTime: Date.now() - connectStartTime
        });

        // If the config returns localhost but we're not on localhost, use current host but with API server port
        if (
          wsBaseUrl.includes("localhost") &&
          !window.location.hostname.includes("localhost")
        ) {
          logger.warn(
            "Config returned localhost, using current host with API server port instead",
            { connectionId, originalUrl: wsBaseUrl }
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
          { connectionId }
        );
        const protocol: string =
          window.location.protocol === "https:" ? "wss:" : "ws:";
        // For development, API server is typically on port 8765 when Vite is on 8766
        const apiPort: string =
          window.location.port === "8766" ? "8765" : window.location.port;
        wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
      }

      const wsUrl = `${wsBaseUrl}/ws`;
      
      logger.info('Creating WebSocket connection', {
        connectionId,
        wsUrl,
        protocol: wsUrl.startsWith('wss') ? 'secure' : 'insecure'
      });
      
      const websocket = new WebSocket(wsUrl);
      
      // Initialize connection tracking
      wsConnectionTracker.totalConnections++;
      const connectionRecord = {
        id: connectionId,
        url: wsUrl,
        connectTime: connectStartTime,
        messagesSent: 0,
        messagesReceived: 0,
        reconnectAttempts: reconnectAttemptsRef.current
      };
      wsConnectionTracker.connectionHistory.push(connectionRecord);
      wsConnectionTracker.activeConnection = connectionRecord;
      
      // Keep only last 20 connection records for memory efficiency
      if (wsConnectionTracker.connectionHistory.length > 20) {
        wsConnectionTracker.connectionHistory = wsConnectionTracker.connectionHistory.slice(-20);
      }

      websocket.onopen = (): void => {
        const connectTime = Date.now() - connectStartTime;
        reconnectAttemptsRef.current = 0; // Reset on successful connection
        
        logger.info('WebSocket connection established', {
          connectionId,
          connectTime,
          wsUrl,
          readyState: websocket.readyState
        });
        
        setIsConnected(true);
        setWs(websocket);
        
        // Reset message counters for this connection
        messageCountRef.current = { sent: 0, received: 0 };
      };

      websocket.onmessage = (event: MessageEvent): void => {
        try {
          const data: WSMessage = JSON.parse(event.data);
          messageCountRef.current.received++;
          
          // Track message receiving in connection record
          if (wsConnectionTracker.activeConnection && wsConnectionTracker.activeConnection.id === connectionId) {
            wsConnectionTracker.activeConnection.messagesReceived = messageCountRef.current.received;
          }
          
          logger.debug('WebSocket message received', {
            connectionId,
            messageType: data.type,
            messageSize: event.data.length,
            totalReceived: messageCountRef.current.received,
            hasSessionHistory: data.type === 'session_history' && !!data.messages,
            sessionHistoryCount: data.type === 'session_history' ? data.messages?.length : undefined
          });
          
          // Detect potential session reload loops
          if (data.type === 'session_history' && data.messages?.length > 500) {
            logger.warn('Large session history received - potential reload issue', {
              connectionId,
              messageCount: data.messages.length,
              totalReceived: messageCountRef.current.received
            });
          }
          
          setMessages((prev) => [...prev, data]);
        } catch (error) {
          logger.error("Error parsing WebSocket message", { 
            error, 
            connectionId,
            messageSize: event.data?.length,
            rawData: event.data?.substring(0, 100) // First 100 chars for debugging
          });
        }
      };

      websocket.onclose = (event: CloseEvent): void => {
        const disconnectTime = Date.now();
        const connectionDuration = disconnectTime - connectStartTime;
        
        logger.info('WebSocket connection closed', {
          connectionId,
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          connectionDuration,
          messagesSent: messageCountRef.current.sent,
          messagesReceived: messageCountRef.current.received
        });
        
        // Update connection record
        if (wsConnectionTracker.activeConnection && wsConnectionTracker.activeConnection.id === connectionId) {
          wsConnectionTracker.activeConnection.disconnectTime = disconnectTime;
        }
        
        setIsConnected(false);
        setWs(null);
        
        // Only reconnect if this wasn't a clean close or if we haven't tried too many times
        if (!event.wasClean || reconnectAttemptsRef.current < 10) {
          reconnectAttemptsRef.current++;
          const reconnectDelay = Math.min(3000 * reconnectAttemptsRef.current, 30000); // Exponential backoff up to 30s
          
          logger.info('Scheduling WebSocket reconnection', {
            connectionId,
            reconnectAttempt: reconnectAttemptsRef.current,
            reconnectDelay
          });

          // Attempt to reconnect with exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            void connect();
          }, reconnectDelay);
        } else {
          logger.warn('Max reconnection attempts reached, giving up', {
            connectionId,
            maxAttempts: reconnectAttemptsRef.current
          });
        }
      };

      websocket.onerror = (error: Event): void => {
        logger.error("WebSocket connection error", { 
          error,
          connectionId,
          readyState: websocket.readyState,
          url: wsUrl,
          connectionAge: Date.now() - connectStartTime
        });
      };
    } catch (error) {
      logger.error("Error creating WebSocket connection", { error });
    }
  };

  const sendMessage = (message: WSMessage): void => {
    if (ws && isConnected) {
      messageCountRef.current.sent++;
      
      // Track message sending in connection record
      if (wsConnectionTracker.activeConnection && connectionIdRef.current) {
        wsConnectionTracker.activeConnection.messagesSent = messageCountRef.current.sent;
      }
      
      logger.debug('WebSocket message sent', {
        connectionId: connectionIdRef.current,
        messageType: message.type,
        totalSent: messageCountRef.current.sent,
        readyState: ws.readyState
      });
      
      ws.send(JSON.stringify(message));
    } else {
      logger.warn("WebSocket not connected - message queued or dropped", {
        messageType: message.type,
        connectionId: connectionIdRef.current,
        isConnected,
        hasWebSocket: !!ws,
        readyState: ws?.readyState
      });
    }
  };

  // Add debugging hooks to window for DevTools inspection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__debugWebSocket = () => {
        return {
          connectionTracker: wsConnectionTracker,
          currentConnection: {
            id: connectionIdRef.current,
            isConnected,
            readyState: ws?.readyState,
            messagesSent: messageCountRef.current.sent,
            messagesReceived: messageCountRef.current.received,
            reconnectAttempts: reconnectAttemptsRef.current
          },
          totalMessages: messages.length,
          recentMessages: messages.slice(-5).map(m => ({ type: m.type, timestamp: Date.now() }))
        };
      };
    }
  }, [ws, isConnected, messages]);

  return {
    ws,
    sendMessage,
    messages,
    isConnected,
  };
}
