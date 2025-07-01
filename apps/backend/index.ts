import * as fs from 'fs';
import * as path from 'path';
import express, { Express, Request, Response, NextFunction } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import * as http from 'http';
import cors from 'cors';
import { promises as fsPromises } from 'fs';
import { spawn, ChildProcess } from 'child_process';
import * as os from 'os';
import * as pty from 'node-pty';
import fetch from 'node-fetch';
import { FSWatcher } from 'chokidar';

// Import types for our modules (we'll create these)
const { 
  getProjects, 
  getSessions, 
  getSessionMessages, 
  renameProject, 
  deleteSession, 
  deleteProject, 
  addProjectManually, 
  updateSessionSummary 
} = require('./projects');

const { 
  spawnClaude, 
  abortClaudeSession, 
  markSessionAsManuallyEdited, 
  clearManualEditFlag 
} = require('./claude-cli');

const { getSlashCommands } = require('./slash-commands');
const gitRoutes = require('./routes/git');
const ServerManager = require('./serverManager');

// Load environment variables from .env file
try {
  const envPath = path.join(__dirname, '../../.env');
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach((line: string) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0 && !process.env[key]) {
        // Handle both VITE_ prefixed and non-prefixed keys
        process.env[key] = valueParts.join('=').trim();
        if (key.startsWith('VITE_')) {
          const nonViteKey = key.replace('VITE_', '');
          if (!process.env[nonViteKey]) {
            process.env[nonViteKey] = valueParts.join('=').trim();
          }
        }
      }
    }
  });
} catch (e: any) {
  console.log('No .env file found or error reading it:', e.message);
}

console.log('PORT from env:', process.env.PORT);

// Type definitions
interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  projectPath?: string;
  shellPath?: string;
}

// Global variables
let projectsWatcher: FSWatcher | null = null;
const connectedClients = new Set<ExtendedWebSocket>();
let serverManager: any = null;

// Setup file system watcher for Claude projects folder using chokidar
function setupProjectsWatcher(): void {
  const chokidar = require('chokidar');
  const claudeProjectsPath = path.join(process.env.HOME || '', '.claude', 'projects');
  
  if (projectsWatcher) {
    projectsWatcher.close();
  }
  
  try {
    // Initialize chokidar watcher with optimized settings
    projectsWatcher = chokidar.watch(claudeProjectsPath, {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/*.tmp',
        '**/*.swp',
        '**/.DS_Store'
      ],
      persistent: true,
      ignoreInitial: true, // Don't fire events for existing files on startup
      followSymlinks: false,
      depth: 10, // Reasonable depth limit
      awaitWriteFinish: {
        stabilityThreshold: 100, // Wait 100ms for file to stabilize
        pollInterval: 50
      }
    });
    
    // Debounce function to prevent excessive notifications
    let debounceTimer: NodeJS.Timeout;
    const debouncedUpdate = async (eventType: string, filePath: string) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          
          // Get updated projects list
          const updatedProjects = await getProjects();
          
          // Notify all connected clients about the project changes
          const updateMessage = JSON.stringify({
            type: 'projects_updated',
            projects: updatedProjects,
            timestamp: new Date().toISOString(),
            changeType: eventType,
            changedFile: path.relative(claudeProjectsPath, filePath)
          });
          
          connectedClients.forEach((client: ExtendedWebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(updateMessage);
            }
          });
          
        } catch (error) {
          console.error('❌ Error handling project changes:', error);
        }
      }, 300); // 300ms debounce (slightly faster than before)
    };
    
    // Set up event listeners
    projectsWatcher
      .on('add', (filePath: string) => debouncedUpdate('add', filePath))
      .on('change', (filePath: string) => debouncedUpdate('change', filePath))
      .on('unlink', (filePath: string) => debouncedUpdate('unlink', filePath))
      .on('addDir', (dirPath: string) => debouncedUpdate('addDir', dirPath))
      .on('unlinkDir', (dirPath: string) => debouncedUpdate('unlinkDir', dirPath))
      .on('error', (error: Error) => {
        console.error('❌ Chokidar watcher error:', error);
      })
      .on('ready', () => {
        console.log('✅ File watcher ready');
      });
    
  } catch (error) {
    console.error('❌ Failed to setup projects watcher:', error);
  }
}

// Get the first non-localhost IP address
function getServerIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaces = interfaces[name];
    if (ifaces) {
      for (const iface of ifaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
}

const app: Express = express();
const server = http.createServer(app);

// Single WebSocket server that handles both paths
const wss = new WebSocketServer({ 
  server,
  verifyClient: (info) => {
    const pathname = new URL(info.req.url || '', `http://${info.req.headers.host}`).pathname;
    return pathname === '/ws' || pathname === '/shell';
  }
});

// Shell session management
const shellSessions = new Map<string, pty.IPty>();

// CORS configuration  
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, postman, etc)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches the expected patterns
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+$/, // Any IP address
      /^https?:\/\/.*\.ngrok-free\.app$/, // ngrok domains
      /^https?:\/\/.*\.ngrok\.io$/ // legacy ngrok domains
    ];
    
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS to Express
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize server manager
serverManager = new ServerManager();

// The rest of the application continues...
// (We'll continue converting the rest in subsequent steps)

// Start server
const PORT = process.env.PORT || 8765;
server.listen(PORT, '0.0.0.0', () => {
  const serverIP = getServerIP();
  console.log(`Claude Code UI server running on http://0.0.0.0:${PORT}`);
  console.log(`Network access: http://${serverIP}:${PORT}`);
  
  // Setup file system watcher after server starts
  setupProjectsWatcher();
});

// Export for testing
export { app, server };