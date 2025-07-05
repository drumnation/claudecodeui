/**
 * MainContent.logic.js - Business logic for MainContent component
 * Handles WebSocket message processing and server state management
 */

export const processServerMessage = (message, selectedProject, state) => {
  if (!message || !selectedProject) return null;

  const { type, projectPath } = message;
  
  // Only process messages for the current project
  if (projectPath && projectPath !== selectedProject.fullPath) {
    return null;
  }

  switch (type) {
    case 'server:scripts':
      return {
        availableScripts: message.scripts || []
      };

    case 'server:status':
      const servers = message.servers || [];
      if (servers.length > 0) {
        const server = servers[0];
        return {
          serverStatus: server.status,
          serverUrl: server.url || '',
          currentScript: server.script || ''
        };
      }
      return {
        serverStatus: 'stopped',
        serverUrl: '',
        currentScript: ''
      };

    case 'server:error':
      console.error('Server error:', message.error);
      return {
        serverStatus: 'error'
      };

    case 'server:log':
      return {
        serverLogs: [
          ...state.serverLogs,
          {
            message: message.message,
            type: message.stream === 'stderr' ? 'error' : 'log',
            timestamp: message.timestamp
          }
        ]
      };

    default:
      return null;
  }
};

export const createFileObject = (filePath, selectedProject, diffInfo = null) => {
  return {
    name: filePath.split('/').pop(),
    path: filePath,
    projectName: selectedProject?.name,
    diffInfo
  };
};

export const shouldRequestScripts = (selectedProject, ws) => {
  return selectedProject?.fullPath && ws && ws.readyState === WebSocket.OPEN;
};

export const createServerStartMessage = (projectPath, script) => ({
  type: 'server:start',
  projectPath,
  script
});

export const createServerStopMessage = (projectPath) => ({
  type: 'server:stop',
  projectPath
});

export const createServerScriptsMessage = (projectPath) => ({
  type: 'server:scripts',
  projectPath
});

export const createServerStatusMessage = (projectPath) => ({
  type: 'server:status',
  projectPath
});