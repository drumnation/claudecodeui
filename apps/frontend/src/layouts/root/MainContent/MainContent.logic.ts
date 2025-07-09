/**
 * MainContent.logic.js - Business logic for MainContent component
 * Handles WebSocket message processing and server state management
 */

import {Project, Message} from './MainContent.types';

interface ServerLog {
  message: string;
  type: 'error' | 'log';
  timestamp: string;
}

interface ServerState {
  serverLogs: ServerLog[];
}

interface ServerMessage extends Message {
  type: string;
  projectPath?: string;
  scripts?: string[];
  servers?: Array<{
    status: string;
    url?: string;
    script?: string;
  }>;
  error?: string;
  message?: string;
  stream?: string;
  timestamp?: string;
}

export const processServerMessage = (
  message: ServerMessage,
  selectedProject: Project | null,
  state: ServerState,
) => {
  if (!message || !selectedProject) return null;

  const {type, projectPath} = message;

  // Only process messages for the current project
  if (projectPath && projectPath !== selectedProject.fullPath) {
    return null;
  }

  switch (type) {
    case 'server:scripts':
      return {
        availableScripts: message.scripts || [],
      };

    case 'server:status':
      const servers = message.servers || [];
      if (servers.length > 0) {
        const server = servers[0];
        return {
          serverStatus: server.status,
          serverUrl: server.url || '',
          currentScript: server.script || '',
        };
      }
      return {
        serverStatus: 'stopped',
        serverUrl: '',
        currentScript: '',
      };

    case 'server:error':
      console.error('Server error:', message.error);
      return {
        serverStatus: 'error',
      };

    case 'server:log':
      return {
        serverLogs: [
          ...state.serverLogs,
          {
            message: message.message,
            type: message.stream === 'stderr' ? 'error' : 'log',
            timestamp: message.timestamp,
          },
        ],
      };

    default:
      return null;
  }
};

export const createFileObject = (
  filePath: string,
  selectedProject: Project | null,
  diffInfo: any = null,
) => {
  return {
    name: filePath.split('/').pop(),
    path: filePath,
    projectName: selectedProject?.name,
    diffInfo,
  };
};

export const shouldRequestScripts = (
  selectedProject: Project | null,
  ws: WebSocket | null,
) => {
  return selectedProject?.fullPath && ws && ws.readyState === WebSocket.OPEN;
};

export const createServerStartMessage = (
  projectPath: string,
  script: string,
) => ({
  type: 'server:start',
  projectPath,
  script,
});

export const createServerStopMessage = (projectPath: string) => ({
  type: 'server:stop',
  projectPath,
});

export const createServerScriptsMessage = (projectPath: string) => ({
  type: 'server:scripts',
  projectPath,
});

export const createServerStatusMessage = (projectPath: string) => ({
  type: 'server:status',
  projectPath,
});
