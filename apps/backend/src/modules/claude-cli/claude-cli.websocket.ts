import { WebSocket } from 'ws';
import { createLogger } from '@kit/logger/node';
import { ClaudeCliService, ClaudeEvent } from './claude-cli.service';
import { ClaudeCommand, AbortSession, ClaudeWebSocketMessage } from './claude-cli.types';
import { sessionsService } from '../sessions/sessions.service';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

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
    // Add 'ui-' prefix for sessions created through the web UI
    const sessionId = data.options?.sessionId || `ui-session-${Date.now()}`;
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
      
      // Find the project path by searching for the session file
      const projectsPath = path.join(os.homedir(), '.claude', 'projects');
      let projectPath: string | null = null;
      let projectName: string | null = null;
      
      // Search for the session file in all projects
      const projectDirs = await fs.readdir(projectsPath, { withFileTypes: true });
      for (const dir of projectDirs) {
        if (dir.isDirectory()) {
          const sessionPath = path.join(projectsPath, dir.name, `${sessionId}.jsonl`);
          try {
            await fs.access(sessionPath);
            projectPath = path.join(projectsPath, dir.name);
            projectName = dir.name;
            break;
          } catch {
            // Session not in this project, continue
          }
        }
      }
      
      if (!projectPath || !projectName) {
        logger.warn('Session file not found', { sessionId });
        return;
      }
      
      // Read session messages
      const sessionPath = path.join(projectPath, `${sessionId}.jsonl`);
      const content = await fs.readFile(sessionPath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      // Check if already has a summary (unless forceUpdate)
      if (!forceUpdate && lines.length > 0) {
        try {
          const firstLine = JSON.parse(lines[0]);
          if (firstLine.type === 'summary' && firstLine.summary && firstLine.summary !== 'No summary available') {
            logger.info('Session already has a summary', { sessionId, summary: firstLine.summary });
            return;
          }
        } catch {
          // First line is not valid JSON or not a summary
        }
      }
      
      // Parse messages for title generation
      const messages = [];
      for (const line of lines) {
        try {
          const msg = JSON.parse(line);
          if (msg.type !== 'summary' && msg.message) {
            messages.push({
              role: msg.message.role || 'user',
              content: typeof msg.message.content === 'string' 
                ? msg.message.content 
                : msg.message.content?.map((c: any) => c.text || '').join(' ') || '',
              timestamp: msg.timestamp
            });
          }
        } catch {
          // Skip invalid lines
        }
      }
      
      if (messages.length === 0) {
        logger.warn('No messages found in session', { sessionId });
        return;
      }
      
      // Generate title using AI or local pattern matching
      let title: string;
      const useAI = process.env.OPENAI_API_KEY && process.env.USE_AI_TITLES !== 'false';
      
      if (useAI) {
        title = await sessionsService.generateSessionTitle(messages);
      } else {
        title = sessionsService.generateSessionTitleLocal(messages);
      }
      
      // Update the session file with the new title and mark as UI-created
      await sessionsService.updateSessionTitle(projectPath, sessionId, title, {
        origin: 'webui'
      });
      
      logger.info('Session summary generated', { sessionId, title, origin: 'webui' });
      
      // Notify frontend about the update
      this.sendMessage({
        type: 'session-summary-updated',
        sessionId,
        summary: title
      } as any);
      
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