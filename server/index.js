// Load environment variables from .env file
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '../.env');
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
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
} catch (e) {
  console.log('No .env file found or error reading it:', e.message);
}

console.log('PORT from env:', process.env.PORT);

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const os = require('os');
// const pty = require('node-pty'); // Temporarily disabled due to build issues
const fetch = require('node-fetch');
const { getProjects, getSessions, getSessionMessages, renameProject, deleteSession, deleteProject, addProjectManually, updateSessionSummary } = require('./projects');
const { spawnClaude, abortClaudeSession, markSessionAsManuallyEdited, clearManualEditFlag } = require('./claude-cli');
const { getSlashCommands } = require('./slash-commands');
const gitRoutes = require('./routes/git');
const ServerManager = require('./serverManager');

// File system watcher for projects folder
let projectsWatcher = null;
const connectedClients = new Set();
let serverManager = null;

// Setup file system watcher for Claude projects folder using chokidar
function setupProjectsWatcher() {
  const chokidar = require('chokidar');
  const claudeProjectsPath = path.join(process.env.HOME, '.claude', 'projects');
  
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
    let debounceTimer;
    const debouncedUpdate = async (eventType, filePath) => {
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
          
          connectedClients.forEach(client => {
            if (client.readyState === client.OPEN) {
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
      .on('add', (filePath) => debouncedUpdate('add', filePath))
      .on('change', (filePath) => debouncedUpdate('change', filePath))
      .on('unlink', (filePath) => debouncedUpdate('unlink', filePath))
      .on('addDir', (dirPath) => debouncedUpdate('addDir', dirPath))
      .on('unlinkDir', (dirPath) => debouncedUpdate('unlinkDir', dirPath))
      .on('error', (error) => {
        console.error('❌ Chokidar watcher error:', error);
      })
      .on('ready', () => {
      });
    
  } catch (error) {
    console.error('❌ Failed to setup projects watcher:', error);
  }
}

// Get the first non-localhost IP address
function getServerIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const app = express();
const server = http.createServer(app);

// Single WebSocket server that handles both paths
const wss = new WebSocketServer({ 
  server,
  verifyClient: (info) => {
    console.log('WebSocket connection attempt to:', info.req.url);
    return true; // Accept all connections for now
  }
});

// Initialize server manager with broadcast capability
serverManager = new ServerManager({
  broadcast: (message) => {
    const messageStr = JSON.stringify(message);
    connectedClients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(messageStr);
      }
    });
  }
});

app.use(cors());
app.use(express.json());

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, '../dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Git API Routes
app.use('/api/git', gitRoutes);

// API Routes
app.get('/api/config', (req, res) => {
  // Always use the server's actual IP and port for WebSocket connections
  const serverIP = getServerIP();
  const host = `${serverIP}:${PORT}`;
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'wss' : 'ws';
  
  console.log('[Server] Config API called');
  console.log('[Server] Request from:', req.ip);
  console.log('[Server] Server IP:', serverIP);
  console.log('[Server] Host:', host);
  console.log('[Server] Protocol:', protocol);
  console.log('[Server] Full WebSocket URL:', `${protocol}://${host}`);
  
  res.json({
    serverPort: PORT,
    wsUrl: `${protocol}://${host}`
  });
});

