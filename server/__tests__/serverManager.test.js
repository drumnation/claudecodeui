import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import { EventEmitter } from 'events';

// Mock dependencies
vi.mock('child_process', () => ({
  spawn: vi.fn(),
  exec: vi.fn()
}));

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn()
  }
}));

// Dynamic imports for CommonJS modules
const { spawn, exec } = await import('child_process');
const fsPromises = (await import('fs')).promises;
const ServerManager = (await import('../serverManager.js')).default;

// Mock process.platform
Object.defineProperty(process, 'platform', {
  value: 'darwin',
  configurable: true
});

describe('serverManager.js', () => {
  let serverManager;
  let mockProcess;
  let mockStdout;
  let mockStderr;
  let mockWsServer;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock process
    mockStdout = new EventEmitter();
    mockStderr = new EventEmitter();
    mockProcess = new EventEmitter();
    mockProcess.stdout = mockStdout;
    mockProcess.stderr = mockStderr;
    mockProcess.pid = 12345;
    mockProcess.kill = vi.fn();

    // Mock spawn to return our mock process
    spawn.mockReturnValue(mockProcess);

    // Create mock WebSocket server
    mockWsServer = {
      broadcast: vi.fn()
    };

    // Create new ServerManager instance
    serverManager = new ServerManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    serverManager.cleanupAll();
  });

  describe('startServer', () => {
    it('should start a server process successfully', async () => {
      const startPromise = serverManager.startServer('test-server', 'npm', ['run', 'dev'], '/project', mockWsServer);

      // Simulate server startup with port detection
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server running on port 3000\n'));
      }, 10);

      const result = await startPromise;

      expect(result).toEqual({
        success: true,
        port: 3000,
        message: 'Server started successfully on port 3000'
      });
      expect(spawn).toHaveBeenCalledWith('npm', ['run', 'dev'], {
        cwd: '/project',
        shell: true,
        env: expect.objectContaining(process.env)
      });
      expect(mockWsServer.broadcast).toHaveBeenCalledWith({
        type: 'server-status',
        servers: expect.objectContaining({
          'test-server': expect.objectContaining({
            status: 'running',
            port: 3000,
            pid: 12345
          })
        })
      });
    });

    it('should detect various port formats', async () => {
      const portFormats = [
        { output: 'Listening on http://localhost:4000', expectedPort: 4000 },
        { output: 'Server started at 0.0.0.0:5000', expectedPort: 5000 },
        { output: 'Running on http://127.0.0.1:8080/', expectedPort: 8080 },
        { output: 'Express server listening on port 3001', expectedPort: 3001 },
        { output: 'Dev server running at:\n  > Local: http://localhost:5173/', expectedPort: 5173 }
      ];

      for (const { output, expectedPort } of portFormats) {
        vi.clearAllMocks();
        serverManager = new ServerManager();
        
        const startPromise = serverManager.startServer('test-server', 'npm', ['start'], '/project', mockWsServer);
        
        setTimeout(() => {
          mockStdout.emit('data', Buffer.from(output));
        }, 10);

        const result = await startPromise;

        expect(result.port).toBe(expectedPort);
        expect(result.success).toBe(true);
      }
    });

    it('should handle server startup without port detection', async () => {
      const startPromise = serverManager.startServer('test-server', 'npm', ['run', 'build'], '/project', mockWsServer);

      // Simulate process exit without port
      setTimeout(() => {
        mockProcess.emit('exit', 0);
      }, 10);

      const result = await startPromise;

      expect(result).toEqual({
        success: true,
        message: 'Process completed successfully'
      });
    });

    it('should handle server startup errors', async () => {
      const startPromise = serverManager.startServer('test-server', 'npm', ['run', 'nonexistent'], '/project', mockWsServer);

      // Simulate error
      setTimeout(() => {
        mockStderr.emit('data', Buffer.from('npm ERR! missing script: nonexistent\n'));
        mockProcess.emit('exit', 1);
      }, 10);

      const result = await startPromise;

      expect(result).toEqual({
        success: false,
        error: 'Process exited with code 1'
      });
    });

    it('should handle spawn errors', async () => {
      spawn.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const result = await serverManager.startServer('test-server', 'invalid-cmd', [], '/project', mockWsServer);

      expect(result).toEqual({
        success: false,
        error: 'Command not found'
      });
    });

    it('should prevent starting duplicate servers', async () => {
      // Start first server
      const startPromise1 = serverManager.startServer('test-server', 'npm', ['start'], '/project', mockWsServer);
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      await startPromise1;

      // Try to start same server again
      const result = await serverManager.startServer('test-server', 'npm', ['start'], '/project', mockWsServer);

      expect(result).toEqual({
        success: false,
        error: 'Server test-server is already running'
      });
    });

    it('should handle process crash and cleanup', async () => {
      const startPromise = serverManager.startServer('test-server', 'npm', ['start'], '/project', mockWsServer);
      
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      
      await startPromise;

      // Simulate process crash
      mockProcess.emit('exit', 1);

      expect(mockWsServer.broadcast).toHaveBeenLastCalledWith({
        type: 'server-status',
        servers: {}
      });
      expect(serverManager.getServerStatus()).toEqual({});
    });
  });

  describe('stopServer', () => {
    it('should stop a running server', async () => {
      // Start server first
      const startPromise = serverManager.startServer('test-server', 'npm', ['start'], '/project', mockWsServer);
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      await startPromise;

      // Stop the server
      const result = await serverManager.stopServer('test-server', mockWsServer);

      expect(result).toEqual({
        success: true,
        message: 'Server test-server stopped'
      });
      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
      expect(mockWsServer.broadcast).toHaveBeenLastCalledWith({
        type: 'server-status',
        servers: {}
      });
    });

    it('should handle stopping non-existent server', async () => {
      const result = await serverManager.stopServer('nonexistent', mockWsServer);

      expect(result).toEqual({
        success: false,
        error: 'Server nonexistent is not running'
      });
    });

    it('should use platform-specific kill commands', async () => {
      // Test Windows
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true
      });
      
      vi.mocked(exec).mockImplementation((cmd, cb) => cb(null));

      // Start server
      const startPromise = serverManager.startServer('test-server', 'npm', ['start'], '/project', mockWsServer);
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      await startPromise;

      // Stop server on Windows
      await serverManager.stopServer('test-server', mockWsServer);

      expect(exec).toHaveBeenCalledWith(
        `taskkill /pid 12345 /T /F`,
        expect.any(Function)
      );

      // Reset platform
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        configurable: true
      });
    });

    it('should handle kill errors gracefully', async () => {
      // Start server
      const startPromise = serverManager.startServer('test-server', 'npm', ['start'], '/project', mockWsServer);
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      await startPromise;

      // Mock kill to throw error
      mockProcess.kill.mockImplementation(() => {
        throw new Error('Process not found');
      });

      const result = await serverManager.stopServer('test-server', mockWsServer);

      expect(result.success).toBe(true); // Should still clean up
      expect(serverManager.getServerStatus()).toEqual({});
    });
  });

  describe('getServerStatus', () => {
    it('should return empty object when no servers running', () => {
      const status = serverManager.getServerStatus();
      expect(status).toEqual({});
    });

    it('should return status of running servers', async () => {
      // Start multiple servers
      const startPromise1 = serverManager.startServer('server1', 'npm', ['start'], '/project1', mockWsServer);
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      await startPromise1;

      // Create new mock process for second server
      const mockProcess2 = new EventEmitter();
      mockProcess2.stdout = new EventEmitter();
      mockProcess2.stderr = new EventEmitter();
      mockProcess2.pid = 12346;
      spawn.mockReturnValue(mockProcess2);

      const startPromise2 = serverManager.startServer('server2', 'yarn', ['dev'], '/project2', mockWsServer);
      setTimeout(() => {
        mockProcess2.stdout.emit('data', Buffer.from('Server on port 4000'));
      }, 10);
      await startPromise2;

      const status = serverManager.getServerStatus();

      expect(status).toEqual({
        server1: {
          status: 'running',
          command: 'npm',
          args: ['start'],
          cwd: '/project1',
          port: 3000,
          pid: 12345
        },
        server2: {
          status: 'running',
          command: 'yarn',
          args: ['dev'],
          cwd: '/project2',
          port: 4000,
          pid: 12346
        }
      });
    });
  });

  describe('getAvailableScripts', () => {
    it('should return npm scripts from package.json', async () => {
      fsPromises.readFile.mockResolvedValue(JSON.stringify({
        name: 'test-project',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          test: 'vitest',
          'test:coverage': 'vitest --coverage'
        }
      }));

      const scripts = await serverManager.getAvailableScripts('/project');

      expect(scripts).toEqual([
        { name: 'dev', command: 'npm run dev' },
        { name: 'build', command: 'npm run build' },
        { name: 'test', command: 'npm run test' },
        { name: 'test:coverage', command: 'npm run test:coverage' }
      ]);
    });

    it('should return empty array when no package.json', async () => {
      fsPromises.readFile.mockRejectedValue({ code: 'ENOENT' });

      const scripts = await serverManager.getAvailableScripts('/project');

      expect(scripts).toEqual([]);
    });

    it('should return empty array when package.json has no scripts', async () => {
      fsPromises.readFile.mockResolvedValue(JSON.stringify({
        name: 'test-project'
      }));

      const scripts = await serverManager.getAvailableScripts('/project');

      expect(scripts).toEqual([]);
    });

    it('should handle malformed package.json', async () => {
      fsPromises.readFile.mockResolvedValue('invalid json');

      const scripts = await serverManager.getAvailableScripts('/project');

      expect(scripts).toEqual([]);
    });
  });

  describe('cleanupAll', () => {
    it('should stop all running servers', async () => {
      // Start multiple servers
      const startPromise1 = serverManager.startServer('server1', 'npm', ['start'], '/project1', mockWsServer);
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      await startPromise1;

      // Create new mock process for second server
      const mockProcess2 = new EventEmitter();
      mockProcess2.stdout = new EventEmitter();
      mockProcess2.stderr = new EventEmitter();
      mockProcess2.pid = 12346;
      mockProcess2.kill = vi.fn();
      spawn.mockReturnValue(mockProcess2);

      const startPromise2 = serverManager.startServer('server2', 'yarn', ['dev'], '/project2', mockWsServer);
      setTimeout(() => {
        mockProcess2.stdout.emit('data', Buffer.from('Server on port 4000'));
      }, 10);
      await startPromise2;

      // Cleanup all
      serverManager.cleanupAll();

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
      expect(mockProcess2.kill).toHaveBeenCalledWith('SIGTERM');
      expect(serverManager.getServerStatus()).toEqual({});
    });

    it('should handle cleanup errors gracefully', async () => {
      const startPromise = serverManager.startServer('server1', 'npm', ['start'], '/project', mockWsServer);
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      await startPromise;

      // Mock kill to throw
      mockProcess.kill.mockImplementation(() => {
        throw new Error('Already dead');
      });

      // Should not throw
      expect(() => serverManager.cleanupAll()).not.toThrow();
      expect(serverManager.getServerStatus()).toEqual({});
    });
  });

  describe('WebSocket broadcasting', () => {
    it('should broadcast status updates when servers change', async () => {
      vi.clearAllMocks();

      // Start server
      const startPromise = serverManager.startServer('test-server', 'npm', ['start'], '/project', mockWsServer);
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      await startPromise;

      // Should have broadcast on start
      expect(mockWsServer.broadcast).toHaveBeenCalledWith({
        type: 'server-status',
        servers: expect.objectContaining({
          'test-server': expect.objectContaining({
            status: 'running',
            port: 3000
          })
        })
      });

      // Stop server
      await serverManager.stopServer('test-server', mockWsServer);

      // Should have broadcast on stop
      expect(mockWsServer.broadcast).toHaveBeenLastCalledWith({
        type: 'server-status',
        servers: {}
      });
    });

    it('should handle missing WebSocket server gracefully', async () => {
      // Start without WebSocket server
      const startPromise = serverManager.startServer('test-server', 'npm', ['start'], '/project');
      setTimeout(() => {
        mockStdout.emit('data', Buffer.from('Server on port 3000'));
      }, 10);
      
      // Should not throw
      await expect(startPromise).resolves.toEqual({
        success: true,
        port: 3000,
        message: 'Server started successfully on port 3000'
      });
    });
  });
});