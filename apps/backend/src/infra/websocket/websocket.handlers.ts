import type {WebSocket} from 'ws';
import type {IncomingMessage} from 'http';
import type {ExtendedWebSocket} from './websocket.types.js';
import type {Logger} from '@kit/logger/types';

export type ConnectionHandler = (
  ws: WebSocket,
  request: IncomingMessage,
) => void;

// Track WebSocket connections for debugging
const connectionTracker = {
  activeConnections: new Map<string, {
    sessionId: string,
    url: string,
    connectTime: number,
    messageCount: number,
    lastActivity: number
  }>(),
  totalConnections: 0,
  connectionHistory: [] as Array<{
    sessionId: string,
    url: string,
    connectTime: number,
    disconnectTime?: number,
    duration?: number,
    messageCount: number
  }>
};

export const createConnectionRouter = (
  handlers: Map<string, ConnectionHandler>,
  logger: Logger,
): ConnectionHandler => {
  return (ws: WebSocket, request: IncomingMessage) => {
    const url = request.url;
    const now = Date.now();
    
    // Create a session ID for this WebSocket connection
    const sessionId = `ws-${now}-${Math.random().toString(36).substr(2, 9)}`;
    const sessionLogger = logger.child({ sessionId, path: url });
    
    // Track connection for debugging
    connectionTracker.totalConnections++;
    const connectionInfo = {
      sessionId,
      url: url || 'unknown',
      connectTime: now,
      messageCount: 0,
      lastActivity: now
    };
    connectionTracker.activeConnections.set(sessionId, connectionInfo);
    
    // Log detailed connection information
    sessionLogger.info('WebSocket client connected', { 
      url,
      sessionId,
      totalActiveConnections: connectionTracker.activeConnections.size,
      totalConnections: connectionTracker.totalConnections,
      clientIP: request.socket.remoteAddress,
      userAgent: request.headers['user-agent']?.substring(0, 100)
    });
    
    // Enhanced WebSocket event logging
    const originalSend = ws.send.bind(ws);
    ws.send = function(data: any, options?: any, callback?: any) {
      const connection = connectionTracker.activeConnections.get(sessionId);
      if (connection) {
        connection.messageCount++;
        connection.lastActivity = Date.now();
      }
      
      sessionLogger.debug('WebSocket message sent', {
        sessionId,
        messageSize: typeof data === 'string' ? data.length : 'binary',
        totalMessages: connection?.messageCount || 0
      });
      
      return originalSend(data, options, callback);
    };
    
    // Track incoming messages
    ws.on('message', (data: any) => {
      const connection = connectionTracker.activeConnections.get(sessionId);
      if (connection) {
        connection.messageCount++;
        connection.lastActivity = Date.now();
      }
      
      sessionLogger.debug('WebSocket message received', {
        sessionId,
        messageSize: data.length,
        totalMessages: connection?.messageCount || 0,
        timeSinceConnect: Date.now() - (connection?.connectTime || now)
      });
    });
    
    // Enhanced disconnect tracking
    ws.on('close', (code: number, reason: string) => {
      const disconnectTime = Date.now();
      const connection = connectionTracker.activeConnections.get(sessionId);
      
      if (connection) {
        const duration = disconnectTime - connection.connectTime;
        
        sessionLogger.info('WebSocket client disconnected', {
          sessionId,
          code,
          reason: reason.toString(),
          duration,
          messageCount: connection.messageCount,
          averageMessageRate: connection.messageCount > 0 
            ? (duration / connection.messageCount).toFixed(2) + 'ms/msg'
            : '0 msg/s'
        });
        
        // Move to history and clean up active connections
        connectionTracker.connectionHistory.push({
          ...connection,
          disconnectTime,
          duration
        });
        
        // Keep only last 50 connection records for memory efficiency
        if (connectionTracker.connectionHistory.length > 50) {
          connectionTracker.connectionHistory = connectionTracker.connectionHistory.slice(-50);
        }
        
        connectionTracker.activeConnections.delete(sessionId);
      }
    });
    
    // Track connection errors
    ws.on('error', (error: Error) => {
      sessionLogger.error('WebSocket connection error', {
        sessionId,
        error: error.message,
        stack: error.stack,
        connectionAge: Date.now() - now
      });
    });

    const handler = handlers.get(url || '');
    if (handler) {
      // Attach the enhanced session logger to the WebSocket for use in handlers
      (ws as any).logger = sessionLogger;
      (ws as any).sessionId = sessionId;
      
      sessionLogger.debug('WebSocket handler attached', {
        sessionId,
        handlerPath: url,
        availableHandlers: Array.from(handlers.keys())
      });
      
      handler(ws, request);
    } else {
      sessionLogger.warn('Unknown WebSocket path - closing connection', { 
        url,
        availableHandlers: Array.from(handlers.keys()),
        totalActiveConnections: connectionTracker.activeConnections.size
      });
      ws.close(4404, 'Path not found');
    }
  };
};
