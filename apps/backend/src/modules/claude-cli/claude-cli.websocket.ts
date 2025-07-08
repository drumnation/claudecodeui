import { WebSocket } from 'ws';
import { createLogger } from '@kit/logger/node';
import { ClaudeCliService, ClaudeEvent } from './claude-cli.service';
import { ClaudeCommand, AbortSession, ClaudeWebSocketMessage } from './claude-cli.types';
import { sessionsService } from '../sessions/sessions.service';
import { getPlannerServiceInstance } from '../planner/planner.controller.js';
import { PlannerRequest } from '../planner/planner.types.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { createReliableWebSocketSender, ReliableWebSocketSender } from '../../lib/reliableWebSocket';
import { createHeartbeatManager, HeartbeatManager } from '../../lib/heartbeatManager';
import { ConnectionHealth } from '../../types/status';
import { updateSessionStatus } from '../../api/status-sync';

const logger = createLogger({ scope: 'claude-cli-websocket' });

// Environment variable constants - parsed once at startup
const SESSION_SUMMARY_UPDATE_INTERVAL = parseInt(process.env.SESSION_SUMMARY_UPDATE_INTERVAL || '5');
const SESSION_SUMMARY_UPDATE_DELAY = parseInt(process.env.SESSION_SUMMARY_UPDATE_DELAY || '2000');
const DETECT_TOPIC_CHANGES = process.env.DETECT_TOPIC_CHANGES !== 'false';

// Track active services
const activeServices = new Map<string, ClaudeCliService>();
const activePlannerServices = new Map<string, any>();
const sessionMessageCounts = new Map<string, number>();
const manuallyEditedSessions = new Set<string>();

export class ClaudeWebSocketHandler {
  private ws: WebSocket;
  private currentSessionId: string | null = null;
  private reliableSender: ReliableWebSocketSender;
  private heartbeatManager: HeartbeatManager;
  private lastStatusTimestamp: number = 0;
  private statusHistory: Map<string, any[]> = new Map();

