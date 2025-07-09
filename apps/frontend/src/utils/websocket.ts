import {useState, useEffect, useRef, useCallback} from 'react';
import {createLogger} from '@kit/logger/browser';

const logger = createLogger({scope: 'websocket-utils'});

// Simple WebSocket implementation - we'll use the existing logic for now
// and implement the enhanced features directly in this file
export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState('disconnected');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimeRef = useRef(Date.now());
  const messageQueueRef = useRef<any[]>([]);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Connection health monitoring
  useEffect(() => {
    const checkConnectionHealth = () => {
      const now = Date.now();
      const timeSinceLastMessage = now - lastMessageTimeRef.current;

      if (!isConnected) {
        setConnectionHealth('disconnected');
      } else if (timeSinceLastMessage > 30000) {
        setConnectionHealth('disconnected');
        // Force reconnection
        if (ws) {
          ws.close();
        }
      } else if (timeSinceLastMessage > 15000) {
        setConnectionHealth('stale');
      } else {
        setConnectionHealth('connected');
      }
    };

    healthCheckIntervalRef.current = setInterval(checkConnectionHealth, 5000);

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [isConnected, ws]);

  const connect = useCallback(async () => {
    try {
      // Fetch server configuration to get the correct WebSocket URL
      let wsBaseUrl;
      try {
        const configResponse = await fetch('/api/config');
        const config = await configResponse.json();
        wsBaseUrl = config.wsUrl;

        // If the config returns localhost but we're not on localhost, use current host but with API server port
        if (
          wsBaseUrl.includes('localhost') &&
          !window.location.hostname.includes('localhost')
        ) {
          logger.warn(
            'Config returned localhost, using current host with API server port instead',
            {
              configUrl: wsBaseUrl,
              currentHost: window.location.hostname,
              currentPort: window.location.port,
            },
          );
          const protocol =
            window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          // For development, API server is typically on port 8765 when Vite is on 8766
          const apiPort =
            window.location.port === '8766' ? '8765' : window.location.port;
          wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
        }
      } catch (error) {
        logger.warn(
          'Could not fetch server config, falling back to current host with API server port',
          {
            error,
            fallbackProtocol:
              window.location.protocol === 'https:' ? 'wss:' : 'ws:',
            currentHost: window.location.hostname,
            currentPort: window.location.port,
          },
        );
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // For development, API server is typically on port 8765 when Vite is on 8766
        const apiPort =
          window.location.port === '8766' ? '8765' : window.location.port;
        wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
      }

      const wsUrl = `${wsBaseUrl}/ws`;
      if (logger.isLevelEnabled('debug')) {
        logger.debug('Attempting WebSocket connection', {url: wsUrl});
      }
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        if (logger.isLevelEnabled('debug')) {
          logger.debug('WebSocket connection established', {url: wsUrl});
        }
        setIsConnected(true);
        setWs(websocket);
        setConnectionHealth('connected');
        lastMessageTimeRef.current = Date.now();

        // Send any queued messages
        const queue = [...messageQueueRef.current];
        messageQueueRef.current = [];
        queue.forEach((msg) => {
          try {
            websocket.send(JSON.stringify(msg));
          } catch (error) {
            logger.error('Failed to send queued message', {error});
          }
        });
      };

      websocket.onmessage = (event) => {
        lastMessageTimeRef.current = Date.now();
        try {
          const data = JSON.parse(event.data);

          // Handle heartbeat messages
          if (data.type === 'heartbeat') {
            // Update connection health but don't add to messages
            setConnectionHealth('connected');
            return;
          }

          // Handle connection health updates
          if (data.connectionHealth) {
            setConnectionHealth(data.connectionHealth);
          }

          setMessages((prev) => [...prev, data]);
        } catch (error) {
          logger.error('Error parsing WebSocket message', {
            error,
            rawMessage: event.data,
            type: event.type,
          });
        }
      };

      websocket.onclose = (event) => {
        if (logger.isLevelEnabled('debug')) {
          logger.debug('WebSocket connection closed', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
        }
        setIsConnected(false);
        setWs(null);
        setConnectionHealth('disconnected');

        // Attempt to reconnect after 3 seconds
        if (logger.isLevelEnabled('trace')) {
          logger.trace('Scheduling reconnection attempt', {delayMs: 3000});
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      websocket.onerror = (error) => {
        logger.error('WebSocket error', {
          error,
          readyState: websocket.readyState,
          url: wsUrl,
        });
      };
    } catch (error) {
      logger.error('Error creating WebSocket connection', {
        error,
        stack: (error as Error).stack,
      });
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (message: any) => {
      if (ws && isConnected) {
        try {
          ws.send(JSON.stringify(message));
          return true;
        } catch (error) {
          logger.error('Failed to send message', {error});
          // Queue the message for retry
          messageQueueRef.current.push(message);
          return false;
        }
      } else {
        logger.warn('Cannot send message - WebSocket not connected', {
          isConnected,
          wsExists: !!ws,
          messageType: message?.type,
        });
        // Queue the message for when we reconnect
        messageQueueRef.current.push(message);
        // Limit queue size
        if (messageQueueRef.current.length > 100) {
          messageQueueRef.current.shift();
        }
        return false;
      }
    },
    [ws, isConnected],
  );

  return {
    ws,
    sendMessage,
    messages,
    isConnected,
    connectionHealth,
    reconnect: () => {
      if (ws) {
        ws.close();
      }
      connect();
    },
    queueSize: messageQueueRef.current.length,
  };
}
