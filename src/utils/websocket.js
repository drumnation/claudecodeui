import { useState, useEffect, useRef } from 'react';
import { createLogger } from '@kit/logger/browser';

const logger = createLogger({ scope: 'websocket-utils' });

export function useWebSocket() {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const connect = async () => {
    try {
      // Fetch server configuration to get the correct WebSocket URL
      let wsBaseUrl;
      try {
        const configResponse = await fetch('/api/config');
        const config = await configResponse.json();
        wsBaseUrl = config.wsUrl;
        
        // If the config returns localhost but we're not on localhost, use current host but with API server port
        if (wsBaseUrl.includes('localhost') && !window.location.hostname.includes('localhost')) {
          logger.warn('Config returned localhost, using current host with API server port instead', {
            configUrl: wsBaseUrl,
            currentHost: window.location.hostname,
            currentPort: window.location.port
          });
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          // For development, API server is typically on port 8765 when Vite is on 8766
          const apiPort = window.location.port === '8766' ? '8765' : window.location.port;
          wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
        }
      } catch (error) {
        logger.warn('Could not fetch server config, falling back to current host with API server port', {
          error,
          fallbackProtocol: window.location.protocol === 'https:' ? 'wss:' : 'ws:',
          currentHost: window.location.hostname,
          currentPort: window.location.port
        });
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // For development, API server is typically on port 8765 when Vite is on 8766
        const apiPort = window.location.port === '8766' ? '8765' : window.location.port;
        wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
      }
      
      const wsUrl = `${wsBaseUrl}/ws`;
      if (logger.isLevelEnabled('debug')) {
        logger.debug('Attempting WebSocket connection', { url: wsUrl });
      }
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        if (logger.isLevelEnabled('debug')) {
          logger.debug('WebSocket connection established', { url: wsUrl });
        }
        setIsConnected(true);
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, data]);
        } catch (error) {
          logger.error('Error parsing WebSocket message', {
            error,
            rawMessage: event.data,
            type: event.type
          });
        }
      };

      websocket.onclose = (event) => {
        if (logger.isLevelEnabled('debug')) {
          logger.debug('WebSocket connection closed', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
        }
        setIsConnected(false);
        setWs(null);
        
        // Attempt to reconnect after 3 seconds
        if (logger.isLevelEnabled('trace')) {
          logger.trace('Scheduling reconnection attempt', { delayMs: 3000 });
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      websocket.onerror = (error) => {
        logger.error('WebSocket error', {
          error,
          readyState: websocket.readyState,
          url: wsUrl
        });
      };

    } catch (error) {
      logger.error('Error creating WebSocket connection', {
        error,
        stack: error.stack
      });
    }
  };

  const sendMessage = (message) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(message));
    } else {
      logger.warn('Cannot send message - WebSocket not connected', {
        isConnected,
        wsExists: !!ws,
        messageType: message?.type
      });
    }
  };

  return {
    ws,
    sendMessage,
    messages,
    isConnected
  };
}