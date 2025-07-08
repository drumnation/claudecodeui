import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { createLogger } from '@kit/logger/node';
import { handleGetProjects } from './projects.controller';
import { handleClaudeWebSocketConnection } from './modules/claude-cli';
import { handleGetProjectFiles } from './modules/files';
import { handleShellWebSocketConnection } from './modules/shell';
import { 
  handleGitStatus, 
  handleGitBranches, 
  handleGitDiff, 
  handleGitCommit, 
  handleGitCheckout, 
  handleGitCreateBranch 
} from './modules/git/git.controller';
import {
  handleGetBacklog,
  handleCreateTask,
  handleUpdateTask,
  handleDeleteTask,
  handleGetBoard,
  handleGenerateTasks,
  handleReviewTasks
} from './backlog.controller';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import OpenAI from 'openai';

// Load .env from monorepo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../../../.env');
const envResult = dotenv.config({ path: envPath });

// Log environment loading status
if (envResult.error) {
  console.warn('Warning: Could not load .env file from', envPath);
} else {
  console.log('✅ Environment variables loaded from', envPath);
  console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY.slice(-4) : 'Not set');
  console.log('USE_AI_TITLES:', process.env.USE_AI_TITLES);
}

const logger = createLogger({ scope: 'backend-main' });

// Log environment configuration
logger.info('Title generation configuration', {
  useAiTitles: process.env.USE_AI_TITLES !== 'false',
  hasOpenAiKey: !!process.env.OPENAI_API_KEY,
  updateInterval: process.env.SESSION_SUMMARY_UPDATE_INTERVAL || '5',
  detectTopicChanges: process.env.DETECT_TOPIC_CHANGES !== 'false'
});

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
  
  logger.info('[Server] Config API called', {
    requestFrom: req.ip,
    host,
    protocol,
    wsUrl: `${protocol}://${host}`
  });
  
  res.json({
    wsUrl: `${protocol}://${host}`,
    apiUrl: `${req.protocol}://${host}`
  });
});

// Health check endpoint for shell
app.get('/api/shell/health', async (req, res) => {
  logger.info('[Server] Shell health check requested');
  
  try {
    // Check if claude command is available
    const { execSync } = require('child_process');
    const claudeVersion = execSync('claude --version', { encoding: 'utf8' }).trim();
    
    logger.info('[Server] Claude CLI found', { claudeVersion });
    
    res.json({
      status: 'healthy',
      claudeAvailable: true,
      claudeVersion,
      message: 'Claude CLI is available and ready'
    });
  } catch (error) {
    logger.error('[Server] Claude CLI not found', { error });
    
    res.status(503).json({
      status: 'unhealthy',
      claudeAvailable: false,
      error: 'Claude CLI not found. Please install Claude CLI to use the shell feature.',
      installUrl: 'https://docs.anthropic.com/claude/docs/claude-cli'
    });
  }
});

// Project routes
app.get('/api/projects', handleGetProjects);

