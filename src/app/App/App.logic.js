/**
 * Pure logic functions for App component
 * These functions contain no side effects and handle business logic
 */

/**
 * Determines if an update is purely additive (new sessions/projects)
 * vs modifying existing selected items that would interfere with active conversations
 * 
 * @param {Array} currentProjects - Current projects state
 * @param {Array} updatedProjects - Updated projects from WebSocket
 * @param {Object} selectedProject - Currently selected project
 * @param {Object} selectedSession - Currently selected session
 * @returns {boolean} - True if update is additive only, false if it modifies selected items
 */
export const isUpdateAdditive = (currentProjects, updatedProjects, selectedProject, selectedSession) => {
  if (!selectedProject || !selectedSession) {
    // No active session to protect, allow all updates
    return true;
  }

  // Find the selected project in both current and updated data
  const currentSelectedProject = currentProjects?.find(p => p.name === selectedProject.name);
  const updatedSelectedProject = updatedProjects?.find(p => p.name === selectedProject.name);

  if (!currentSelectedProject || !updatedSelectedProject) {
    // Project structure changed significantly, not purely additive
    return false;
  }

  // Find the selected session in both current and updated project data
  const currentSelectedSession = currentSelectedProject.sessions?.find(s => s.id === selectedSession.id);
  const updatedSelectedSession = updatedSelectedProject.sessions?.find(s => s.id === selectedSession.id);

  if (!currentSelectedSession || !updatedSelectedSession) {
    // Selected session was deleted or significantly changed, not purely additive
    return false;
  }

  // Check if the selected session's content has changed (modification vs addition)
  // Compare key fields that would affect the loaded chat interface
  const sessionUnchanged = 
    currentSelectedSession.id === updatedSelectedSession.id &&
    currentSelectedSession.title === updatedSelectedSession.title &&
    currentSelectedSession.created_at === updatedSelectedSession.created_at &&
    currentSelectedSession.updated_at === updatedSelectedSession.updated_at;

  // This is considered additive if the selected session is unchanged
  // (new sessions may have been added elsewhere, but active session is protected)
  return sessionUnchanged;
};

/**
 * Checks if projects data has actually changed
 * Used to optimize re-renders by preserving object references
 * 
 * @param {Array} prevProjects - Previous projects state
 * @param {Array} newProjects - New projects data
 * @returns {boolean} - True if projects have changed
 */
export const hasProjectsChanged = (prevProjects, newProjects) => {
  if (prevProjects.length !== newProjects.length) {
    return true;
  }

  return newProjects.some((newProject, index) => {
    const prevProject = prevProjects[index];
    if (!prevProject) return true;
    
    return (
      newProject.name !== prevProject.name ||
      newProject.displayName !== prevProject.displayName ||
      newProject.fullPath !== prevProject.fullPath ||
      JSON.stringify(newProject.sessionMeta) !== JSON.stringify(prevProject.sessionMeta) ||
      JSON.stringify(newProject.sessions) !== JSON.stringify(prevProject.sessions)
    );
  });
};

/**
 * Finds a session across all projects
 * 
 * @param {Array} projects - All projects
 * @param {string} sessionId - Session ID to find
 * @returns {Object|null} - Object containing project and session, or null if not found
 */
export const findSessionInProjects = (projects, sessionId) => {
  for (const project of projects) {
    const session = project.sessions?.find(s => s.id === sessionId);
    if (session) {
      return { project, session };
    }
  }
  return null;
};

/**
 * Updates a specific session in the projects array
 * 
 * @param {Array} projects - Current projects
 * @param {string} sessionId - Session ID to update
 * @param {Object} updateData - Data to update the session with
 * @returns {Array} - Updated projects array
 */
export const updateSessionInProjects = (projects, sessionId, updateData) => {
  return projects.map(project => {
    const hasSession = project.sessions?.some(s => s.id === sessionId);
    if (hasSession) {
      return {
        ...project,
        sessions: project.sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              ...updateData
            };
          }
          return session;
        })
      };
    }
    return project;
  });
};

/**
 * Removes a session from the projects array and updates metadata
 * 
 * @param {Array} projects - Current projects
 * @param {string} sessionId - Session ID to remove
 * @returns {Array} - Updated projects array
 */
export const removeSessionFromProjects = (projects, sessionId) => {
  return projects.map(project => ({
    ...project,
    sessions: project.sessions?.filter(session => session.id !== sessionId) || [],
    sessionMeta: {
      ...project.sessionMeta,
      total: Math.max(0, (project.sessionMeta?.total || 0) - 
        (project.sessions?.some(s => s.id === sessionId) ? 1 : 0))
    }
  }));
};

/**
 * Checks if a session ID is temporary (for new sessions before WebSocket assigns real ID)
 * 
 * @param {string} sessionId - Session ID to check
 * @returns {boolean} - True if session ID is temporary
 */
export const isTemporarySessionId = (sessionId) => {
  return sessionId && sessionId.startsWith('new-session-');
};

/**
 * Creates a new temporary session ID
 * 
 * @returns {string} - New temporary session ID
 */
export const createTemporarySessionId = () => {
  return `new-session-${Date.now()}`;
};

/**
 * Determines if the active tab should be switched based on current state
 * 
 * @param {string} currentTab - Current active tab
 * @param {string} targetTab - Target tab to potentially switch to
 * @returns {boolean} - True if tab should be switched
 */
export const shouldSwitchTab = (currentTab, targetTab) => {
  // Don't switch away from git or preview tabs
  if (currentTab === 'git' || currentTab === 'preview') {
    return false;
  }
  return currentTab !== targetTab;
};