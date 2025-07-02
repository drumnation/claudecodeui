import path from 'node:path';
import chokidar, {FSWatcher} from 'chokidar';
import {WebSocket} from 'ws';
import type {ExtendedWebSocket} from '../../infra/websocket/index.js';
import type {Logger} from '@kit/logger/types';
import {getProjectsList} from './projects.facade.js';

let projectsWatcher: FSWatcher | null = null;
const fileChangeLogCache = new Map<string, number>();

export const createProjectsWatcher = (
  connectedClients: Set<ExtendedWebSocket>,
  logger: Logger,
): void => {
  const claudeProjectsPath = path.join(
    process.env['HOME'] || '',
    '.claude',
    'projects',
  );

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
        '**/.DS_Store',
      ],
      persistent: true,
      ignoreInitial: true,
      followSymlinks: false,
      depth: 10,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    // Debounce function to prevent excessive notifications
    let debounceTimer: NodeJS.Timeout;
    const debouncedUpdate = async (eventType: string, filePath: string) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          // Get updated projects list
          const updatedProjects = await getProjectsList(
            process.env['HOME'] || '',
          );

          // Rate-limited logging for file changes
          const logKey = `${eventType}:${path.basename(filePath)}`;
          if (!fileChangeLogCache.has(logKey) || Date.now() - fileChangeLogCache.get(logKey)! > 5000) {
            logger.debug('File change detected', {
              eventType,
              relativePath: path.relative(claudeProjectsPath, filePath)
            });
            fileChangeLogCache.set(logKey, Date.now());
          }

          // Notify all connected clients about the project changes
          const updateMessage = JSON.stringify({
            type: 'projects_updated',
            projects: updatedProjects,
            timestamp: new Date().toISOString(),
            changeType: eventType,
            changedFile: path.relative(claudeProjectsPath, filePath),
          });

          connectedClients.forEach((client: ExtendedWebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(updateMessage);
            }
          });
        } catch (error) {
          logger.error('❌ Error handling project changes', {error});
        }
      }, 300);
    };

    // Set up event listeners
    projectsWatcher
      .on('add', (filePath: string) => debouncedUpdate('add', filePath))
      .on('change', (filePath: string) => debouncedUpdate('change', filePath))
      .on('unlink', (filePath: string) => debouncedUpdate('unlink', filePath))
      .on('addDir', (dirPath: string) => debouncedUpdate('addDir', dirPath))
      .on('unlinkDir', (dirPath: string) =>
        debouncedUpdate('unlinkDir', dirPath),
      )
      .on('error', (error: unknown) => {
        logger.error('❌ Chokidar watcher error', {error});
      })
      .on('ready', () => {
        logger.info('✅ File watcher ready');
      });
  } catch (error) {
    logger.error('❌ Failed to setup projects watcher', {error});
  }
};

export const stopProjectsWatcher = (): void => {
  if (projectsWatcher) {
    projectsWatcher.close();
    projectsWatcher = null;
  }
};
