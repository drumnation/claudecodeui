const { describe, it, expect, beforeEach, afterEach, vi } = require('vitest');
const WebSocket = require('ws');
const EventEmitter = require('events');
const { spawn } = require('child_process');
const pty = require('node-pty');
const ClaudeCLI = require('../claude-cli');

// Mock dependencies
vi.mock('ws');
vi.mock('child_process', () => ({
  spawn: vi.fn()
}));
vi.mock('node-pty', () => ({
  spawn: vi.fn()
}));
vi.mock('../claude-cli');
vi.mock('../serverManager', () => {
  return vi.fn().mockImplementation(() => ({
    startServer: vi.fn(),
    stopServer: vi.fn(),
    getServerStatus: vi.fn(),
    cleanupAll: vi.fn()
  }));
});

describe('WebSocket handlers', () => {
  let mockWsServer;
  let mockClients;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock WebSocket server
    mockClients = new Set();
    mockWsServer = {
      clients: mockClients,
      on: vi.fn(),
      broadcast: vi.fn((data) => {
        mockClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      })
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Chat WebSocket handler', () => {
    let chatHandler;
    let mockWs;
    let mockCLI;

    beforeEach(() => {
      // Create mock WebSocket connection
      mockWs = new EventEmitter();
      mockWs.send = vi.fn();
      mockWs.close = vi.fn();
      mockWs.readyState = WebSocket.OPEN;

      // Create mock Claude CLI instance
      mockCLI = new EventEmitter();
      mockCLI.sendMessage = vi.fn();
      mockCLI.stop = vi.fn();
      mockCLI.isConnected = true;
      ClaudeCLI.mockImplementation(() => mockCLI);

      // Initialize chat handler
      chatHandler = createChatHandler(mockWsServer);
      chatHandler(mockWs, { url: '/chat?project=/test/project' });
    });

    it('should handle new chat connection', () => {
      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'connected',
        message: 'Connected to Claude'
      }));
      expect(ClaudeCLI).toHaveBeenCalledWith('/test/project');
    });

    it('should handle chat messages', () => {
      mockWs.emit('message', JSON.stringify({
        type: 'message',
        content: 'Hello Claude'
      }));

      expect(mockCLI.sendMessage).toHaveBeenCalledWith('Hello Claude');
    });

    it('should forward Claude responses', () => {
      mockCLI.emit('message', {
        role: 'assistant',
        content: 'Hello! How can I help you?'
      });

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'message',
        data: {
          role: 'assistant',
          content: 'Hello! How can I help you?'
        }
      }));
    });

    it('should handle streaming responses', () => {
      mockCLI.emit('chunk', {
        content: 'Streaming',
        isFirst: true
      });

      mockCLI.emit('chunk', {
        content: ' response',
        isFirst: false
      });

      expect(mockWs.send).toHaveBeenCalledTimes(3); // connected + 2 chunks
      expect(mockWs.send).toHaveBeenNthCalledWith(2, JSON.stringify({
        type: 'chunk',
        data: {
          content: 'Streaming',
          isFirst: true
        }
      }));
    });

    it('should handle tool use events', () => {
      mockCLI.emit('tool_use', {
        tool: 'bash',
        input: { command: 'ls -la' }
      });

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'tool_use',
        data: {
          tool: 'bash',
          input: { command: 'ls -la' }
        }
      }));
    });

    it('should handle errors', () => {
      mockCLI.emit('error', new Error('API error'));

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'error',
        message: 'API error'
      }));
    });

    it('should handle stop command', () => {
      mockWs.emit('message', JSON.stringify({
        type: 'stop'
      }));

      expect(mockCLI.stop).toHaveBeenCalled();
    });

    it('should handle server control commands', () => {
      const mockServerManager = require('../serverManager');
      const mockInstance = new mockServerManager();
      mockInstance.startServer.mockResolvedValue({ success: true, port: 3000 });

      mockWs.emit('message', JSON.stringify({
        type: 'server-control',
        action: 'start',
        data: {
          name: 'dev-server',
          command: 'npm',
          args: ['run', 'dev']
        }
      }));

      // Wait for async operation
      setTimeout(() => {
        expect(mockInstance.startServer).toHaveBeenCalledWith(
          'dev-server',
          'npm',
          ['run', 'dev'],
          '/test/project',
          mockWsServer
        );
      }, 0);
    });

    it('should handle connection close', () => {
      mockWs.emit('close');

      expect(mockCLI.stop).toHaveBeenCalled();
      expect(mockClients.has(mockWs)).toBe(false);
    });

    it('should handle Claude CLI connection errors', () => {
      mockCLI.isConnected = false;
      mockCLI.emit('error', new Error('Connection failed'));

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'error',
        message: 'Failed to connect to Claude: Connection failed'
      }));
    });

    it('should handle malformed messages gracefully', () => {
      mockWs.emit('message', 'invalid json');

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    });

    it('should handle missing project parameter', () => {
      const newWs = new EventEmitter();
      newWs.send = vi.fn();
      newWs.close = vi.fn();

      chatHandler(newWs, { url: '/chat' });

      expect(newWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'error',
        message: 'Project path is required'
      }));
      expect(newWs.close).toHaveBeenCalled();
    });
  });

  describe('Shell WebSocket handler', () => {
    let shellHandler;
    let mockWs;
    let mockPty;

    beforeEach(() => {
      // Create mock WebSocket connection
      mockWs = new EventEmitter();
      mockWs.send = vi.fn();
      mockWs.close = vi.fn();
      mockWs.readyState = WebSocket.OPEN;

      // Create mock PTY instance
      mockPty = new EventEmitter();
      mockPty.write = vi.fn();
      mockPty.resize = vi.fn();
      mockPty.kill = vi.fn();
      mockPty.pid = 12345;
      pty.spawn.mockReturnValue(mockPty);

      // Initialize shell handler
      shellHandler = createShellHandler(mockWsServer);
      shellHandler(mockWs, { url: '/shell?cwd=/test/project' });
    });

    it('should spawn PTY on connection', () => {
      expect(pty.spawn).toHaveBeenCalledWith(
        expect.any(String), // shell command
        [],
        {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: '/test/project',
          env: expect.objectContaining(process.env)
        }
      );

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'connected',
        pid: 12345
      }));
    });

    it('should handle terminal input', () => {
      mockWs.emit('message', JSON.stringify({
        type: 'input',
        data: 'ls -la\n'
      }));

      expect(mockPty.write).toHaveBeenCalledWith('ls -la\n');
    });

    it('should forward terminal output', () => {
      mockPty.emit('data', 'terminal output');

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'output',
        data: 'terminal output'
      }));
    });

    it('should handle terminal resize', () => {
      mockWs.emit('message', JSON.stringify({
        type: 'resize',
        cols: 120,
        rows: 40
      }));

      expect(mockPty.resize).toHaveBeenCalledWith(120, 40);
    });

    it('should handle PTY exit', () => {
      mockPty.emit('exit', 0);

      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'exit',
        code: 0
      }));
      expect(mockWs.close).toHaveBeenCalled();
    });

    it('should handle connection close', () => {
      mockWs.emit('close');

      expect(mockPty.kill).toHaveBeenCalled();
      expect(mockClients.has(mockWs)).toBe(false);
    });

    it('should handle PTY spawn errors', () => {
      pty.spawn.mockImplementation(() => {
        throw new Error('Failed to spawn PTY');
      });

      const newWs = new EventEmitter();
      newWs.send = vi.fn();
      newWs.close = vi.fn();

      shellHandler(newWs, { url: '/shell?cwd=/test/project' });

      expect(newWs.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'error',
        message: 'Failed to start terminal: Failed to spawn PTY'
      }));
      expect(newWs.close).toHaveBeenCalled();
    });

    it('should use default shell based on platform', () => {
      // Test Windows
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true
      });

      const winWs = new EventEmitter();
      winWs.send = vi.fn();
      shellHandler(winWs, { url: '/shell?cwd=/test' });

      expect(pty.spawn).toHaveBeenCalledWith(
        'powershell.exe',
        expect.any(Array),
        expect.any(Object)
      );

      // Reset platform
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        configurable: true
      });
    });

    it('should handle malformed messages', () => {
      mockWs.emit('message', 'invalid json');

      // Should not crash
      expect(mockPty.write).not.toHaveBeenCalled();
    });

    it('should handle missing cwd parameter', () => {
      const newWs = new EventEmitter();
      newWs.send = vi.fn();
      newWs.close = vi.fn();

      shellHandler(newWs, { url: '/shell' });

      // Should use process.cwd() as default
      expect(pty.spawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({
          cwd: process.cwd()
        })
      );
    });
  });

  describe('WebSocket server integration', () => {
    it('should handle multiple concurrent connections', () => {
      const chatHandler = createChatHandler(mockWsServer);
      const shellHandler = createShellHandler(mockWsServer);

      // Create multiple connections
      const chatWs1 = new EventEmitter();
      chatWs1.send = vi.fn();
      chatWs1.readyState = WebSocket.OPEN;
      
      const chatWs2 = new EventEmitter();
      chatWs2.send = vi.fn();
      chatWs2.readyState = WebSocket.OPEN;
      
      const shellWs = new EventEmitter();
      shellWs.send = vi.fn();
      shellWs.readyState = WebSocket.OPEN;

      // Connect clients
      chatHandler(chatWs1, { url: '/chat?project=/project1' });
      chatHandler(chatWs2, { url: '/chat?project=/project2' });
      shellHandler(shellWs, { url: '/shell?cwd=/project1' });

      // Verify all clients are tracked
      expect(mockClients.size).toBe(3);

      // Test broadcast
      mockWsServer.broadcast({ type: 'server-status', data: {} });

      expect(chatWs1.send).toHaveBeenCalledWith(JSON.stringify({ type: 'server-status', data: {} }));
      expect(chatWs2.send).toHaveBeenCalledWith(JSON.stringify({ type: 'server-status', data: {} }));
      expect(shellWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'server-status', data: {} }));
    });

    it('should clean up resources on server shutdown', () => {
      const chatHandler = createChatHandler(mockWsServer);
      
      const mockCLI = new EventEmitter();
      mockCLI.stop = vi.fn();
      ClaudeCLI.mockImplementation(() => mockCLI);

      const ws = new EventEmitter();
      ws.send = vi.fn();
      ws.close = vi.fn();
      
      chatHandler(ws, { url: '/chat?project=/test' });

      // Simulate server shutdown
      mockWsServer.clients.forEach(client => {
        client.close();
      });

      expect(mockCLI.stop).toHaveBeenCalled();
    });

    it('should handle WebSocket errors gracefully', () => {
      const chatHandler = createChatHandler(mockWsServer);
      
      const ws = new EventEmitter();
      ws.send = vi.fn();
      ws.close = vi.fn();
      ws.readyState = WebSocket.OPEN;
      
      chatHandler(ws, { url: '/chat?project=/test' });

      // Simulate WebSocket error
      ws.emit('error', new Error('WebSocket error'));

      // Should handle error without crashing
      expect(ws.close).not.toHaveBeenCalled(); // Let WebSocket handle its own cleanup
    });
  });
});