  constructor(ws: WebSocket) {
    this.ws = ws;
    
    // Initialize reliable sender and heartbeat manager
    this.reliableSender = createReliableWebSocketSender();
    this.heartbeatManager = createHeartbeatManager({ interval: 5000 });
    
    // Setup heartbeat handlers
    this.heartbeatManager.on('heartbeat', (heartbeat) => {
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'heartbeat',
        data: heartbeat.data,
        connectionHealth: this.getConnectionHealth()
      });
    });
    
    // Handle connection state changes
    this.ws.on('close', () => {
      this.reliableSender.handleConnectionState(this.ws, 'disconnected');
      this.heartbeatManager.stopHeartbeat();
    });
    
    this.ws.on('open', () => {
      this.reliableSender.handleConnectionState(this.ws, 'connected');
    });
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

    // Send initial status using reliable sender
    this.reliableSender.sendReliableMessage(this.ws, {
      type: 'claude-status',
      status: {
        text: 'Connecting to Claude...',
        tokens: 0,
        can_interrupt: true
      }
    }, { priority: 'high' });

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
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'error',
        error: 'Failed to start Claude CLI'
      }, { priority: 'high' });
      activeServices.delete(sessionId);
    }
  }

  async handlePlannerCommand(data: PlannerRequest): Promise<void> {
    const sessionId = data.sessionId || `planner-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.currentSessionId = sessionId;
    
    logger.info('Planner command received', { 
      sessionId,
      projectPath: data.projectPath,
      selectedAgents: data.selectedAgents,
      featureDescriptionLength: data.featureDescription.length
    });

    try {
      // Get planner service instance
      const plannerService = getPlannerServiceInstance();
      
      // Check if planning is already in progress
      if (plannerService.isRunning()) {
        this.reliableSender.sendReliableMessage(this.ws, {
          type: 'planner-error',
          error: 'Planning is already in progress',
          sessionId
        }, { priority: 'high' });
        return;
      }

      // Set up planner event handlers
      this.setupPlannerHandlers(plannerService, sessionId);
      
      // Store active planner service
      activePlannerServices.set(sessionId, plannerService);

      // Send initial status
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'planner-status',
        data: {
          status: 'starting',
          message: 'Initializing multi-agent planner...'
        },
        sessionId
      }, { priority: 'high' });

      // Start planning (async)
      plannerService.planFeature(data)
        .then(result => {
          logger.info('Planning completed successfully', { 
            sessionId,
            duration: result.totalDuration,
            agentCount: result.agentResults.length
          });
        })
        .catch(error => {
          logger.error('Planning failed', { 
            sessionId,
            error: error.message
          });
        })
        .finally(() => {
          activePlannerServices.delete(sessionId);
        });

    } catch (error: any) {
      logger.error('Failed to start planner', { error, sessionId });
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'planner-error',
        error: 'Failed to start planner',
        sessionId
      }, { priority: 'high' });
      activePlannerServices.delete(sessionId);
    }
  }

  handleAbortSession(data: AbortSession): void {
    logger.info('Abort session requested', { sessionId: data.sessionId });
    
    // Kill any active Claude CLI service for this session
    if (activeServices.has(data.sessionId)) {
      const service = activeServices.get(data.sessionId);
      if (service) {
        service.kill();
      }
      activeServices.delete(data.sessionId);
    }
    
    // Abort any active planner service for this session
    if (activePlannerServices.has(data.sessionId)) {
      const plannerService = activePlannerServices.get(data.sessionId);
      if (plannerService && plannerService.abortPlanning) {
        plannerService.abortPlanning();
      }
      activePlannerServices.delete(data.sessionId);
    }
    
    // Send acknowledgment
    this.reliableSender.sendReliableMessage(this.ws, {
      type: 'session-aborted',
      sessionId: data.sessionId
    }, { priority: 'high' });
    
    // Send stream-end to properly close the session
    this.reliableSender.sendReliableMessage(this.ws, {
      type: 'stream-end'
    });
  }

  cleanup(): void {
    // Stop heartbeat and clear queues
    this.heartbeatManager.stopHeartbeat();
    this.reliableSender.clearAllMessages();
    
    // Clean up any active services for this connection
    if (this.currentSessionId && activeServices.has(this.currentSessionId)) {
      const service = activeServices.get(this.currentSessionId);
      if (service) {
        service.kill();
      }
      activeServices.delete(this.currentSessionId);
    }
    
    // Clean up any active planner services
    if (this.currentSessionId && activePlannerServices.has(this.currentSessionId)) {
      const plannerService = activePlannerServices.get(this.currentSessionId);
      if (plannerService && plannerService.abortPlanning) {
        plannerService.abortPlanning();
      }
      activePlannerServices.delete(this.currentSessionId);
    }
  }

  private setupPlannerHandlers(plannerService: any, sessionId: string): void {
    // Handle planner status updates
    plannerService.on('planner-status', (data: any) => {
      this.sendMessage({
        type: 'planner-status',
        data: data,
        sessionId,
        progress: data.progress,
        agentType: data.agentType
      });
    });

    // Handle planner output
    plannerService.on('planner-output', (data: any) => {
      this.sendMessage({
        type: 'planner-output',
        data: data,
        sessionId,
        agentType: data.agentType,
        output: data.output
      });
    });

    // Handle planner completion
    plannerService.on('planner-complete', (data: any) => {
      this.sendMessage({
        type: 'planner-complete',
        data: data,
        sessionId,
        finalPlan: data.finalPlan,
        agentResults: data.agentResults
      });
    });

    // Handle planner errors
    plannerService.on('planner-error', (data: any) => {
      this.sendMessage({
        type: 'planner-error',
        error: data.error,
        sessionId
      });
    });
  }

  private setupServiceHandlers(service: ClaudeCliService, sessionId: string): void {
    // Handle status updates
    service.on('status', (event: ClaudeEvent) => {
      // Track status update timestamp
      this.lastStatusTimestamp = Date.now();
      
      // Store status in history for replay
      if (!this.statusHistory.has(sessionId)) {
        this.statusHistory.set(sessionId, []);
      }
      this.statusHistory.get(sessionId)!.push({
        timestamp: Date.now(),
        data: event.data
      });
      
      // Limit history size
      const history = this.statusHistory.get(sessionId)!;
      if (history.length > 100) {
        history.shift();
      }
      
      // Send using reliable sender
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'claude-status',
        data: event.data,
        connectionHealth: this.getConnectionHealth()
      }, { priority: 'high' });
      
      // Update status sync cache
      if (sessionId && event.data) {
        updateSessionStatus(sessionId, event.data);
      }
    });
    
    // Handle connection health updates
    service.on('connection-health', (event: ClaudeEvent) => {
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'connection-health',
        data: event.data
      }, { priority: 'high' });
    });

    // Handle Claude responses (JSON format)
    service.on('claude-response', (event: ClaudeEvent) => {
      const response = event.data;
      
      // Track user messages for summary updates
      if (response?.message?.role === 'user') {
        this.trackUserMessage(sessionId);
        
        // Generate initial title after first user message
        const messageCount = sessionMessageCounts.get(sessionId) || 0;
        if (messageCount === 1) {
          logger.info('First user message detected, generating initial session title', { sessionId });
          setTimeout(() => {
            this.generateSessionSummary(sessionId, false, true); // initialGeneration = true
          }, 1000); // Small delay to ensure message is saved
        }
      }
      
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'claude-response',
        data: response
      });
    });

    // Handle raw output
    service.on('claude-output', (event: ClaudeEvent) => {
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'claude-output',
        data: event.data
      });
    });

    // Handle interactive prompts
    service.on('interactive-prompt', (event: ClaudeEvent) => {
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'claude-interactive-prompt',
        data: event.data,
        sessionId: event.sessionId
      }, { priority: 'high' });
    });

    // Handle session creation
    service.on('session-created', (event: ClaudeEvent) => {
      // Start heartbeat when session is created
      this.heartbeatManager.startHeartbeat();
      
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'session-created',
        sessionId: event.sessionId
      });
    });

    // Handle errors
    service.on('error', (event: ClaudeEvent) => {
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'claude-error',
        error: event.data
      }, { priority: 'high' });
    });

    // Handle process exit
    service.on('exit', (event: ClaudeEvent) => {
      const exitData = event.data;
      logger.info('Claude process exited', { exitData });
      
      // Clean up
      activeServices.delete(sessionId);
      sessionMessageCounts.delete(sessionId);
      manuallyEditedSessions.delete(sessionId);
      
      // Stop heartbeat when process exits
      this.heartbeatManager.stopHeartbeat();
      
      this.reliableSender.sendReliableMessage(this.ws, {
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
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'stream-end'
      });
    });
  }
  
  private getConnectionHealth(): ConnectionHealth {
    const now = Date.now();
    const timeSinceLastStatus = now - this.lastStatusTimestamp;
    
    if (timeSinceLastStatus < 15000) {
      return ConnectionHealth.CONNECTED;
    } else if (timeSinceLastStatus < 30000) {
      return ConnectionHealth.STALE;
    } else {
      return ConnectionHealth.DISCONNECTED;
    }
  }
  
  handleReconnectRequest(data: { sessionId: string; lastTimestamp?: number }): void {
    const history = this.statusHistory.get(data.sessionId);
    if (!history || history.length === 0) {
      return;
    }
    
    // Send missed status updates
    const missedUpdates = data.lastTimestamp 
      ? history.filter(h => h.timestamp > data.lastTimestamp!)
      : history.slice(-10); // Send last 10 if no timestamp
    
    missedUpdates.forEach(update => {
      this.reliableSender.sendReliableMessage(this.ws, {
        type: 'claude-status',
        data: update.data,
        timestamp: update.timestamp,
        replay: true
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
      // Check for updates at regular intervals
      if (SESSION_SUMMARY_UPDATE_INTERVAL > 0 && newCount > 0 && newCount % SESSION_SUMMARY_UPDATE_INTERVAL === 0) {
        logger.info('User message count reached threshold, checking for title update', { 
          sessionId, 
          messageCount: newCount,
          checkTopicChange: DETECT_TOPIC_CHANGES
        });
        
        // Trigger summary update in the background
        setTimeout(() => {
          this.generateSessionSummary(sessionId, true, false, DETECT_TOPIC_CHANGES);
        }, SESSION_SUMMARY_UPDATE_DELAY);
      }
    } else {
      logger.debug('Skipping auto-update for manually edited session', { sessionId });
    }
  }

  private async generateSessionSummary(sessionId: string, forceUpdate = false, initialGeneration = false, checkTopicChange = false): Promise<void> {
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
      
      // Check if already has a summary (unless forceUpdate or initial generation)
      if (!forceUpdate && !initialGeneration && lines.length > 0) {
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
      
      // Get current title for topic change detection
      let currentTitle: string | undefined;
      if (checkTopicChange && lines.length > 0) {
        try {
          const firstLine = JSON.parse(lines[0]);
          if (firstLine.type === 'summary' && firstLine.summary) {
            currentTitle = firstLine.summary.replace(/ \(\d+\)$/, ''); // Remove duplicate counter
          }
        } catch {
          // Ignore parsing errors
        }
      }
      
      // Generate title using AI or local pattern matching
      let title: string;
      const useAI = process.env.OPENAI_API_KEY && process.env.USE_AI_TITLES !== 'false';
      
      logger.info('Title generation config', {
        useAI,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        useAITitlesFlag: process.env.USE_AI_TITLES,
        messageCount: messages.length
      });
      
      if (useAI) {
        title = await sessionsService.generateSessionTitle(messages, 
          checkTopicChange ? { detectTopicChange: true, previousTitle: currentTitle } : undefined
        );
      } else {
        title = sessionsService.generateSessionTitleLocal(messages);
      }
      
      // Only update if title has changed
      if (checkTopicChange && currentTitle && title === currentTitle) {
        logger.info('Session title unchanged, skipping update', { sessionId, title });
        return;
      }
      
      // Update the session file with the new title and mark as UI-created
      await sessionsService.updateSessionTitle(projectPath, sessionId, title, {
        origin: 'webui'
      });
      
      logger.info('Session summary generated', { 
        sessionId, 
        title, 
        origin: 'webui',
        previousTitle: currentTitle,
        topicChanged: checkTopicChange && currentTitle && title !== currentTitle
      });
      
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
    // Use reliable sender for all messages
    const priority = message.type === 'claude-status' || message.type === 'error' ? 'high' : 'normal';
    this.reliableSender.sendReliableMessage(this.ws, message, { priority });
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