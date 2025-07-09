// API Configuration types
interface ApiEndpoints {
  // Backlog system endpoints
  BACKLOG_HEALTH: string;
  BACKLOG_INSTALL: string;
  BACKLOG_INSTALL_INSTRUCTIONS: string;
  BACKLOG_DEBUG: string;
  BACKLOG_ENVIRONMENT: string;

  // Project-specific backlog endpoints
  PROJECT_BACKLOG: (projectName: string) => string;
  PROJECT_BACKLOG_TASKS: (projectName: string) => string;
  PROJECT_BACKLOG_TASK: (projectName: string, taskId: string) => string;
  PROJECT_BACKLOG_PLAN: (projectName: string) => string;
  PROJECT_BACKLOG_REVIEW: (projectName: string) => string;
}

interface ApiConfig {
  BACKEND_URL: string;
  ENDPOINTS: ApiEndpoints;
}

// API Configuration
export const API_CONFIG: ApiConfig = {
  // Backend API server URL
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8765',

  // API endpoints
  ENDPOINTS: {
    // Backlog system endpoints
    BACKLOG_HEALTH: '/api/backlog/health',
    BACKLOG_INSTALL: '/api/backlog/install',
    BACKLOG_INSTALL_INSTRUCTIONS: '/api/backlog/install-instructions',
    BACKLOG_DEBUG: '/api/backlog/debug',
    BACKLOG_ENVIRONMENT: '/api/backlog/environment',

    // Project-specific backlog endpoints
    PROJECT_BACKLOG: (projectName: string) =>
      `/api/projects/${encodeURIComponent(projectName)}/backlog`,
    PROJECT_BACKLOG_TASKS: (projectName: string) =>
      `/api/projects/${encodeURIComponent(projectName)}/backlog/tasks`,
    PROJECT_BACKLOG_TASK: (projectName: string, taskId: string) =>
      `/api/projects/${encodeURIComponent(projectName)}/backlog/tasks/${taskId}`,
    PROJECT_BACKLOG_PLAN: (projectName: string) =>
      `/api/projects/${encodeURIComponent(projectName)}/backlog/plan`,
    PROJECT_BACKLOG_REVIEW: (projectName: string) =>
      `/api/projects/${encodeURIComponent(projectName)}/backlog/review`,
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};

// Helper functions for specific endpoints
export const getBacklogHealthUrl = (): string =>
  buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_HEALTH);
export const getBacklogInstallUrl = (): string =>
  buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_INSTALL);
export const getBacklogInstallInstructionsUrl = (): string =>
  buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_INSTALL_INSTRUCTIONS);
export const getBacklogDebugUrl = (): string =>
  buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_DEBUG);
export const getBacklogEnvironmentUrl = (): string =>
  buildApiUrl(API_CONFIG.ENDPOINTS.BACKLOG_ENVIRONMENT);

export const getProjectBacklogUrl = (
  projectName: string,
  queryParams = '',
): string => {
  const endpoint = API_CONFIG.ENDPOINTS.PROJECT_BACKLOG(projectName);
  const url = buildApiUrl(endpoint);
  return queryParams ? `${url}?${queryParams}` : url;
};

export const getProjectBacklogTasksUrl = (projectName: string): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_BACKLOG_TASKS(projectName));
};

export const getProjectBacklogTaskUrl = (
  projectName: string,
  taskId: string,
): string => {
  return buildApiUrl(
    API_CONFIG.ENDPOINTS.PROJECT_BACKLOG_TASK(projectName, taskId),
  );
};

export const getProjectBacklogPlanUrl = (projectName: string): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_BACKLOG_PLAN(projectName));
};

export const getProjectBacklogReviewUrl = (projectName: string): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_BACKLOG_REVIEW(projectName));
};