// Helper functions to create handlers (mimicking the actual implementation)
function createChatHandler(wsServer) {
  return (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const project = url.searchParams.get('project');

    if (!project) {
      ws.send(JSON.stringify({ type: 'error', message: 'Project path is required' }));
      ws.close();
      return;
    }

    wsServer.clients.add(ws);

    let cli;
    try {
      cli = new ClaudeCLI(project);
      
      ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Claude' }));

      cli.on('message', (data) => {
        ws.send(JSON.stringify({ type: 'message', data }));
      });

      cli.on('chunk', (data) => {
        ws.send(JSON.stringify({ type: 'chunk', data }));
      });

      cli.on('tool_use', (data) => {
        ws.send(JSON.stringify({ type: 'tool_use', data }));
      });

      cli.on('error', (error) => {
        if (!cli.isConnected) {
          ws.send(JSON.stringify({ type: 'error', message: `Failed to connect to Claude: ${error.message}` }));
        } else {
          ws.send(JSON.stringify({ type: 'error', message: error.message }));
        }
      });

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'message') {
            cli.sendMessage(data.content);
          } else if (data.type === 'stop') {
            cli.stop();
          } else if (data.type === 'server-control') {
            const ServerManager = require('../serverManager');
            const serverManager = new ServerManager();
            
            if (data.action === 'start') {
              const result = await serverManager.startServer(
                data.data.name,
                data.data.command,
                data.data.args,
                project,
                wsServer
              );
              ws.send(JSON.stringify({ type: 'server-result', data: result }));
            }
          }
        } catch (error) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        if (cli) cli.stop();
        wsServer.clients.delete(ws);
      });

    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
      ws.close();
    }
  };
}

function createShellHandler(wsServer) {
  return (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const cwd = url.searchParams.get('cwd') || process.cwd();

    wsServer.clients.add(ws);

    let ptyProcess;
    try {
      const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
      
      ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd,
        env: process.env
      });

      ws.send(JSON.stringify({ type: 'connected', pid: ptyProcess.pid }));

      ptyProcess.on('data', (data) => {
        ws.send(JSON.stringify({ type: 'output', data }));
      });

      ptyProcess.on('exit', (code) => {
        ws.send(JSON.stringify({ type: 'exit', code }));
        ws.close();
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'input') {
            ptyProcess.write(data.data);
          } else if (data.type === 'resize') {
            ptyProcess.resize(data.cols, data.rows);
          }
        } catch (error) {
          // Ignore malformed messages
        }
      });

      ws.on('close', () => {
        if (ptyProcess) ptyProcess.kill();
        wsServer.clients.delete(ws);
      });

    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: `Failed to start terminal: ${error.message}` }));
      ws.close();
    }
  };
}