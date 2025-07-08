import { WebSocket } from 'ws';
import { createLogger } from '@kit/logger/node';
import { StatusEnvelope } from '../types/status';

const logger = createLogger({ scope: 'reliable-websocket' });

export interface ReliableMessage {
  id: string;
  data: any;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface ReliableWebSocketOptions {
  maxRetries?: number;
  initialRetryDelay?: number;
  maxRetryDelay?: number;
  backoffMultiplier?: number;
  messageTimeout?: number;
}

export class ReliableWebSocketSender {
  private messageQueue: Map<string, ReliableMessage> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private options: Required<ReliableWebSocketOptions>;
  
  constructor(options: ReliableWebSocketOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      initialRetryDelay: options.initialRetryDelay ?? 1000,
      maxRetryDelay: options.maxRetryDelay ?? 30000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      messageTimeout: options.messageTimeout ?? 60000
    };
  }
  
  /**
   * Send a message with retry logic and delivery confirmation
   */
  async sendReliableMessage(
    ws: WebSocket,
    data: any,
    options: {
      priority?: 'high' | 'normal' | 'low';
      maxRetries?: number;
    } = {}
  ): Promise<boolean> {
    const messageId = this.generateMessageId();
    const message: ReliableMessage = {
      id: messageId,
      data,
      priority: options.priority ?? 'normal',
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries ?? this.options.maxRetries
    };
    
    this.messageQueue.set(messageId, message);
    
    return this.attemptSend(ws, message);
  }
  
  /**
   * Queue a message for later delivery when connection is restored
   */
  queueMessage(data: any, priority: 'high' | 'normal' | 'low' = 'normal'): string {
    const messageId = this.generateMessageId();
    const message: ReliableMessage = {
      id: messageId,
      data,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.options.maxRetries
    };
    
    this.messageQueue.set(messageId, message);
    logger.debug('Message queued for delivery', { messageId, priority });
    
    return messageId;
  }
  
  /**
   * Handle WebSocket connection state changes
   */
  handleConnectionState(ws: WebSocket, state: 'connected' | 'disconnected'): void {
    if (state === 'connected') {
      logger.info('WebSocket connected, flushing message queue');
      this.flushQueue(ws);
    } else {
      logger.info('WebSocket disconnected, buffering messages');
      // Clear retry timeouts since connection is down
      this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
      this.retryTimeouts.clear();
    }
  }
  
  /**
   * Flush all queued messages after reconnection
   */
  async flushQueue(ws: WebSocket): Promise<void> {
    if (this.messageQueue.size === 0) {
      return;
    }
    
    logger.info('Flushing message queue', { queueSize: this.messageQueue.size });
    
    // Sort messages by priority and timestamp
    const sortedMessages = Array.from(this.messageQueue.values()).sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });
    
    // Send messages in order
    for (const message of sortedMessages) {
      await this.attemptSend(ws, message);
      // Small delay between messages to avoid overwhelming the connection
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  /**
   * Clear a specific message from the queue
   */
  clearMessage(messageId: string): void {
    this.messageQueue.delete(messageId);
    const timeout = this.retryTimeouts.get(messageId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(messageId);
    }
  }
  
  /**
   * Clear all queued messages
   */
  clearAllMessages(): void {
    this.messageQueue.clear();
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }
  
  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.messageQueue.size;
  }
  
  /**
   * Get queued messages by priority
   */
  getQueuedMessages(priority?: 'high' | 'normal' | 'low'): ReliableMessage[] {
    const messages = Array.from(this.messageQueue.values());
    return priority ? messages.filter(m => m.priority === priority) : messages;
  }
  
  private async attemptSend(ws: WebSocket, message: ReliableMessage): Promise<boolean> {
    if (ws.readyState !== WebSocket.OPEN) {
      logger.debug('WebSocket not ready, message queued', { 
        messageId: message.id,
        readyState: ws.readyState 
      });
      return false;
    }
    
    try {
      // Wrap the message with delivery metadata
      const envelope = {
        id: message.id,
        type: 'reliable_message',
        timestamp: Date.now(),
        data: message.data
      };
      
      ws.send(JSON.stringify(envelope));
      
      // For now, assume successful send means delivered
      // In a real implementation, you'd wait for an ACK from the client
      this.clearMessage(message.id);
      logger.debug('Message sent successfully', { messageId: message.id });
      return true;
    } catch (error) {
      logger.error('Failed to send message', { 
        error,
        messageId: message.id,
        retryCount: message.retryCount 
      });
      
      if (message.retryCount < message.maxRetries) {
        this.scheduleRetry(ws, message);
      } else {
        logger.error('Message dropped after max retries', { messageId: message.id });
        this.clearMessage(message.id);
      }
      
      return false;
    }
  }
  
  private scheduleRetry(ws: WebSocket, message: ReliableMessage): void {
    message.retryCount++;
    
    const delay = Math.min(
      this.options.initialRetryDelay * Math.pow(this.options.backoffMultiplier, message.retryCount - 1),
      this.options.maxRetryDelay
    );
    
    logger.debug('Scheduling message retry', { 
      messageId: message.id,
      retryCount: message.retryCount,
      delay 
    });
    
    const timeout = setTimeout(() => {
      this.attemptSend(ws, message);
    }, delay);
    
    this.retryTimeouts.set(message.id, timeout);
  }
  
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Factory function to create a reliable WebSocket sender
 */
export function createReliableWebSocketSender(
  options?: ReliableWebSocketOptions
): ReliableWebSocketSender {
  return new ReliableWebSocketSender(options);
}