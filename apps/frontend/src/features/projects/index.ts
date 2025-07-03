/**
 * Projects Feature - Main export file
 * Following Bulletproof React feature-slice pattern
 */

// Types
export type {
  Project,
  Session,
  SessionMeta,
  ProjectOperations,
  ProjectState,
  ProjectFormData,
  SessionOperations,
  ProjectsResponse,
  SessionsResponse,
} from './types';

// API
export { projectsAPI, ProjectsAPI } from './api';

// Hooks (to be created)
// export { useProjects } from './hooks/useProjects';
// export { useProjectOperations } from './hooks/useProjectOperations';

// Components
export { Sidebar } from './components/Sidebar';