import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { createLogger } from '@kit/logger/node';
import { handleGetProjects } from './projects.controller';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const logger = createLogger({ scope: 'backend-main' });

const app = express();
const PORT = process.env.PORT || 8765;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Config endpoint for frontend
app.get('/api/config', (req, res) => {
  const protocol = req.protocol === 'https' ? 'wss' : 'ws';
  const host = req.get('host') || `localhost:${PORT}`;
  res.json({
    wsUrl: `${protocol}://${host}`,
    apiUrl: `${req.protocol}://${host}`
  });
});

// Project routes
app.get('/api/projects', handleGetProjects);

// Get sessions for a specific project
app.get('/api/projects/:projectName/sessions', async (req, res) => {
  const { projectName } = req.params;
  const { limit = 5, offset = 0 } = req.query;
  
  try {
    const projectPath = path.join(os.homedir(), '.claude', 'projects', projectName);
    const sessions = await getSessionsForProject(projectPath, parseInt(limit as string));
    
    res.json({
      sessions,
      hasMore: sessions.length >= parseInt(limit as string),
      total: sessions.length
    });
  } catch (error) {
    logger.error('Failed to get project sessions', { error, projectName });
    res.status(500).json({ error: 'Failed to get project sessions' });
  }
});

// Helper function to get sessions
async function getSessionsForProject(projectPath: string, limit = 5): Promise<any[]> {
  const sessions: any[] = [];
  
  try {
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    const sessionFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.jsonl'));
    
    const filesWithStats = await Promise.all(
      sessionFiles.map(async (file) => {
        const stats = await fs.stat(path.join(projectPath, file.name));
        return { file, mtime: stats.mtime };
      })
    );
    
    const sortedFiles = filesWithStats
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
      .slice(0, limit)
      .map(item => item.file);

    for (const sessionFile of sortedFiles) {
      const sessionPath = path.join(projectPath, sessionFile.name);
      
      try {
        const content = await fs.readFile(sessionPath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        if (lines.length === 0) continue;
        
        const firstMessage = JSON.parse(lines[0]);
        const lastMessage = JSON.parse(lines[lines.length - 1]);
        const sessionId = sessionFile.name.replace('.jsonl', '');
        
        let summary = 'No summary available';
        try {
          const firstLine = JSON.parse(lines[0]);
          if (firstLine.type === 'summary' && firstLine.summary) {
            summary = firstLine.summary;
          }
        } catch {}
        
        const messageCount = lines.length;
        const lastActivity = new Date(lastMessage.timestamp || firstMessage.timestamp || Date.now());

        sessions.push({
          id: sessionId,
          summary,
          messageCount,
          lastActivity: lastActivity.toISOString(),
          cwd: projectPath.replace(os.homedir(), '~')
        });
      } catch (error) {
        logger.warn('Failed to read session', { sessionPath, error });
      }
    }
  } catch (error) {
    logger.warn('Failed to read sessions', { projectPath, error });
  }

  return sessions;
}

// Session messages route
app.get('/api/projects/:projectName/sessions/:sessionId/messages', async (req, res) => {
  const { projectName, sessionId } = req.params;
  
  try {
    const projectPath = path.join(os.homedir(), '.claude', 'projects', projectName);
    const sessionPath = path.join(projectPath, `${sessionId}.jsonl`);
    
    // Read the JSONL file
    const content = await fs.readFile(sessionPath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    const messages = [];
    for (const line of lines) {
      try {
        const msg = JSON.parse(line);
        // Skip summary messages
        if (msg.type !== 'summary') {
          messages.push(msg);
        }
      } catch (error) {
        logger.warn('Failed to parse message line', { error });
      }
    }
    
    res.json({ messages });
  } catch (error) {
    logger.error('Failed to get session messages', { error, projectName, sessionId });
    res.status(500).json({ error: 'Failed to get session messages' });
  }
});

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });

// Track active sessions and their timeouts
const activeSessions = new Map<string, NodeJS.Timeout>();

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  
  // Track this connection's active session
  let currentSessionId: string | null = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      logger.debug('Received WebSocket message', { type: data.type });

      switch (data.type) {
        case 'claude-command':
          // Generate a session ID if not provided
          const sessionId = data.options?.sessionId || `session-${Date.now()}`;
          currentSessionId = sessionId;
          
          // Cancel any existing timeout for this session
          if (activeSessions.has(sessionId)) {
            clearTimeout(activeSessions.get(sessionId)!);
            activeSessions.delete(sessionId);
          }

          // Send status update
          ws.send(JSON.stringify({
            type: 'claude-status',
            status: {
              text: 'Processing your request...',
              tokens: 0,
              can_interrupt: true
            }
          }));

          // For now, just send a mock response after a delay
          const timeoutId = setTimeout(() => {
            // Check if this session was aborted
            if (!activeSessions.has(sessionId)) {
              logger.debug('Session was aborted, not sending response', { sessionId });
              return;
            }

            // Send assistant response
            ws.send(JSON.stringify({
              type: 'message',
              message: {
                type: 'assistant',
                content: 'I understand you want help, but I need to be connected to the Claude CLI to process your request. The backend integration is not yet complete.',
                timestamp: new Date().toISOString()
              }
            }));

            // Send completion status
            ws.send(JSON.stringify({
              type: 'claude-status',
              status: {
                text: 'Complete',
                tokens: 150,
                can_interrupt: false
              }
            }));

            // Send stream end
            ws.send(JSON.stringify({
              type: 'stream-end'
            }));

            // Clean up
            activeSessions.delete(sessionId);
          }, 1000);

          // Store the timeout
          activeSessions.set(sessionId, timeoutId);
          break;

        case 'abort-session':
          logger.info('Abort session requested', { sessionId: data.sessionId });
          
          // Cancel any active timeout for this session
          if (activeSessions.has(data.sessionId)) {
            clearTimeout(activeSessions.get(data.sessionId)!);
            activeSessions.delete(data.sessionId);
          }
          
          // Send acknowledgment
          ws.send(JSON.stringify({
            type: 'session-aborted',
            sessionId: data.sessionId
          }));
          
          // Send stream-end to properly close the session
          ws.send(JSON.stringify({
            type: 'stream-end'
          }));
          break;

        default:
          logger.warn('Unknown message type', { type: data.type });
      }
    } catch (error) {
      logger.error('Failed to process WebSocket message', { error });
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Failed to process message'
      }));
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
    
    // Clean up any active sessions for this connection
    if (currentSessionId && activeSessions.has(currentSessionId)) {
      clearTimeout(activeSessions.get(currentSessionId)!);
      activeSessions.delete(currentSessionId);
    }
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error', { error });
  });
});

// Start server
server.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});