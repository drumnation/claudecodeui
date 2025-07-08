import { EventEmitter } from 'events';
import { createLogger } from '@kit/logger/node';
import { StatusEnvelope, createStatusEnvelope, Phase } from '../types/status';

const logger = createLogger({ scope: 'heartbeat-manager' });

export interface HeartbeatOptions {
  interval?: number;
  minInterval?: number;
  maxInterval?: number;
  adaptiveInterval?: boolean;
  pingTimeout?: number;
}

export interface HeartbeatStatus {
  isActive: boolean;
  lastHeartbeat: number;
  missedHeartbeats: number;
  interval: number;
}

export class HeartbeatManager extends EventEmitter {
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private lastHeartbeat: number = 0;
  private missedHeartbeats: number = 0;
  private cachedStatus: StatusEnvelope | null = null;
  private options: Required<HeartbeatOptions>;
  private currentInterval: number;
  
  constructor(options: HeartbeatOptions = {}) {
    super();
    this.options = {
      interval: options.interval ?? 5000,
      minInterval: options.minInterval ?? 5000,
      maxInterval: options.maxInterval ?? 10000,
      adaptiveInterval: options.adaptiveInterval ?? true,
      pingTimeout: options.pingTimeout ?? 30000
    };
    this.currentInterval = this.options.interval;
  }
  
  /**
   * Start the heartbeat when CLI becomes active
   */
  startHeartbeat(initialStatus?: StatusEnvelope): void {
    if (this.isActive) {
      logger.debug('Heartbeat already active');
      return;
    }
    
    this.isActive = true;
    this.lastHeartbeat = Date.now();
    this.missedHeartbeats = 0;
    
    if (initialStatus) {
      this.cachedStatus = initialStatus;
    }
    
    logger.info('Starting heartbeat', { interval: this.currentInterval });
    this.scheduleNextHeartbeat();
    
    // Start ping timer for connection health monitoring
    this.startPingTimer();
  }
  
  /**
   * Stop the heartbeat when CLI completes or disconnects
   */
  stopHeartbeat(): void {
    if (!this.isActive) {
      return;
    }
    
    this.isActive = false;
    
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.pingTimer) {
      clearTimeout(this.pingTimer);
      this.pingTimer = null;
    }
    
    logger.info('Heartbeat stopped');
    this.emit('heartbeat:stopped');
  }
  
  /**
   * Emit heartbeat with cached status
   */
  private emitHeartbeat(): void {
    if (!this.isActive) {
      return;
    }
    
    const heartbeatData = createStatusEnvelope({
      ...(this.cachedStatus || {}),
      timestamp: Date.now(),
      phase: this.cachedStatus?.phase || Phase.PROCESSING,
      message: this.cachedStatus?.message || 'Processing...'
    });
    
    // Add heartbeat metadata
    const heartbeat = {
      type: 'heartbeat',
      data: heartbeatData,
      sequence: this.lastHeartbeat,
      interval: this.currentInterval
    };
    
    this.lastHeartbeat = Date.now();
    logger.debug('Emitting heartbeat', { sequence: heartbeat.sequence });
    
    this.emit('heartbeat', heartbeat);
    
    // Adapt interval based on activity
    if (this.options.adaptiveInterval) {
      this.adaptInterval();
    }
    
    this.scheduleNextHeartbeat();
  }
  
  /**
   * Update the cached status for heartbeat emission
   */
  updateCachedStatus(status: StatusEnvelope): void {
    this.cachedStatus = status;
    this.missedHeartbeats = 0; // Reset on activity
    
    // If we receive a status update, we might want to speed up heartbeats temporarily
    if (this.options.adaptiveInterval && this.currentInterval > this.options.minInterval) {
      this.currentInterval = this.options.minInterval;
      
      // Reschedule if we have a pending heartbeat
      if (this.heartbeatTimer) {
        clearTimeout(this.heartbeatTimer);
        this.scheduleNextHeartbeat();
      }
    }
  }
  
  /**
   * Handle ping response for connection health
   */
  handlePong(): void {
    this.missedHeartbeats = 0;
    this.emit('pong');
    
    // Restart ping timer
    if (this.isActive) {
      this.startPingTimer();
    }
  }
  
  /**
   * Get current heartbeat status
   */
  getStatus(): HeartbeatStatus {
    return {
      isActive: this.isActive,
      lastHeartbeat: this.lastHeartbeat,
      missedHeartbeats: this.missedHeartbeats,
      interval: this.currentInterval
    };
  }
  
  /**
   * Force an immediate heartbeat
   */
  forceHeartbeat(): void {
    if (!this.isActive) {
      return;
    }
    
    // Clear existing timer
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
    }
    
    // Emit immediately
    this.emitHeartbeat();
  }
  
  private scheduleNextHeartbeat(): void {
    if (!this.isActive) {
      return;
    }
    
    this.heartbeatTimer = setTimeout(() => {
      this.emitHeartbeat();
    }, this.currentInterval);
  }
  
  private startPingTimer(): void {
    if (this.pingTimer) {
      clearTimeout(this.pingTimer);
    }
    
    this.pingTimer = setTimeout(() => {
      this.missedHeartbeats++;
      logger.warn('Ping timeout, possible connection issue', { 
        missedHeartbeats: this.missedHeartbeats 
      });
      
      this.emit('ping:timeout', { missedHeartbeats: this.missedHeartbeats });
      
      // Restart timer for next check
      if (this.isActive) {
        this.startPingTimer();
      }
    }, this.options.pingTimeout);
  }
  
  private adaptInterval(): void {
    // If we haven't had activity recently, slow down heartbeats
    const timeSinceLastUpdate = this.cachedStatus 
      ? Date.now() - this.cachedStatus.timestamp 
      : Infinity;
    
    if (timeSinceLastUpdate > 30000) {
      // No updates for 30s, use max interval
      this.currentInterval = this.options.maxInterval;
    } else if (timeSinceLastUpdate > 15000) {
      // No updates for 15s, use medium interval
      this.currentInterval = (this.options.minInterval + this.options.maxInterval) / 2;
    } else {
      // Recent activity, use min interval
      this.currentInterval = this.options.minInterval;
    }
  }
}

/**
 * Factory function to create a heartbeat manager
 */
export function createHeartbeatManager(options?: HeartbeatOptions): HeartbeatManager {
  return new HeartbeatManager(options);
}