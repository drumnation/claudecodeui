// API Configuration
export const API_CONFIG = {
  // Backend API server URL
  BACKEND_URL: (typeof process !== 'undefined' && process.env?.VITE_BACKEND_URL) || 'http://localhost:8765',
  
  // API endpoints
  ENDPOINTS: {
    // Backlog system endpoints
    BACKLOG_HEALTH: '/api/backlog/health',
    BACKLOG_INSTALL: '/api/backlog/install',
    BACKLOG_INSTALL_INSTRUCTIONS: '/api/backlog/install-instructions',
    BACKLOG_DEBUG: '/api/backlog/debug',
    BACKLOG_ENVIRONMENT: '/api/backlog/environment',
    
    // Project-specific backlog endpoints
    PROJECT_BACKLOG: (projectName) => `/api/projects/${encodeURIComponent(projectName)}/backlog`,
    PROJECT_BACKLOG_TASKS: (projectName) => `/api/projects/${encodeURIComponent(projectName)}/backlog/tasks`,
    PROJECT_BACKLOG_TASK: (projectName, taskId) => `/api/projects/${encodeURIComponent(projectName)}/backlog/tasks/${taskId}`,
    PROJECT_BACKLOG_PLAN: (projectName) => `/api/projects/${encodeURIComponent(projectName)}/backlog/plan`,
    PROJECT_BACKLOG_REVIEW: (projectName) => `/api/projects/${encodeURIComponent(projectName)}/backlog/review`,
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Helper functions for specific endpoints
export const getBacklogHealthUrl = () => buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_HEALTH);
export const getBacklogInstallUrl = () => buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_INSTALL);
export const getBacklogInstallInstructionsUrl = () => buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_INSTALL_INSTRUCTIONS);
export const getBacklogDebugUrl = () => buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_DEBUG);
export const getBacklogEnvironmentUrl = () => buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_ENVIRONMENT);

export const getProjectBacklogUrl = (projectName, queryParams = '') => {
  const endpoint = API_CONFIG.ENDPOINTS.PROJECT_BACKLOG(projectName);
  const url = buildApiUrl(endpoint);
  return queryParams ? `${url}?${queryParams}` : url;
};

export const getProjectBacklogTasksUrl = (projectName) => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_BACKLOG_TASKS(projectName));
};

export const getProjectBacklogTaskUrl = (projectName, taskId) => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_BACKLOG_TASK(projectName, taskId));
};

export const getProjectBacklogPlanUrl = (projectName) => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_BACKLOG_PLAN(projectName));
};

export const getProjectBacklogReviewUrl = (projectName) => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_BACKLOG_REVIEW(projectName));
};