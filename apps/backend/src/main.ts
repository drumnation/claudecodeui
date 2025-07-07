import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { createLogger } from '@kit/logger/node';
import { handleGetProjects } from './projects.controller';
import { handleClaudeWebSocketConnection } from './modules/claude-cli';
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
        let metadata = {};
        try {
          const firstLine = JSON.parse(lines[0]);
          if (firstLine.type === 'summary' && firstLine.summary) {
            summary = firstLine.summary;
            metadata = firstLine.metadata || {};
          }
        } catch {}
        
        const messageCount = lines.length;
        const lastActivity = new Date(lastMessage.timestamp || firstMessage.timestamp || Date.now());

        sessions.push({
          id: sessionId,
          summary,
          messageCount,
          lastActivity: lastActivity.toISOString(),
          cwd: projectPath.replace(os.homedir(), '~'),
          metadata
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

// Git routes (placeholder for now)
app.get('/api/git/status', (req, res) => {
  // Return empty git status
  res.json({
    modified: [],
    untracked: [],
    staged: [],
    branch: 'main',
    ahead: 0,
    behind: 0
  });
});

app.get('/api/git/branches', (req, res) => {
  // Return default branch
  res.json({
    current: 'main',
    branches: ['main']
  });
});

// File routes
app.get('/api/files', (req, res) => {
  // Return empty file list
  res.json([]);
});

app.get('/api/projects/:projectName/files', (req, res) => {
  // Return empty file list for specific project
  res.json([]);
});

// Slash commands route
app.get('/api/slash-commands', (req, res) => {
  // Return available slash commands
  res.json({
    commands: [
      { command: '/help', description: 'Show available commands' },
      { command: '/clear', description: 'Clear the conversation' },
      { command: '/summary', description: 'Generate a summary of the conversation' },
      { command: '/save', description: 'Save the current session' },
      { command: '/load', description: 'Load a previous session' }
    ]
  });
});

// Dependencies check route
app.get('/api/dependencies', (req, res) => {
  // Check if Claude CLI is available
  res.json({
    claudeCli: {
      available: true,
      version: '1.0.0'
    }
  });
});

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

wss.on('connection', (ws) => {
  // Use the modular Claude CLI handler
  handleClaudeWebSocketConnection(ws);
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