// Health check endpoint for shell
app.get('/api/shell/health', async (req, res) => {
  console.log('[Server] Shell health check requested');
  
  try {
    // Check if claude command is available
    const { execSync } = require('child_process');
    const claudeVersion = execSync('claude --version', { encoding: 'utf8' }).trim();
    
    console.log('[Server] Claude CLI found:', claudeVersion);
    
    res.json({
      status: 'healthy',
      claudeAvailable: true,
      claudeVersion,
      message: 'Claude CLI is available and ready'
    });
  } catch (error) {
    console.error('[Server] Claude CLI not found:', error.message);
    
    res.status(503).json({
      status: 'unhealthy',
      claudeAvailable: false,
      error: 'Claude CLI not found. Please install Claude CLI to use the shell feature.',
      installUrl: 'https://docs.anthropic.com/claude/docs/claude-cli'
    });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:projectName/sessions', async (req, res) => {
  try {
    const { limit = 5, offset = 0 } = req.query;
    const result = await getSessions(req.params.projectName, parseInt(limit), parseInt(offset));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a specific session
app.get('/api/projects/:projectName/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { projectName, sessionId } = req.params;
    const messages = await getSessionMessages(projectName, sessionId);
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rename project endpoint
app.put('/api/projects/:projectName/rename', async (req, res) => {
  try {
    const { displayName } = req.body;
    await renameProject(req.params.projectName, displayName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete session endpoint
app.delete('/api/projects/:projectName/sessions/:sessionId', async (req, res) => {
  try {
    const { projectName, sessionId } = req.params;
    await deleteSession(projectName, sessionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project endpoint (only if empty)
app.delete('/api/projects/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params;
    await deleteProject(projectName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project endpoint
app.post('/api/projects/create', async (req, res) => {
  try {
    const { path: projectPath } = req.body;
    
    if (!projectPath || !projectPath.trim()) {
      return res.status(400).json({ error: 'Project path is required' });
    }
    
    const project = await addProjectManually(projectPath.trim());
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get slash commands endpoint
app.get('/api/slash-commands', async (req, res) => {
  try {
    const commands = await getSlashCommands();
    res.json({ commands });
  } catch (error) {
    console.error('Error getting slash commands:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate session summary using OpenAI
app.post('/api/generate-session-summary', async (req, res) => {
  try {
    const { messages } = req.body;
    
    console.log('🎯 Summary generation endpoint called with', messages?.length || 0, 'messages');
    
    if (!messages || messages.length === 0) {
      return res.status(400).json({ 
        error: 'No messages provided',
        summary: null 
      });
    }
    
    // Extract user messages and limit to first few for cost efficiency
    const userMessages = messages
      .filter(msg => msg.message?.role === 'user' && msg.message?.content)
      .slice(0, 5)
      .map(msg => {
        const content = msg.message.content;
        // Clean command messages
        if (typeof content === 'string' && content.startsWith('<command-name>')) {
          return null;
        }
        return content;
      })
      .filter(Boolean)
      .join(' ');
    
    console.log('👤 Extracted user messages length:', userMessages.length);
    
    if (!userMessages) {
      console.log('⚠️ No user messages found, returning default');
      return res.json({ summary: 'New Session' });
    }
    
    // Use Claude to generate summary if available, otherwise fall back to OpenAI
    const useClaude = process.env.USE_CLAUDE_FOR_SUMMARY !== 'false'; // Default to true
    console.log('🤖 USE_CLAUDE_FOR_SUMMARY:', useClaude);
    console.log('🔑 OPENAI_API_KEY set:', !!process.env.OPENAI_API_KEY);
    
    if (useClaude) {
      try {
        console.log('🔄 Attempting to use Claude CLI for summary...');
        const { spawn } = require('child_process');
        
        // Prepare prompt for Claude
        const prompt = `Summarize the following user intent into a brief 3-5 word session title. Focus on the main action or goal. Do not include "Caveat" or system messages. Respond with ONLY the title, nothing else. Examples: "Add dark mode", "Fix login bug", "Create API endpoint", "Update navigation menu".

User messages: ${userMessages.substring(0, 500)}`;
        
        // Spawn Claude in non-interactive mode
        const claudeProcess = spawn('claude', ['--print', '--model', 'haiku', prompt], {
          cwd: process.cwd(),
          env: process.env
        });
        
        let output = '';
        let error = '';
        
        claudeProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        claudeProcess.stderr.on('data', (data) => {
          error += data.toString();
        });
        
        await new Promise((resolve, reject) => {
          claudeProcess.on('close', (code) => {
            console.log('📤 Claude process exited with code:', code);
            console.log('📤 Claude output:', output);
            console.log('❌ Claude error:', error);
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Claude process exited with code ${code}: ${error}`));
            }
          });
          
          claudeProcess.on('error', (err) => {
            console.error('❌ Claude spawn error:', err);
            reject(err);
          });
          
          // Timeout after 10 seconds
          setTimeout(() => {
            claudeProcess.kill();
            reject(new Error('Claude process timed out'));
          }, 10000);
        });
        
        // Clean and trim the output
        const summary = output.trim()
          .replace(/^["']|["']$/g, '') // Remove quotes
          .split('\n')[0] // Take only first line
          .substring(0, 50); // Limit length
        
        if (summary) {
          console.log('✅ Claude summary generated:', summary);
          return res.json({ summary });
        } else {
          console.log('⚠️ Claude returned empty summary');
        }
      } catch (error) {
        console.error('❌ Error using Claude for summary:', error.message);
        console.error('Full error:', error);
        // Fall through to OpenAI
      }
    }
    
    // Fall back to OpenAI if Claude fails or is disabled
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ No OpenAI API key set, returning default summary');
      return res.json({ summary: 'New Session' });
    }
    
    console.log('🔄 Falling back to OpenAI for summary generation...');
    
    // Original OpenAI implementation
    const prompt = `Summarize the following user intent into a brief 3-5 word session title. Focus on the main action or goal. Do not include "Caveat" or system messages. Examples: "Add dark mode", "Fix login bug", "Create API endpoint", "Update navigation menu".

User messages: ${userMessages.substring(0, 500)}

Session title:`;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise, descriptive session titles. Always respond with just the title, nothing else.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 20,
          temperature: 0.3,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API error:', error);
        return res.json({ summary: 'New Session' });
      }
      
      const data = await response.json();
      const summary = data.choices[0]?.message?.content?.trim() || 'New Session';
      
      // Ensure summary is not too long
      const finalSummary = summary.length > 50 ? summary.substring(0, 47) + '...' : summary;
      
      res.json({ summary: finalSummary });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      res.json({ summary: 'New Session' });
    }
  } catch (error) {
    console.error('Error generating session summary:', error);
    res.status(500).json({ error: error.message, summary: null });
  }
});

// Manual session summary generation endpoint
app.post('/api/projects/:projectName/sessions/:sessionId/generate-summary', async (req, res) => {
  try {
    const { projectName, sessionId } = req.params;
    
    console.log('📝 Manual summary generation requested for:', projectName, sessionId);
    
    // Fetch session messages
    const messages = await getSessionMessages(projectName, sessionId);
    
    console.log('📋 Found', messages?.length || 0, 'messages in session');
    
    if (!messages || messages.length === 0) {
      return res.json({ summary: 'New Session' });
    }
    
    // Generate summary using the existing endpoint
    const summaryResponse = await fetch(`http://localhost:${PORT}/api/generate-session-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    
    console.log('🔄 Summary API response status:', summaryResponse.status);
    
    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error('❌ Summary API error:', errorText);
      throw new Error(`Failed to generate summary: ${errorText}`);
    }
    
    const summaryData = await summaryResponse.json();
    console.log('✅ Summary generated:', summaryData);
    
    if (summaryData.summary) {
      // Update the session summary
      await updateSessionSummary(projectName, sessionId, summaryData.summary);
      
      // Clear manual edit flag since this is a generated summary
      clearManualEditFlag(sessionId);
      
      res.json({ 
        success: true,
        summary: summaryData.summary
      });
    } else {
      console.error('❌ No summary in response:', summaryData);
      res.status(500).json({ error: 'Failed to generate summary - no summary in response' });
    }
  } catch (error) {
    console.error('❌ Error generating session summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update session summary endpoint
app.put('/api/projects/:projectName/sessions/:sessionId/summary', async (req, res) => {
  try {
    const { projectName, sessionId } = req.params;
    const { summary } = req.body;
    
    if (!summary) {
      return res.status(400).json({ error: 'Summary is required' });
    }
    
    await updateSessionSummary(projectName, sessionId, summary);
    
    // Mark this session as manually edited to prevent automatic updates
    markSessionAsManuallyEdited(sessionId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating session summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Read file content endpoint
app.get('/api/projects/:projectName/file', async (req, res) => {
  try {
    const { projectName } = req.params;
    const { filePath } = req.query;
    
    console.log('📄 File read request:', projectName, filePath);
    
    const fs = require('fs').promises;
    
    // Security check - ensure the path is safe and absolute
    if (!filePath || !path.isAbsolute(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ content, path: filePath });
  } catch (error) {
    console.error('Error reading file:', error);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else if (error.code === 'EACCES') {
      res.status(403).json({ error: 'Permission denied' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Serve binary file content endpoint (for images, etc.)
app.get('/api/projects/:projectName/files/content', async (req, res) => {
  try {
    const { projectName } = req.params;
    const { path: filePath } = req.query;
    
    console.log('🖼️ Binary file serve request:', projectName, filePath);
    
    const fs = require('fs');
    const mime = require('mime-types');
    
    // Security check - ensure the path is safe and absolute
    if (!filePath || !path.isAbsolute(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    
    // Check if file exists
    try {
      await fs.promises.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Get file extension and set appropriate content type
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });
    
  } catch (error) {
    console.error('Error serving binary file:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Save file content endpoint
app.put('/api/projects/:projectName/file', async (req, res) => {
  try {
    const { projectName } = req.params;
    const { filePath, content } = req.body;
    
    console.log('💾 File save request:', projectName, filePath);
    
    const fs = require('fs').promises;
    
    // Security check - ensure the path is safe and absolute
    if (!filePath || !path.isAbsolute(filePath)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Create backup of original file
    try {
      const backupPath = filePath + '.backup.' + Date.now();
      await fs.copyFile(filePath, backupPath);
      console.log('📋 Created backup:', backupPath);
    } catch (backupError) {
      console.warn('Could not create backup:', backupError.message);
    }
    
    // Write the new content
    await fs.writeFile(filePath, content, 'utf8');
    
    res.json({ 
      success: true, 
      path: filePath,
      message: 'File saved successfully' 
    });
  } catch (error) {
    console.error('Error saving file:', error);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File or directory not found' });
    } else if (error.code === 'EACCES') {
      res.status(403).json({ error: 'Permission denied' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.get('/api/projects/:projectName/files', async (req, res) => {
  try {
    
    const fs = require('fs').promises;
    const { getProjects } = require('./projects');
    
    // Decode the project name
    const projectName = decodeURIComponent(req.params.projectName);
    console.log('📁 Files requested for project:', projectName);
    
    // Get all projects to find the actual path
    const projects = await getProjects();
    const project = projects.find(p => p.name === projectName);
    
    if (!project) {
      console.error('❌ Project not found:', projectName);
      console.log('Available projects:', projects.map(p => p.name));
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Use the actual path from the project resolution logic
    let actualPath = project.fullPath;
    console.log('📂 Project path:', actualPath);
    console.log('📍 Original path vs resolved path:', project.name.replace(/-/g, '/'), '->', actualPath);
    
    // Check if path exists and is a directory
    try {
      await fs.access(actualPath);
      const stats = await fs.lstat(actualPath);
      
      if (!stats.isDirectory()) {
        console.error('❌ Project path is not a directory:', actualPath);
        return res.status(400).json({ 
          error: 'Project path is not a directory',
          path: actualPath,
          type: stats.isFile() ? 'file' : 'other' 
        });
      }
    } catch (e) {
      console.error('❌ Project path not accessible:', actualPath);
      console.error('Error details:', e.code, e.message);
      
      if (e.code === 'ENOENT') {
        return res.status(404).json({ 
          error: `Project directory not found: ${actualPath}`,
          suggestion: 'The project may have been moved or deleted'
        });
      } else if (e.code === 'EACCES' || e.code === 'EPERM') {
        return res.status(403).json({ 
          error: `Permission denied accessing project directory: ${actualPath}`,
          suggestion: 'Check directory permissions'
        });
      } else {
        return res.status(500).json({ 
          error: `Failed to access project directory: ${actualPath}`,
          details: e.message
        });
      }
    }
    
    // Parse optional query parameters
    const maxDepth = parseInt(req.query.depth) || 3;
    const showHidden = req.query.hidden !== 'false'; // Default to true
    
    console.log('🔍 Getting file tree with maxDepth:', maxDepth, 'showHidden:', showHidden);
    
    const files = await getFileTree(actualPath, maxDepth, 0, showHidden);
    const hiddenFiles = files.filter(f => f.name.startsWith('.'));
    console.log('📄 Found', files.length, 'files/folders, including', hiddenFiles.length, 'hidden files');
    
    if (files.length === 0) {
      console.log('⚠️ Empty directory or access issues:', actualPath);
      // Check if it's truly empty or if we have permission issues
      try {
        const dirContents = await fs.readdir(actualPath);
        if (dirContents.length === 0) {
          console.log('📂 Directory is truly empty');
        } else {
          console.log('⚠️ Directory has', dirContents.length, 'items but getFileTree returned empty');
        }
      } catch (e) {
        console.log('⚠️ Cannot read directory contents:', e.message);
      }
    } else {
      console.log('🔍 Sample files:', files.slice(0, 5).map(f => ({ name: f.name, type: f.type })));
    }
    
    res.json(files);
  } catch (error) {
    console.error('❌ File tree error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection handler that routes based on URL path
wss.on('connection', (ws, request) => {
  const url = request.url;
  console.log('🔗 Client connected to:', url);
  
  if (url === '/shell') {
    handleShellConnection(ws);
  } else if (url === '/ws') {
    handleChatConnection(ws);
  } else {
    console.log('❌ Unknown WebSocket path:', url);
    ws.close();
  }
});

// Handle chat WebSocket connections
function handleChatConnection(ws) {
  console.log('💬 Chat WebSocket connected');
  
  // Add to connected clients for project updates
  connectedClients.add(ws);
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'claude-command') {
        console.log('💬 User message:', data.command || '[Continue/Resume]');
        console.log('📁 Project:', data.options?.projectPath || 'Unknown');
        console.log('🔄 Session:', data.options?.sessionId ? 'Resume' : 'New');
        await spawnClaude(data.command, data.options, ws);
      } else if (data.type === 'abort-session') {
        console.log('🛑 Abort session request:', data.sessionId);
        const success = abortClaudeSession(data.sessionId);
        ws.send(JSON.stringify({
          type: 'session-aborted',
          sessionId: data.sessionId,
          success
        }));
      } else if (data.type === 'server:start') {
        console.log('🚀 Starting server:', data.script, 'in', data.projectPath);
        const result = await serverManager.startServer(data.projectPath, data.script);
        if (result.error) {
          ws.send(JSON.stringify({
            type: 'server:error',
            error: result.error,
            projectPath: data.projectPath
          }));
        }
      } else if (data.type === 'server:stop') {
        console.log('🛑 Stopping server in', data.projectPath);
        await serverManager.stopServer(data.projectPath, data.script);
      } else if (data.type === 'server:status') {
        const status = serverManager.getServerStatus(data.projectPath);
        ws.send(JSON.stringify({
          type: 'server:status',
          projectPath: data.projectPath,
          servers: status
        }));
      } else if (data.type === 'server:scripts') {
        const scripts = await serverManager.getAvailableScripts(data.projectPath);
        ws.send(JSON.stringify({
          type: 'server:scripts',
          projectPath: data.projectPath,
          scripts
        }));
      }
    } catch (error) {
      console.error('❌ Chat WebSocket error:', error.message);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 Chat client disconnected');
    // Remove from connected clients
    connectedClients.delete(ws);
  });
}

// Handle shell WebSocket connections
function handleShellConnection(ws) {
  console.log('[Shell] Client connected');
  
  // Since PTY is disabled, we'll use regular spawn instead
  let shellProcess = null;
  let isClaudeRunning = false;
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Shell message received:', data.type);
      
      if (data.type === 'init') {
        // Initialize shell with project path and session info
        const projectPath = data.projectPath || process.cwd();
        const sessionId = data.sessionId;
        const hasSession = data.hasSession;
        
        console.log('[Shell] Starting shell in:', projectPath);
        console.log('[Shell] Session info:', hasSession ? `Resume session ${sessionId}` : 'New session');
        
        // First check if claude is available
        try {
          const { execSync } = require('child_process');
          execSync('which claude', { encoding: 'utf8' });
        } catch (checkError) {
          console.error('[Shell] Claude CLI not found');
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Claude CLI not found. Please install it first: https://docs.anthropic.com/claude/docs/claude-cli'
          }));
          return;
        }
        
        // Send a welcome message
        const welcomeMsg = hasSession ? 
          `\x1b[36mResuming Claude session ${sessionId} in: ${projectPath}\x1b[0m\r\n` :
          `\x1b[36mStarting new Claude session in: ${projectPath}\x1b[0m\r\n`;
        
        ws.send(JSON.stringify({
          type: 'output',
          data: welcomeMsg
        }));
        
        try {
          // Since PTY is disabled, use regular spawn with pseudo-TTY settings
          const { spawn } = require('child_process');
          
          // Build claude command arguments
          const claudeArgs = [];
          if (hasSession && sessionId) {
            claudeArgs.push('--resume', sessionId);
          }
          
          console.log('[Shell] Spawning claude with args:', claudeArgs);
          console.log('[Shell] Working directory:', projectPath);
          
          // Spawn claude process
          shellProcess = spawn('claude', claudeArgs, {
            cwd: projectPath,
            env: { 
              ...process.env,
              TERM: 'xterm-256color',
              COLORTERM: 'truecolor',
              FORCE_COLOR: '3',
              // Override browser opening commands to echo URL for detection
              BROWSER: 'echo "OPEN_URL:"'
            },
            // Try to allocate a pseudo-TTY even without node-pty
            stdio: ['pipe', 'pipe', 'pipe']
          });
          
          isClaudeRunning = true;
          
          console.log('[Shell] Claude process started, PID:', shellProcess.pid);
          
          // Handle stdout
          shellProcess.stdout.on('data', (data) => {
            const outputStr = data.toString();
            console.log('[Shell] stdout:', outputStr.slice(0, 100), outputStr.length > 100 ? '...' : '');
            
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({
                type: 'output',
                data: outputStr
              }));
            }
          });
          
          // Handle stderr
          shellProcess.stderr.on('data', (data) => {
            const errorStr = data.toString();
            console.error('[Shell] stderr:', errorStr);
            
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({
                type: 'output',
                data: `\x1b[31m${errorStr}\x1b[0m`
              }));
            }
          });
          
          // Handle process exit
          shellProcess.on('exit', (code, signal) => {
            console.log('[Shell] Process exited with code:', code, 'signal:', signal);
            isClaudeRunning = false;
            
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({
                type: 'output',
                data: `\r\n\x1b[33mClaude exited with code ${code}${signal ? ` (${signal})` : ''}\x1b[0m\r\n`
              }));
            }
            shellProcess = null;
          });
          
          // Handle process errors
          shellProcess.on('error', (error) => {
            console.error('[Shell] Process error:', error);
            isClaudeRunning = false;
            
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                message: `Failed to start Claude: ${error.message}`
              }));
            }
          });
          
        } catch (spawnError) {
          console.error('[Shell] Error spawning claude:', spawnError);
          ws.send(JSON.stringify({
            type: 'error',
            message: `Failed to start Claude: ${spawnError.message}`
          }));
        }
        
      } else if (data.type === 'input') {
        // Send input to shell process
        if (shellProcess && shellProcess.stdin && isClaudeRunning) {
          try {
            console.log('[Shell] Writing input:', data.data.length, 'bytes');
            shellProcess.stdin.write(data.data);
          } catch (error) {
            console.error('[Shell] Error writing to stdin:', error);
          }
        } else {
          console.warn('[Shell] No active shell process to send input to');
          if (!isClaudeRunning) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Claude is not running. Please reconnect to start a new session.'
            }));
          }
        }
      } else if (data.type === 'resize') {
        // Terminal resize not supported without PTY
        console.log('[Shell] Terminal resize requested but not supported without PTY');
      }
    } catch (error) {
      console.error('[Shell] WebSocket message error:', error.message);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    }
  });
  
  ws.on('close', () => {
    console.log('[Shell] Client disconnected');
    if (shellProcess) {
      console.log('[Shell] Killing claude process:', shellProcess.pid);
      try {
        shellProcess.kill('SIGTERM');
        // Give it a moment to terminate gracefully
        setTimeout(() => {
          if (shellProcess && !shellProcess.killed) {
            console.log('[Shell] Force killing process');
            shellProcess.kill('SIGKILL');
          }
        }, 1000);
      } catch (error) {
        console.error('[Shell] Error killing process:', error);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error('[Shell] WebSocket error:', error);
  });
}

// Audio transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const multer = require('multer');
    const upload = multer({ storage: multer.memoryStorage() });
    
    // Handle multipart form data
    upload.single('audio')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to process audio file' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }
      
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in server environment.' });
      }
      
      try {
        // Create form data for OpenAI
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype
        });
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');
        formData.append('language', 'en');
        
        // Make request to OpenAI
        const fetch = require('node-fetch');
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
          throw new Error(errorData.error?.message || `Whisper API error: ${response.status}`);
        }
        
        const data = await response.json();
        let transcribedText = data.text || '';
        
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
          const OpenAI = require('openai');
          const openai = new OpenAI({ apiKey });
          
          let prompt, systemMessage, temperature = 0.7, maxTokens = 800;
          
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
            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt }
              ],
              temperature: temperature,
              max_tokens: maxTokens
            });
            
            transcribedText = completion.choices[0].message.content || transcribedText;
          }
          
        } catch (gptError) {
          console.error('GPT processing error:', gptError);
          // Fall back to original transcription if GPT fails
        }
        
        res.json({ text: transcribedText });
        
      } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error('Endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for all other routes (except static assets)
app.get('*', (req, res) => {
  // Don't serve HTML for asset requests
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

async function getFileTree(dirPath, maxDepth = 3, currentDepth = 0, showHidden = true) {
  const fs = require('fs').promises;
  const items = [];
  
  // Validate directory path at the start
  try {
    const stats = await fs.lstat(dirPath);
    if (!stats.isDirectory()) {
      console.error(`getFileTree called on non-directory: ${dirPath}`);
      if (stats.isFile()) {
        // If it's a file, return it as a single item
        return [{
          name: path.basename(dirPath),
          path: dirPath,
          type: 'file'
        }];
      }
      // For other types (symlink, etc.), return empty
      return [];
    }
  } catch (error) {
    console.error(`getFileTree: Cannot access path ${dirPath}:`, error.code, error.message);
    
    // Return empty array for most errors, but log specific ones
    if (error.code === 'ENOTDIR') {
      console.error(`Path is not a directory: ${dirPath}`);
    } else if (error.code === 'ENOENT') {
      console.error(`Path does not exist: ${dirPath}`);
    }
    
    return [];
  }
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    // If directory is empty, log it
    if (entries.length === 0 && currentDepth === 0) {
      console.log(`📂 Directory is empty: ${dirPath}`);
    }
    
    for (const entry of entries) {
      // Debug: log all entries including hidden files
      if (entry.name.startsWith('.') && currentDepth === 0) {
        console.log('📁 Found hidden file/folder:', entry.name);
      }
      
      // Skip only heavy build directories
      if (entry.name === 'node_modules' || 
          entry.name === 'dist' || 
          entry.name === 'build') continue;
      
      const item = {
        name: entry.name,
        path: path.join(dirPath, entry.name),
        type: entry.isDirectory() ? 'directory' : 'file'
      };
      
      if (entry.isDirectory() && currentDepth < maxDepth) {
        // Recursively get subdirectories but limit depth
        try {
          // Check if we can access the directory before trying to read it
          await fs.access(item.path, fs.constants.R_OK);
          item.children = await getFileTree(item.path, maxDepth, currentDepth + 1, showHidden);
        } catch (e) {
          // Log permission errors at root level for debugging
          if (currentDepth === 0 && (e.code === 'EACCES' || e.code === 'EPERM')) {
            console.log(`⚠️ Cannot access subdirectory: ${item.name} (${e.code})`);
          }
          item.children = [];
        }
      }
      
      items.push(item);
    }
  } catch (error) {
    // Log all errors with more context
    console.error(`Error reading directory ${dirPath}:`, error.code, error.message);
    
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      console.error('Permission denied - check directory permissions');
    } else if (error.code === 'ENOTDIR') {
      console.error('Path is not a directory - this should not happen after validation');
    } else if (error.code === 'ENOENT') {
      console.error('Directory was removed during traversal');
    }
    
    // Return empty array instead of throwing
    return [];
  }
  
  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Claude Code UI server running on http://0.0.0.0:${PORT}`);
  
  // Start watching the projects folder for changes
  setupProjectsWatcher();
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (serverManager) {
    serverManager.cleanupAll();
  }
  if (projectsWatcher) {
    projectsWatcher.close();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (serverManager) {
    serverManager.cleanupAll();
  }
  if (projectsWatcher) {
    projectsWatcher.close();
  }
  process.exit(0);
});