// Load environment variables from .env file
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '../../.env');
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

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 9001;
console.log('PORT from env:', PORT);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Create HTTP server separately
const server = http.createServer(app);

// Create WebSocket server on a different path
const wss = new WebSocketServer({ 
  noServer: true  // Important: don't auto-handle upgrades
});

// Handle WebSocket upgrades only for /ws path
server.on('upgrade', (request, socket, head) => {
  console.log('Upgrade request for:', request.url);
  
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Simple API routes for testing
app.get('/api/config', (req, res) => {
  res.json({ 
    webSocketUrl: `ws://localhost:${PORT}/ws`,
    apiUrl: `http://localhost:${PORT}` 
  });
});

app.get('/api/projects', async (req, res) => {
  try {
    const { getProjects } = require('./projects');
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Fixed server running on http://0.0.0.0:${PORT}`);
});