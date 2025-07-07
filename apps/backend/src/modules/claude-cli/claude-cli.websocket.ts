import { WebSocket } from 'ws';
import { createLogger } from '@kit/logger/node';
import { ClaudeCliService, ClaudeEvent } from './claude-cli.service';
import { ClaudeCommand, AbortSession, ClaudeWebSocketMessage } from './claude-cli.types';

const logger = createLogger({ scope: 'claude-cli-websocket' });

// Track active services
const activeServices = new Map<string, ClaudeCliService>();
const sessionMessageCounts = new Map<string, number>();
const manuallyEditedSessions = new Set<string>();

export class ClaudeWebSocketHandler {
  private ws: WebSocket;
  private currentSessionId: string | null = null;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  async handleClaudeCommand(data: ClaudeCommand): Promise<void> {
    // Generate a session ID if not provided
    const sessionId = data.options?.sessionId || `session-${Date.now()}`;
    this.currentSessionId = sessionId;
    
    // Cancel any existing service for this session
    if (activeServices.has(sessionId)) {
      const service = activeServices.get(sessionId);
      if (service) {
        service.kill();
      }
      activeServices.delete(sessionId);
    }

    // Send initial status
    this.sendMessage({
      type: 'claude-status',
      status: {
        text: 'Connecting to Claude...',
        tokens: 0,
        can_interrupt: true
      }
    });

    try {
      // Create new Claude CLI service
      const service = new ClaudeCliService(sessionId);
      activeServices.set(sessionId, service);

      // Set up event handlers
      this.setupServiceHandlers(service, sessionId);

      // Start the service
      await service.start({
        command: data.command,
        cwd: data.options?.cwd,
        projectPath: data.options?.projectPath,
        sessionId: sessionId,
        resume: data.options?.resume,
        toolsSettings: data.options?.toolsSettings
      });

    } catch (error) {
      logger.error('Failed to start Claude CLI', { error });
      this.sendMessage({
        type: 'error',
        error: 'Failed to start Claude CLI'
      });
      activeServices.delete(sessionId);
    }
  }

  handleAbortSession(data: AbortSession): void {
    logger.info('Abort session requested', { sessionId: data.sessionId });
    
    // Kill any active service for this session
    if (activeServices.has(data.sessionId)) {
      const service = activeServices.get(data.sessionId);
      if (service) {
        service.kill();
      }
      activeServices.delete(data.sessionId);
    }
    
    // Send acknowledgment
    this.sendMessage({
      type: 'session-aborted',
      sessionId: data.sessionId
    });
    
    // Send stream-end to properly close the session
    this.sendMessage({
      type: 'stream-end'
    });
  }

  cleanup(): void {
    // Clean up any active services for this connection
    if (this.currentSessionId && activeServices.has(this.currentSessionId)) {
      const service = activeServices.get(this.currentSessionId);
      if (service) {
        service.kill();
      }
      activeServices.delete(this.currentSessionId);
    }
  }

  private setupServiceHandlers(service: ClaudeCliService, sessionId: string): void {
    // Handle status updates
    service.on('status', (event: ClaudeEvent) => {
      this.sendMessage({
        type: 'claude-status',
        data: event.data
      });
    });

    // Handle Claude responses (JSON format)
    service.on('claude-response', (event: ClaudeEvent) => {
      const response = event.data;
      
      // Track user messages for summary updates
      if (response?.message?.role === 'user') {
        this.trackUserMessage(sessionId);
      }
      
      this.sendMessage({
        type: 'claude-response',
        data: response
      });
    });

    // Handle raw output
    service.on('claude-output', (event: ClaudeEvent) => {
      this.sendMessage({
        type: 'claude-output',
        data: event.data
      });
    });

    // Handle interactive prompts
    service.on('interactive-prompt', (event: ClaudeEvent) => {
      this.sendMessage({
        type: 'claude-interactive-prompt',
        data: event.data,
        sessionId: event.sessionId
      });
    });

    // Handle session creation
    service.on('session-created', (event: ClaudeEvent) => {
      this.sendMessage({
        type: 'session-created',
        sessionId: event.sessionId
      });
    });

    // Handle errors
    service.on('error', (event: ClaudeEvent) => {
      this.sendMessage({
        type: 'claude-error',
        error: event.data
      });
    });

    // Handle process exit
    service.on('exit', (event: ClaudeEvent) => {
      const exitData = event.data;
      logger.info('Claude process exited', { exitData });
      
      // Clean up
      activeServices.delete(sessionId);
      sessionMessageCounts.delete(sessionId);
      manuallyEditedSessions.delete(sessionId);
      
      this.sendMessage({
        type: 'claude-complete',
        exitCode: exitData.exitCode,
        isNewSession: !this.currentSessionId && !!sessionId
      });

      // Trigger session summary generation for new sessions
      if (!this.currentSessionId && sessionId && exitData.exitCode === 0) {
        this.generateSessionSummary(sessionId);
      }
    });

    // Handle stream end
    service.on('stream-end', () => {
      this.sendMessage({
        type: 'stream-end'
      });
    });
  }

  private trackUserMessage(sessionId: string): void {
    if (!sessionId) return;
    
    const currentCount = sessionMessageCounts.get(sessionId) || 0;
    const newCount = currentCount + 1;
    sessionMessageCounts.set(sessionId, newCount);
    
    // Update summary based on configuration (skip if manually edited)
    if (!manuallyEditedSessions.has(sessionId)) {
      const updateInterval = parseInt(process.env.SESSION_SUMMARY_UPDATE_INTERVAL || '3');
      const updateDelay = parseInt(process.env.SESSION_SUMMARY_UPDATE_DELAY || '2000');
      
      if (updateInterval > 0 && newCount > 0 && newCount % updateInterval === 0) {
        logger.info('User message count reached threshold, updating session summary', { 
          sessionId, 
          messageCount: newCount 
        });
        
        // Trigger summary update in the background
        setTimeout(() => {
          this.generateSessionSummary(sessionId, true);
        }, updateDelay);
      }
    } else {
      logger.debug('Skipping auto-update for manually edited session', { sessionId });
    }
  }

  private async generateSessionSummary(sessionId: string, forceUpdate = false): Promise<void> {
    try {
      logger.info('Generating session summary', { sessionId, forceUpdate });
      
      // Get project name from session ID
      const projectName = sessionId.split('-').slice(0, -1).join('-');
      
      // TODO: Implement actual summary generation
      // This would involve:
      // 1. Fetching session messages
      // 2. Checking if summary already exists
      // 3. Generating summary using AI
      // 4. Updating session summary
      // 5. Notifying frontend
      
      logger.warn('Session summary generation not yet implemented', { sessionId });
    } catch (error) {
      logger.error('Error generating session summary', { error, sessionId });
    }
  }

  private sendMessage(message: ClaudeWebSocketMessage): void {
    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      logger.error('Failed to send WebSocket message', { error, message });
    }
  }
}

// Utility functions for manual session editing
export function markSessionAsManuallyEdited(sessionId: string): void {
  if (sessionId) {
    manuallyEditedSessions.add(sessionId);
  }
}

export function clearManualEditFlag(sessionId: string): void {
  if (sessionId) {
    manuallyEditedSessions.delete(sessionId);
  }
}