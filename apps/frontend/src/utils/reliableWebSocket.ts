import {useState, useEffect, useRef, useCallback} from 'react';

const CONNECTION_HEALTH = {
  CONNECTED: 'connected',
  STALE: 'stale',
  DISCONNECTED: 'disconnected',
} as const;

const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialRetryDelay: 1000,
  maxRetryDelay: 30000,
  backoffMultiplier: 2,
  heartbeatTimeout: 30000,
  staleConnectionThreshold: 15000,
  messageQueueSize: 100,
};

interface ReliableWebSocketOptions {
  maxRetries?: number;
  initialRetryDelay?: number;
  maxRetryDelay?: number;
  backoffMultiplier?: number;
  heartbeatTimeout?: number;
  staleConnectionThreshold?: number;
  messageQueueSize?: number;
  sessionId?: string;
  onOpen?: () => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
  onReconnect?: () => void;
  onHealthChange?: (health: string) => void;
}

interface QueuedMessage {
  message: any;
  timestamp: number;
  retryCount: number;
}

export function useReliableWebSocket(
  url: string,
  options: ReliableWebSocketOptions = {},
) {
  const [connectionHealth, setConnectionHealth] = useState(
    CONNECTION_HEALTH.DISCONNECTED,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const configRef = useRef({...DEFAULT_CONFIG, ...options});
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const lastMessageTimestampRef = useRef(0);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const missedMessagesRequestedRef = useRef(false);

  // Callback refs for event handlers
  const onOpenRef = useRef(options.onOpen);
  const onMessageRef = useRef(options.onMessage);
  const onErrorRef = useRef(options.onError);
  const onCloseRef = useRef(options.onClose);
  const onReconnectRef = useRef(options.onReconnect);
  const onHealthChangeRef = useRef(options.onHealthChange);

  // Update callback refs when they change
  useEffect(() => {
    onOpenRef.current = options.onOpen;
    onMessageRef.current = options.onMessage;
    onErrorRef.current = options.onError;
    onCloseRef.current = options.onClose;
    onReconnectRef.current = options.onReconnect;
    onHealthChangeRef.current = options.onHealthChange;
  }, [
    options.onOpen,
    options.onMessage,
    options.onError,
    options.onClose,
    options.onReconnect,
    options.onHealthChange,
  ]);

  // Send a message with buffering when disconnected
  const sendBufferedMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          typeof message === 'string' ? message : JSON.stringify(message),
        );
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }

    // Queue message if not connected
    messageQueueRef.current.push({
      message,
      timestamp: Date.now(),
      retryCount: 0,
    });

    // Limit queue size
    if (messageQueueRef.current.length > configRef.current.messageQueueSize) {
      messageQueueRef.current.shift();
    }

    return false;
  }, []);

  // Handle heartbeat/ping messages
  const handleHeartbeat = useCallback(
    (data: any) => {
      lastMessageTimestampRef.current = Date.now();

      // Reset heartbeat timeout
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }

      // Send pong response if needed
      if (data.requiresPong) {
        sendBufferedMessage({
          type: 'pong',
          timestamp: Date.now(),
        });
      }

      // Update connection health based on heartbeat data
      if (data.connectionHealth) {
        updateConnectionHealth(data.connectionHealth);
      } else {
        updateConnectionHealth(CONNECTION_HEALTH.CONNECTED);
      }

      // Set new heartbeat timeout
      heartbeatTimeoutRef.current = setTimeout(() => {
        detectStaleConnection();
      }, configRef.current.heartbeatTimeout);
    },
    [sendBufferedMessage],
  );

  // Request missed messages after reconnection
  const requestMissedMessages = useCallback(() => {
    if (!options.sessionId || missedMessagesRequestedRef.current) {
      return;
    }

    const lastTimestamp = lastMessageTimestampRef.current;

    sendBufferedMessage({
      type: 'reconnect-request',
      sessionId: options.sessionId,
      lastTimestamp: lastTimestamp > 0 ? lastTimestamp : undefined,
    });

    missedMessagesRequestedRef.current = true;
  }, [options.sessionId, sendBufferedMessage]);

  // Detect stale connection
  const detectStaleConnection = useCallback(() => {
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTimestampRef.current;

    if (timeSinceLastMessage > configRef.current.staleConnectionThreshold * 2) {
      updateConnectionHealth(CONNECTION_HEALTH.DISCONNECTED);
      // Force reconnection
      if (wsRef.current) {
        wsRef.current.close();
      }
    } else if (
      timeSinceLastMessage > configRef.current.staleConnectionThreshold
    ) {
      updateConnectionHealth(CONNECTION_HEALTH.STALE);
    }
  }, []);

  // Update connection health state
  const updateConnectionHealth = useCallback(
    (health: any) => {
      if (connectionHealth !== health) {
        setConnectionHealth(health);
        if (onHealthChangeRef.current) {
          onHealthChangeRef.current(health);
        }
      }
    },
    [connectionHealth],
  );

  // Flush message queue after connection
  const flushQueue = useCallback(() => {
    const queue = [...messageQueueRef.current];
    messageQueueRef.current = [];

    queue.forEach(({message}) => {
      sendBufferedMessage(message);
    });
  }, [sendBufferedMessage]);

  // Connect with exponential backoff
  const connect = useCallback(
    function connectWebSocket() {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

      try {
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setRetryCount(0);
          updateConnectionHealth(CONNECTION_HEALTH.CONNECTED);
          lastMessageTimestampRef.current = Date.now();

          // Request missed messages on reconnection
          if (retryCount > 0) {
            requestMissedMessages();
          }

          // Flush queued messages
          setTimeout(() => {
            flushQueue();
          }, 100);

          // Notify callback
          if (onOpenRef.current) {
            onOpenRef.current();
          }

          // Notify reconnection
          if (retryCount > 0 && onReconnectRef.current) {
            onReconnectRef.current();
          }
        };

        wsRef.current.onmessage = (event: MessageEvent) => {
          lastMessageTimestampRef.current = Date.now();

          try {
            const data = JSON.parse(event.data);

            // Handle heartbeat messages
            if (data.type === 'heartbeat') {
              handleHeartbeat(data);
              return;
            }

            // Handle reliable message wrapper
            if (data.type === 'reliable_message') {
              // Process the actual message
              if (onMessageRef.current) {
                onMessageRef.current({
                  ...event,
                  data: JSON.stringify(data.data),
                } as MessageEvent);
              }
              return;
            }

            // Regular message
            if (onMessageRef.current) {
              onMessageRef.current(event);
            }
          } catch (_error) {
            // Non-JSON message
            if (onMessageRef.current) {
              onMessageRef.current(event);
            }
          }
        };

        wsRef.current.onerror = (error: Event) => {
          console.error('WebSocket error:', error);
          if (onErrorRef.current) {
            onErrorRef.current(error);
          }
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket closed');
          setIsConnected(false);
          updateConnectionHealth(CONNECTION_HEALTH.DISCONNECTED);
          missedMessagesRequestedRef.current = false;

          // Clear heartbeat timeout
          if (heartbeatTimeoutRef.current) {
            clearTimeout(heartbeatTimeoutRef.current);
            heartbeatTimeoutRef.current = null;
          }

          if (onCloseRef.current) {
            onCloseRef.current();
          }

          // Reconnect with exponential backoff
          if (retryCount < configRef.current.maxRetries) {
            const delay = Math.min(
              configRef.current.initialRetryDelay *
                Math.pow(configRef.current.backoffMultiplier, retryCount),
              configRef.current.maxRetryDelay,
            );

            console.log(
              `Reconnecting in ${delay}ms (attempt ${retryCount + 1}/${configRef.current.maxRetries})`,
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              connectWebSocket();
            }, delay);
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        updateConnectionHealth(CONNECTION_HEALTH.DISCONNECTED);
      }
    },
    [
      url,
      retryCount,
      handleHeartbeat,
      requestMissedMessages,
      flushQueue,
      updateConnectionHealth,
    ],
  );

  // Initial connection
  useEffect(() => {
    connect();

    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Public API
  return {
    sendMessage: sendBufferedMessage,
    isConnected,
    connectionHealth,
    retryCount,
    queueSize: messageQueueRef.current.length,
    reconnect: () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      setRetryCount(0);
      connect();
    },
    close: () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    },
  };
}
