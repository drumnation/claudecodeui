// Types
export * from './projects.types.js';

// Repository functions
export {
  readProjectConfig,
  writeProjectConfig,
  readProjectDirectories,
  readPackageJson,
  readJsonlFiles,
  getFileStats,
  readJsonlFileStream,
  readJsonlFile,
  writeJsonlFile,
  appendToJsonlFile,
  removeDirectory,
  checkPathExists,
  checkDirectoryExists,
} from './projects.repository.js';

// Service functions
export {
  generateDisplayName,
  parseJsonlSessions,
  getSessions,
  getSessionMessages,
  buildProject,
  filterSessionEntriesById,
  findSessionFile,
  isProjectEmpty,
  updateSessionSummary as updateSessionSummaryService,
} from './projects.service.js';

// Controller functions
export {
  getProjects,
  getSessions as getSessionsHandler,
  getSessionMessages as getSessionMessagesHandler,
  renameProject,
  deleteSession,
  deleteProject,
  addProject,
  updateSessionSummary,
} from './projects.controller.js';

// Watcher functions
export {
  createProjectsWatcher,
  stopProjectsWatcher,
} from './projects.watcher.js';

// Facade functions
export {getProjectsList} from './projects.facade.js';
