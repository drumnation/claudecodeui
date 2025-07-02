import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import chokidar, {FSWatcher} from 'chokidar';
import {WebSocket} from 'ws';
import * as watcher from './projects.watcher.js';
import {getProjectsList} from './projects.facade.js';
import type {ExtendedWebSocket} from '../../infra/websocket/index.js';
import type {Logger} from '@kit/logger/types';

vi.mock('chokidar');
vi.mock('./projects.facade.js');

describe('projects.watcher', () => {
  let mockWatcher: Partial<FSWatcher>;
  let mockClients: Set<ExtendedWebSocket>;
  let mockClient1: Partial<ExtendedWebSocket>;
  let mockClient2: Partial<ExtendedWebSocket>;
  let mockLogger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock HOME environment variable
    vi.stubEnv('HOME', '/home/user');
    
    // Create mock logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(() => mockLogger),
    } as unknown as Logger;

    // Create mock watcher
    mockWatcher = {
      on: vi.fn().mockReturnThis(),
      close: vi.fn(),
    };

    // Create mock clients
    mockClient1 = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
    };

    mockClient2 = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
    };

    mockClients = new Set([
      mockClient1 as ExtendedWebSocket,
      mockClient2 as ExtendedWebSocket,
    ]);

    vi.mocked(chokidar.watch).mockReturnValue(mockWatcher as FSWatcher);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  describe('createProjectsWatcher', () => {
    it('should initialize watcher with correct options', () => {
      watcher.createProjectsWatcher(mockClients, mockLogger);

      expect(chokidar.watch).toHaveBeenCalledWith(
        '/home/user/.claude/projects',
        {
          ignored: expect.arrayContaining([
            '**/node_modules/**',
            '**/.git/**',
            '**/dist/**',
            '**/build/**',
            '**/*.tmp',
            '**/*.swp',
            '**/.DS_Store',
          ]),
          persistent: true,
          ignoreInitial: true,
          followSymlinks: false,
          depth: 10,
          awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50,
          },
        },
      );
    });

    it('should close existing watcher before creating new one', () => {
      // Create first watcher
      watcher.createProjectsWatcher(mockClients, mockLogger);
      const firstWatcher = mockWatcher;

      // Create second watcher
      const secondWatcher = {
        on: vi.fn().mockReturnThis(),
        close: vi.fn(),
      };
      vi.mocked(chokidar.watch).mockReturnValue(secondWatcher as any);

      watcher.createProjectsWatcher(mockClients, mockLogger);

      expect(firstWatcher.close).toHaveBeenCalled();
    });

    it('should handle file add events', async () => {
      const mockProjects = [{name: 'project1', sessions: []}];
      vi.mocked(getProjectsList).mockResolvedValue(mockProjects);

      watcher.createProjectsWatcher(mockClients, mockLogger);

      // Get the 'add' event handler
      const addHandler = vi
        .mocked(mockWatcher.on)
        .mock.calls.find((call) => call[0] === 'add')?.[1];
      expect(addHandler).toBeDefined();

      // Trigger add event
      await addHandler!('/home/user/.claude/projects/new-file.jsonl');

      // Advance timer to trigger debounced update
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(getProjectsList).toHaveBeenCalledWith('/home/user');
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"projects_updated"'),
      );
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringContaining('"changeType":"add"'),
      );
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringContaining('"changedFile":"new-file.jsonl"'),
      );
      expect(mockClient2.send).toHaveBeenCalledWith(expect.any(String));
    });

    it('should handle file change events', async () => {
      const mockProjects = [{name: 'project1', sessions: []}];
      vi.mocked(getProjectsList).mockResolvedValue(mockProjects);

      watcher.createProjectsWatcher(mockClients, mockLogger);

      const changeHandler = vi
        .mocked(mockWatcher.on)
        .mock.calls.find((call) => call[0] === 'change')?.[1];
      await changeHandler!('/home/user/.claude/projects/existing.jsonl');

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringContaining('"changeType":"change"'),
      );
    });

    it('should handle file unlink events', async () => {
      const mockProjects = [];
      vi.mocked(getProjectsList).mockResolvedValue(mockProjects);

      watcher.createProjectsWatcher(mockClients, mockLogger);

      const unlinkHandler = vi
        .mocked(mockWatcher.on)
        .mock.calls.find((call) => call[0] === 'unlink')?.[1];
      await unlinkHandler!('/home/user/.claude/projects/deleted.jsonl');

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringContaining('"changeType":"unlink"'),
      );
    });

    it('should handle directory events', async () => {
      const mockProjects = [{name: 'new-project', sessions: []}];
      vi.mocked(getProjectsList).mockResolvedValue(mockProjects);

      watcher.createProjectsWatcher(mockClients, mockLogger);

      const addDirHandler = vi
        .mocked(mockWatcher.on)
        .mock.calls.find((call) => call[0] === 'addDir')?.[1];
      await addDirHandler!('/home/user/.claude/projects/new-project');

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringContaining('"changeType":"addDir"'),
      );
    });

    it('should debounce multiple events', async () => {
      const mockProjects = [{name: 'project1', sessions: []}];
      vi.mocked(getProjectsList).mockResolvedValue(mockProjects);

      watcher.createProjectsWatcher(mockClients, mockLogger);

      const addHandler = vi
        .mocked(mockWatcher.on)
        .mock.calls.find((call) => call[0] === 'add')?.[1];

      // Trigger multiple events rapidly
      await addHandler!('/home/user/.claude/projects/file1.jsonl');
      vi.advanceTimersByTime(100);
      await addHandler!('/home/user/.claude/projects/file2.jsonl');
      vi.advanceTimersByTime(100);
      await addHandler!('/home/user/.claude/projects/file3.jsonl');

      // Should not have called getProjectsList yet
      expect(getProjectsList).not.toHaveBeenCalled();

      // Advance past debounce threshold
      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      // Should only call once with the last file
      expect(getProjectsList).toHaveBeenCalledTimes(1);
      expect(mockClient1.send).toHaveBeenCalledTimes(1);
      expect(mockClient1.send).toHaveBeenCalledWith(
        expect.stringContaining('"changedFile":"file3.jsonl"'),
      );
    });

    it('should skip closed WebSocket connections', async () => {
      const closedClient: Partial<ExtendedWebSocket> = {
        readyState: WebSocket.CLOSED,
        send: vi.fn(),
      };

      const openClient: Partial<ExtendedWebSocket> = {
        readyState: WebSocket.OPEN,
        send: vi.fn(),
      };

      const mixedClients = new Set([
        closedClient as ExtendedWebSocket,
        openClient as ExtendedWebSocket,
      ]);

      vi.mocked(getProjectsList).mockResolvedValue([]);

      watcher.createProjectsWatcher(mixedClients);

      const addHandler = vi
        .mocked(mockWatcher.on)
        .mock.calls.find((call) => call[0] === 'add')?.[1];
      await addHandler!('/home/user/.claude/projects/file.jsonl');

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(closedClient.send).not.toHaveBeenCalled();
      expect(openClient.send).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in project list retrieval', async () => {
      vi.mocked(getProjectsList).mockRejectedValue(new Error('Read error'));
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      watcher.createProjectsWatcher(mockClients, mockLogger);

      const addHandler = vi
        .mocked(mockWatcher.on)
        .mock.calls.find((call) => call[0] === 'add')?.[1];
      await addHandler!('/home/user/.claude/projects/file.jsonl');

      vi.advanceTimersByTime(300);
      await vi.runAllTimersAsync();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Error handling project changes:',
        expect.any(Error),
      );
      expect(mockClient1.send).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle watcher errors', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      watcher.createProjectsWatcher(mockClients, mockLogger);

      const errorHandler = vi
        .mocked(mockWatcher.on)
        .mock.calls.find((call) => call[0] === 'error')?.[1];
      const testError = new Error('Watcher error');
      errorHandler!(testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Chokidar watcher error:',
        testError,
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log when ready', () => {
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      watcher.createProjectsWatcher(mockClients, mockLogger);

      const readyHandler = vi
        .mocked(mockWatcher.on)
        .mock.calls.find((call) => call[0] === 'ready')?.[1];
      readyHandler!();

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ File watcher ready');

      consoleLogSpy.mockRestore();
    });

    it('should handle setup errors', () => {
      vi.mocked(chokidar.watch).mockImplementation(() => {
        throw new Error('Setup failed');
      });

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      watcher.createProjectsWatcher(mockClients, mockLogger);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Failed to setup projects watcher:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('stopProjectsWatcher', () => {
    it('should close watcher if exists', () => {
      watcher.createProjectsWatcher(mockClients, mockLogger);
      watcher.stopProjectsWatcher();

      expect(mockWatcher.close).toHaveBeenCalled();
    });

    it('should handle multiple stop calls gracefully', () => {
      watcher.createProjectsWatcher(mockClients, mockLogger);
      watcher.stopProjectsWatcher();
      watcher.stopProjectsWatcher(); // Second call should not error

      expect(mockWatcher.close).toHaveBeenCalledTimes(1);
    });

    it('should handle stop without create', () => {
      // Should not throw error
      expect(() => watcher.stopProjectsWatcher()).not.toThrow();
    });
  });
});
