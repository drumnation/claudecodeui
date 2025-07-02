import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {spawn} from 'child_process';
import {createServerManager} from './servers.service.js';
import * as repository from './servers.repository.js';
import type {WebSocketMessage} from './servers.types.js';

vi.mock('child_process');
vi.mock('./servers.repository.js');

describe('servers.service', () => {
  let broadcast: ReturnType<typeof vi.fn>;
  let serverManager: ReturnType<typeof createServerManager>;
  let mockChildProcess: any;
  let mockLogger: any;

  beforeEach(() => {
    vi.clearAllMocks();
    broadcast = vi.fn();
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      isLevelEnabled: vi.fn().mockReturnValue(false),
      child: vi.fn().mockReturnThis(),
    };
    serverManager = createServerManager(broadcast, mockLogger);

    // Create mock child process
    mockChildProcess = {
      stdout: {on: vi.fn()},
      stderr: {on: vi.fn()},
      on: vi.fn(),
      kill: vi.fn(),
      killed: false,
      pid: 12345,
    };

    vi.mocked(spawn).mockReturnValue(mockChildProcess as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('startServer', () => {
    it('should start a server successfully', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      const result = await serverManager.startServer('/project/path', 'dev');

      expect(result.success).toBe(true);
      expect(spawn).toHaveBeenCalledWith(expect.any(String), ['run', 'dev'], {
        cwd: '/project/path',
        env: expect.objectContaining({FORCE_COLOR: '1'}),
        shell: true,
      });
      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:status',
        projectPath: '/project/path',
        status: 'starting',
        url: null,
        script: 'dev',
        timestamp: expect.any(String),
      });
    });

    it('should detect port from stdout', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');

      // Simulate stdout data with port information
      const stdoutHandler = mockChildProcess.stdout.on.mock.calls[0][1];
      stdoutHandler(Buffer.from('Local: http://localhost:3000'));

      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:status',
        projectPath: '/project/path',
        status: 'running',
        url: 'http://localhost:3000',
        script: 'dev',
        timestamp: expect.any(String),
      });
    });

    it('should broadcast logs from stdout and stderr', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');

      // Simulate stdout data
      const stdoutHandler = mockChildProcess.stdout.on.mock.calls[0][1];
      stdoutHandler(Buffer.from('Server starting...'));

      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:log',
        projectPath: '/project/path',
        message: 'Server starting...',
        stream: 'stdout',
        timestamp: expect.any(String),
      });

      // Simulate stderr data
      const stderrHandler = mockChildProcess.stderr.on.mock.calls[0][1];
      stderrHandler(Buffer.from('Warning: deprecated'));

      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:log',
        projectPath: '/project/path',
        message: 'Warning: deprecated',
        stream: 'stderr',
        timestamp: expect.any(String),
      });
    });

    it('should handle process exit', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');

      // Simulate process exit
      const exitHandler = mockChildProcess.on.mock.calls.find(
        (call) => call[0] === 'exit',
      )?.[1];
      exitHandler(0);

      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:status',
        projectPath: '/project/path',
        status: 'stopped',
        url: null,
        script: 'dev',
        timestamp: expect.any(String),
      });
    });

    it('should handle process error', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');

      // Simulate process error
      const errorHandler = mockChildProcess.on.mock.calls.find(
        (call) => call[0] === 'error',
      )?.[1];
      errorHandler(new Error('Failed to start'));

      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:status',
        projectPath: '/project/path',
        status: 'error',
        url: null,
        script: 'dev',
        timestamp: expect.any(String),
      });
    });

    it('should return error if script not found', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      const result = await serverManager.startServer('/project/path', 'build');

      expect(result.error).toBe('Script not found');
      expect(spawn).not.toHaveBeenCalled();
    });

    it('should return error if package.json not found', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue(null);

      const result = await serverManager.startServer('/project/path', 'dev');

      expect(result.error).toBe('Script not found');
      expect(spawn).not.toHaveBeenCalled();
    });

    it('should prevent starting the same server twice', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');
      const result = await serverManager.startServer('/project/path', 'dev');

      expect(result.error).toBe('Server is already running');
      expect(spawn).toHaveBeenCalledTimes(1);
    });

    it('should fallback to port 3000 after timeout', async () => {
      vi.useFakeTimers();
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000);

      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:status',
        projectPath: '/project/path',
        status: 'running',
        url: 'http://localhost:3000',
        script: 'dev',
        timestamp: expect.any(String),
      });
    });

    it('should handle spawn errors', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });
      vi.mocked(spawn).mockImplementation(() => {
        throw new Error('Spawn failed');
      });

      const result = await serverManager.startServer('/project/path', 'dev');

      expect(result.error).toBe('Spawn failed');
      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:status',
        projectPath: '/project/path',
        status: 'error',
        url: null,
        script: 'dev',
        timestamp: expect.any(String),
      });
    });
  });

  describe('stopServer', () => {
    it('should stop a specific server', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');
      const result = await serverManager.stopServer('/project/path', 'dev');

      expect(result.success).toBe(true);
      expect(mockChildProcess.kill).toHaveBeenCalledWith('SIGTERM');
      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:status',
        projectPath: '/project/path',
        status: 'stopping',
        url: null,
        script: 'dev',
        timestamp: expect.any(String),
      });
    });

    it('should stop all servers for a project', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev', test: 'npm test'},
      });

      await serverManager.startServer('/project/path', 'dev');
      await serverManager.startServer('/project/path', 'test');

      const result = await serverManager.stopServer('/project/path');

      expect(result.success).toBe(true);
      expect(mockChildProcess.kill).toHaveBeenCalledTimes(2);
    });

    it('should force kill if process does not die gracefully', async () => {
      vi.useFakeTimers();
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');
      await serverManager.stopServer('/project/path', 'dev');

      expect(mockChildProcess.kill).toHaveBeenCalledWith('SIGTERM');

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000);

      expect(mockChildProcess.kill).toHaveBeenCalledWith('SIGKILL');
    });

    it('should handle Windows platform differently', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', {value: 'win32'});

      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');
      await serverManager.stopServer('/project/path', 'dev');

      expect(spawn).toHaveBeenCalledWith('taskkill', [
        '/pid',
        '12345',
        '/f',
        '/t',
      ]);

      Object.defineProperty(process, 'platform', {value: originalPlatform});
    });

    it('should handle errors when stopping server', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');
      mockChildProcess.kill.mockImplementation(() => {
        throw new Error('Kill failed');
      });

      const result = await serverManager.stopServer('/project/path', 'dev');

      expect(result.success).toBe(true); // Still returns success
      expect(broadcast).toHaveBeenCalledWith({
        type: 'server:status',
        projectPath: '/project/path',
        status: 'error',
        url: null,
        script: 'dev',
        timestamp: expect.any(String),
      });
    });
  });

  describe('getServerStatus', () => {
    it('should return status for all servers in a project', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev', test: 'npm test'},
      });

      await serverManager.startServer('/project/path', 'dev');
      await serverManager.startServer('/project/path', 'test');
      await serverManager.startServer('/other/path', 'dev');

      const status = serverManager.getServerStatus('/project/path');

      expect(status).toHaveLength(2);
      expect(status).toContainEqual(
        expect.objectContaining({
          script: 'dev',
          status: 'running',
        }),
      );
      expect(status).toContainEqual(
        expect.objectContaining({
          script: 'test',
          status: 'running',
        }),
      );
    });

    it('should return empty array for project with no servers', () => {
      const status = serverManager.getServerStatus('/project/path');
      expect(status).toEqual([]);
    });
  });

  describe('cleanupAll', () => {
    it('should kill all server processes', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project1', 'dev');
      await serverManager.startServer('/project2', 'dev');

      serverManager.cleanupAll();

      expect(mockChildProcess.kill).toHaveBeenCalledTimes(2);
    });

    it('should handle errors when killing processes', async () => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project1', 'dev');
      mockChildProcess.kill.mockImplementation(() => {
        throw new Error('Kill failed');
      });

      // Should not throw
      expect(() => serverManager.cleanupAll()).not.toThrow();
    });
  });

  describe('port detection', () => {
    it.each([
      ['Local: http://localhost:4000', '4000'],
      ['listening on port 5000', '5000'],
      ['Server running at http://localhost:8080', '8080'],
      ['http://localhost:9000', '9000'],
      ['Port: 3001', '3001'],
    ])('should detect port from "%s"', async (output, expectedPort) => {
      vi.mocked(repository.readPackageJson).mockResolvedValue({
        scripts: {dev: 'npm run dev'},
      });

      await serverManager.startServer('/project/path', 'dev');

      const stdoutHandler = mockChildProcess.stdout.on.mock.calls[0][1];
      stdoutHandler(Buffer.from(output));

      expect(broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'server:status',
          status: 'running',
          url: `http://localhost:${expectedPort}`,
        }),
      );
    });
  });
});