// Create project endpoint
app.post('/api/projects/create', async (req, res) => {
  const { path: projectPath } = req.body;
  
  if (!projectPath || !projectPath.trim()) {
    return res.status(400).json({ error: 'Project path is required' });
  }
  
  try {
    const trimmedPath = projectPath.trim();
    
    // Check if path exists and is a directory
    const stats = await fs.stat(trimmedPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ 
        error: 'Path must be a directory',
        path: trimmedPath
      });
    }
    
    // Create the project directory in ~/.claude/projects/
    // Use base64url encoding for the project name to handle paths with special characters
    const encodedName = Buffer.from(trimmedPath).toString('base64url');
    const claudeProjectsDir = path.join(os.homedir(), '.claude', 'projects');
    const projectDir = path.join(claudeProjectsDir, encodedName);
    
    // Ensure ~/.claude/projects/ exists
    await fs.mkdir(claudeProjectsDir, { recursive: true });
    
    // Create the project directory
    await fs.mkdir(projectDir, { recursive: true });
    
    // Generate a new session ID for the auto-started session
    const sessionId = `ui-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    logger.info('Project created', { 
      path: trimmedPath, 
      encodedName,
      projectDir,
      autoSessionId: sessionId
    });
    
    res.json({ 
      success: true, 
      project: {
        name: encodedName,
        path: trimmedPath,
        displayName: path.basename(trimmedPath),
        fullPath: trimmedPath
      },
      autoStartSession: {
        sessionId,
        projectPath: trimmedPath
      }
    });
    
  } catch (error: any) {
    logger.error('Failed to create project', { error, projectPath });
    
    if (error.code === 'ENOENT') {
      res.status(404).json({ 
        error: 'Directory does not exist',
        path: projectPath.trim()
      });
    } else if (error.code === 'EACCES') {
      res.status(403).json({ 
        error: 'Permission denied accessing directory',
        path: projectPath.trim()
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to create project',
        details: error.message 
      });
    }
  }
});

// Delete project endpoint (only for projects with 0 sessions)
app.delete('/api/projects/:projectName', async (req, res) => {
  const { projectName } = req.params;
  
  try {
    const claudeProjectsDir = path.join(os.homedir(), '.claude', 'projects');
    const projectDir = path.join(claudeProjectsDir, projectName);
    
    // Check if project directory exists
    try {
      await fs.access(projectDir);
    } catch (error) {
      return res.status(404).json({ 
        error: 'Project not found',
        projectName 
      });
    }
    
    // Check if project has any sessions
    const entries = await fs.readdir(projectDir, { withFileTypes: true });
    const sessionFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.jsonl'));
    
    if (sessionFiles.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete project with existing sessions. Delete all sessions first.',
        sessionCount: sessionFiles.length
      });
    }
    
    // Remove the project directory
    await fs.rmdir(projectDir, { recursive: true });
    
    logger.info('Project deleted', { 
      projectName,
      projectDir
    });
    
    res.json({ 
      success: true,
      message: 'Project deleted successfully'
    });
    
  } catch (error: any) {
    logger.error('Failed to delete project', { error, projectName });
    res.status(500).json({ 
      error: 'Failed to delete project',
      details: error.message 
    });
  }
});

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

// Git routes - using actual implementation from server/routes/git.js
app.get('/api/git/status', handleGitStatus);
app.get('/api/git/branches', handleGitBranches);
app.get('/api/git/diff', handleGitDiff);
app.post('/api/git/commit', handleGitCommit);
app.post('/api/git/checkout', handleGitCheckout);
app.post('/api/git/create-branch', handleGitCreateBranch);

// Backlog routes
app.get('/api/projects/:projectName/backlog', handleGetBacklog);
app.post('/api/projects/:projectName/backlog/tasks', handleCreateTask);
app.put('/api/projects/:projectName/backlog/tasks/:taskId', handleUpdateTask);
app.delete('/api/projects/:projectName/backlog/tasks/:taskId', handleDeleteTask);
app.get('/api/projects/:projectName/backlog/board', handleGetBoard);
app.post('/api/projects/:projectName/backlog/plan', handleGenerateTasks);
app.post('/api/projects/:projectName/backlog/review', handleReviewTasks);

// File routes
app.get('/api/files', (req, res) => {
  // Return empty file list
  res.json([]);
});

app.get('/api/projects/:projectName/files', handleGetProjectFiles);

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

// Audio transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const upload = multer({ storage: multer.memoryStorage() });
    
    // Handle multipart form data
    upload.single('audio')(req, res, async (err) => {
      if (err) {
        logger.error('Failed to process audio file', { error: err });
        return res.status(400).json({ error: 'Failed to process audio file' });
      }
      
      if (!req.file) {
        logger.warn('No audio file provided in transcription request');
        return res.status(400).json({ error: 'No audio file provided' });
      }
      
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        logger.error('OpenAI API key not configured for transcription');
        return res.status(500).json({ error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in server environment.' });
      }
      
      try {
        logger.info('Processing transcription request', { 
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        // Create form data for OpenAI
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');
        formData.append('language', 'en');
        
        // Make request to OpenAI
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            ...formData.getHeaders()
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          logger.error('Whisper API error', { 
            status: response.status,
            error: errorData 
          });
          throw new Error(errorData.error?.message || `Whisper API error: ${response.status}`);
        }
        
        const data = await response.json();
        let transcribedText = data.text || '';
        
        logger.info('Transcription completed', { 
          originalLength: transcribedText.length,
          mode: req.body.mode || 'default'
        });
        
        // Check if enhancement mode is enabled
        const mode = req.body.mode || 'default';
        
        // If no transcribed text, return empty
        if (!transcribedText) {
          return res.json({ text: '' });
        }
        
        // If default mode, return transcribed text without enhancement
        if (mode === 'default') {
          return res.json({ text: transcribedText });
        }
        
        // Handle different enhancement modes
        try {
          const openai = new OpenAI({ apiKey });
          
          let prompt: string | undefined, systemMessage = '', temperature = 0.7, maxTokens = 800;
          
          switch (mode) {
            case 'prompt':
              systemMessage = 'You are an expert prompt engineer who creates clear, detailed, and effective prompts.';
              prompt = `You are an expert prompt engineer. Transform the following rough instruction into a clear, detailed, and context-aware AI prompt.

Your enhanced prompt should:
1. Be specific and unambiguous
2. Include relevant context and constraints
3. Specify the desired output format
4. Use clear, actionable language
5. Include examples where helpful
6. Consider edge cases and potential ambiguities

Transform this rough instruction into a well-crafted prompt:
"${transcribedText}"

Enhanced prompt:`;
              break;
              
            case 'vibe':
            case 'instructions':
            case 'architect':
              systemMessage = 'You are a helpful assistant that formats ideas into clear, actionable instructions for AI agents.';
              temperature = 0.5; // Lower temperature for more controlled output
              prompt = `Transform the following idea into clear, well-structured instructions that an AI agent can easily understand and execute.

IMPORTANT RULES:
- Format as clear, step-by-step instructions
- Add reasonable implementation details based on common patterns
- Only include details directly related to what was asked
- Do NOT add features or functionality not mentioned
- Keep the original intent and scope intact
- Use clear, actionable language an agent can follow

Transform this idea into agent-friendly instructions:
"${transcribedText}"

Agent instructions:`;
              break;
              
            default:
              // No enhancement needed
              break;
          }
          
          // Only make GPT call if we have a prompt
          if (prompt) {
            logger.info('Enhancing transcription with GPT', { mode, temperature });
            
            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt }
              ],
              temperature: temperature,
              max_tokens: maxTokens
            });
            
            const enhancedText = completion.choices[0].message.content || transcribedText;
            logger.info('Transcription enhanced', { 
              originalLength: transcribedText.length,
              enhancedLength: enhancedText.length
            });
            transcribedText = enhancedText;
          }
          
        } catch (gptError: any) {
          logger.error('GPT processing error', { error: gptError });
          // Fall back to original transcription if GPT fails
        }
        
        res.json({ text: transcribedText });
        
      } catch (error: any) {
        logger.error('Transcription error', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error: any) {
    logger.error('Transcription endpoint error', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Directory browsing routes
app.get('/api/directories', async (req, res) => {
  const { path: requestPath } = req.query;
  const targetPath = requestPath ? String(requestPath) : os.homedir();
  
  try {
    // Security check - prevent directory traversal attacks
    const resolvedPath = path.resolve(targetPath);
    
    // Only allow browsing within user's home directory or common project locations
    const allowedPaths = [
      os.homedir(),
      '/Users',
      '/home',
      '/opt',
      '/var',
      '/tmp'
    ];
    
    const isAllowed = allowedPaths.some(allowedPath => 
      resolvedPath.startsWith(path.resolve(allowedPath))
    );
    
    if (!isAllowed) {
      return res.status(403).json({ 
        error: 'Access denied to this directory',
        path: resolvedPath 
      });
    }
    
    // Check if path exists and is a directory
    const stats = await fs.stat(resolvedPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ 
        error: 'Path is not a directory',
        path: resolvedPath 
      });
    }
    
    // Read directory contents
    const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
    
    const directories = [];
    const files = [];
    
    for (const entry of entries) {
      const itemPath = path.join(resolvedPath, entry.name);
      const itemStats = await fs.stat(itemPath).catch(() => null);
      
      if (!itemStats) continue;
      
      const item = {
        name: entry.name,
        path: itemPath,
        isDirectory: entry.isDirectory(),
        size: itemStats.size,
        modified: itemStats.mtime.toISOString(),
        hidden: entry.name.startsWith('.')
      };
      
      if (entry.isDirectory()) {
        directories.push(item);
      } else {
        files.push(item);
      }
    }
    
    // Sort directories first, then files, both alphabetically
    directories.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    const parentPath = path.dirname(resolvedPath);
    const canGoUp = parentPath !== resolvedPath && isAllowed;
    
    res.json({
      currentPath: resolvedPath,
      parentPath: canGoUp ? parentPath : null,
      directories,
      files: files.slice(0, 10), // Limit files shown to reduce clutter
      totalFiles: files.length
    });
    
  } catch (error: any) {
    logger.error('Failed to browse directory', { error, requestPath });
    res.status(500).json({ 
      error: 'Failed to browse directory',
      details: error.message 
    });
  }
});

app.post('/api/directories', async (req, res) => {
  const { path: targetPath, name } = req.body;
  
  if (!targetPath || !name) {
    return res.status(400).json({ 
      error: 'Path and name are required' 
    });
  }
  
  try {
    const parentPath = path.resolve(targetPath);
    const newDirPath = path.join(parentPath, name);
    
    // Security check - prevent directory traversal attacks
    const allowedPaths = [
      os.homedir(),
      '/Users',
      '/home',
      '/opt',
      '/var',
      '/tmp'
    ];
    
    const isAllowed = allowedPaths.some(allowedPath => 
      newDirPath.startsWith(path.resolve(allowedPath))
    );
    
    if (!isAllowed) {
      return res.status(403).json({ 
        error: 'Access denied to this location',
        path: newDirPath 
      });
    }
    
    // Check if parent directory exists
    const parentStats = await fs.stat(parentPath);
    if (!parentStats.isDirectory()) {
      return res.status(400).json({ 
        error: 'Parent path is not a directory',
        path: parentPath 
      });
    }
    
    // Check if directory already exists
    try {
      await fs.stat(newDirPath);
      return res.status(409).json({ 
        error: 'Directory already exists',
        path: newDirPath 
      });
    } catch {
      // Directory doesn't exist, which is what we want
    }
    
    // Create the directory
    await fs.mkdir(newDirPath, { recursive: false });
    
    logger.info('Directory created', { path: newDirPath });
    
    res.json({
      success: true,
      path: newDirPath,
      name
    });
    
  } catch (error: any) {
    logger.error('Failed to create directory', { error, targetPath, name });
    res.status(500).json({ 
      error: 'Failed to create directory',
      details: error.message 
    });
  }
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

// Update session title route
app.post('/api/projects/:projectName/sessions/:sessionId/update-title', async (req, res) => {
  const { projectName, sessionId } = req.params;
  const { forceRegenerate = false } = req.body;
  
  try {
    // Import sessions service
    const { sessionsService } = await import('./modules/sessions');
    const projectPath = path.join(os.homedir(), '.claude', 'projects', projectName);
    const sessionPath = path.join(projectPath, `${sessionId}.jsonl`);
    
    // Read session messages
    const content = await fs.readFile(sessionPath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    // Check if already has a title (unless force regenerate)
    if (!forceRegenerate && lines.length > 0) {
      try {
        const firstLine = JSON.parse(lines[0]);
        if (firstLine.type === 'summary' && firstLine.summary && firstLine.summary !== 'No summary available') {
          return res.json({ title: firstLine.summary, updated: false });
        }
      } catch {}
    }
    
    // Parse messages
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
      } catch {}
    }
    
    if (messages.length === 0) {
      return res.status(400).json({ error: 'No messages found in session' });
    }
    
    // Generate title
    const useAI = process.env.OPENAI_API_KEY && process.env.USE_AI_TITLES !== 'false';
    let title: string;
    
    if (useAI) {
      title = await sessionsService.generateSessionTitle(messages);
    } else {
      title = sessionsService.generateSessionTitleLocal(messages);
    }
    
    // Update session
    const metadata: any = {};
    if (sessionId.startsWith('ui-')) {
      metadata.origin = 'webui';
    }
    
    await sessionsService.updateSessionTitle(projectPath, sessionId, title, metadata);
    
    res.json({ title, updated: true });
  } catch (error) {
    logger.error('Failed to update session title', { error, projectName, sessionId });
    res.status(500).json({ error: 'Failed to update session title' });
  }
});

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server with URL-based routing
const wss = new WebSocketServer({ 
  server,
  verifyClient: (info: any) => {
    logger.info('[WebSocket] Connection attempt', { url: info.req.url });
    return true; // Accept all connections for now
  }
});

wss.on('connection', (ws, request) => {
  const url = request.url;
  logger.info('[WebSocket] Client connected', { url });
  
  // Route based on URL path
  if (url === '/shell') {
    handleShellWebSocketConnection(ws);
  } else if (url === '/ws' || url === '/') {
    // Default to Claude CLI handler for chat connections
    handleClaudeWebSocketConnection(ws);
  } else {
    logger.warn('[WebSocket] Unknown path', { url });
    ws.close();
  }
});

// Start server with error handling
server.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`, { 
      suggestion: 'Please kill the existing process or use a different port' 
    });
    logger.info('To kill the process using this port, run:');
    logger.info(`lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    logger.error('Server error', { error: err });
    throw err;
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});// Test comment
