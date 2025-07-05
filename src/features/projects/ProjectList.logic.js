export const formatTimeAgo = (dateString, currentTime) => {
  const date = new Date(dateString);
  const now = currentTime;
  
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }
  
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes === 1) return '1 min ago';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

export const filterProjects = (projects, searchTerm) => {
  if (!searchTerm) return projects;
  
  const lowerSearch = searchTerm.toLowerCase();
  return projects.filter(project => {
    if (project.displayName.toLowerCase().includes(lowerSearch)) return true;
    
    if (project.sessions) {
      return project.sessions.some(session => 
        session.title?.toLowerCase().includes(lowerSearch) ||
        session.summary?.toLowerCase().includes(lowerSearch)
      );
    }
    
    return false;
  });
};

export const getAllSessions = (project, additionalSessions) => {
  const projectSessions = project.sessions || [];
  const additional = additionalSessions[project.name] || [];
  
  const sessionMap = new Map();
  
  [...projectSessions, ...additional].forEach(session => {
    sessionMap.set(session.id, session);
  });
  
  return Array.from(sessionMap.values());
};

export const sortSessionsByDate = (sessions) => {
  return [...sessions].sort((a, b) => 
    new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
  );
};

export const getProjectSessionCount = (project, additionalSessions) => {
  const sessions = getAllSessions(project, additionalSessions);
  return sessions.length;
};

export const hasMoreSessions = (project, additionalSessions) => {
  const loadedCount = getProjectSessionCount(project, additionalSessions);
  return loadedCount < (project.sessionMeta?.total || 0);
};

export const validateProjectPath = (path) => {
  if (!path) return { isValid: false, error: 'Path is required' };
  if (path.includes('..')) return { isValid: false, error: 'Path cannot contain ..' };
  if (!path.startsWith('/')) return { isValid: false, error: 'Path must be absolute' };
  return { isValid: true, error: null };
};

export const truncateText = (text, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getSessionIcon = (session) => {
  if (session.summary && session.summary.toLowerCase().includes('bug')) {
    return '🐛';
  }
  if (session.summary && session.summary.toLowerCase().includes('feature')) {
    return '✨';
  }
  if (session.summary && session.summary.toLowerCase().includes('fix')) {
    return '🔧';
  }
  return null;
};