import { useState, useEffect } from 'react';

export const useProjectList = ({
  projects,
  selectedProject,
  selectedSession,
  onProjectSelect,
  onSessionSelect,
  onNewSession,
  onSessionDelete,
  onProjectDelete,
  isLoading,
  onRefresh,
  onShowSettings
}) => {
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [editingProject, setEditingProject] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState({});
  const [additionalSessions, setAdditionalSessions] = useState({});
  const [initialSessionsLoaded, setInitialSessionsLoaded] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editingSessionName, setEditingSessionName] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState({});

  // Touch handler to prevent double-tap issues on iPad
  const handleTouchClick = (callback) => {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      callback();
    };
  };

  // Auto-update timestamps every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Clear additional sessions when projects list changes (e.g., after refresh)
  useEffect(() => {
    setAdditionalSessions({});
    setInitialSessionsLoaded(new Set());
  }, [projects]);

  // Auto-expand project folder when a session is selected
  useEffect(() => {
    if (selectedSession && selectedProject) {
      setExpandedProjects(prev => new Set([...prev, selectedProject.name]));
    }
  }, [selectedSession, selectedProject]);

  // Mark sessions as loaded when projects come in
  useEffect(() => {
    if (projects.length > 0 && !isLoading) {
      const newLoaded = new Set();
      projects.forEach(project => {
        if (project.sessions && project.sessions.length >= 0) {
          newLoaded.add(project.name);
        }
      });
      setInitialSessionsLoaded(newLoaded);
    }
  }, [projects, isLoading]);

  const toggleProject = (projectName) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectName)) {
      newExpanded.delete(projectName);
    } else {
      newExpanded.add(projectName);
    }
    setExpandedProjects(newExpanded);
  };

  const startEditing = (project) => {
    setEditingProject(project.name);
    setEditingName(project.displayName);
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditingName('');
  };

  const saveProjectName = async (projectName) => {
    try {
      const response = await fetch(`/api/projects/${projectName}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: editingName }),
      });

      if (response.ok) {
        if (window.refreshProjects) {
          window.refreshProjects();
        } else {
          window.location.reload();
        }
      } else {
        console.error('Failed to rename project');
      }
    } catch (error) {
      console.error('Error renaming project:', error);
    }
    
    setEditingProject(null);
    setEditingName('');
  };

  const deleteSession = async (projectName, sessionId) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectName}/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (onSessionDelete) {
          onSessionDelete(sessionId);
        }
      } else {
        console.error('Failed to delete session');
        alert('Failed to delete session. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error deleting session. Please try again.');
    }
  };

  const generateSessionSummary = async (projectName, sessionId) => {
    const key = `${projectName}-${sessionId}`;
    setGeneratingSummary(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch(`/api/projects/${projectName}/sessions/${sessionId}/generate-summary`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
      } else {
        const error = await response.json();
        console.error('Failed to generate summary:', error);
        alert(`Failed to generate summary: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert(`Error generating summary: ${error.message || 'Network error'}`);
    } finally {
      setGeneratingSummary(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const updateSessionSummary = async (projectName, sessionId, newSummary) => {
    try {
      const response = await fetch(`/api/projects/${projectName}/sessions/${sessionId}/summary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary: newSummary }),
      });
      
      if (response.ok) {
        setEditingSession(null);
        setEditingSessionName('');
      } else {
        const error = await response.json();
        console.error('Failed to update summary:', error);
        alert('Failed to update summary. Please try again.');
      }
    } catch (error) {
      console.error('Error updating summary:', error);
      alert('Error updating summary. Please try again.');
    }
  };

  const deleteProject = async (projectName) => {
    if (!confirm('Are you sure you want to delete this empty project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectName}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (onProjectDelete) {
          onProjectDelete(projectName);
        }
      } else {
        const error = await response.json();
        console.error('Failed to delete project');
        alert(error.error || 'Failed to delete project. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project. Please try again.');
    }
  };

  const createNewProject = async () => {
    if (!newProjectPath.trim()) {
      alert('Please enter a project path');
      return;
    }

    setCreatingProject(true);
    
    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          path: newProjectPath.trim()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowNewProject(false);
        setNewProjectPath('');
        
        if (window.refreshProjects) {
          window.refreshProjects();
        } else {
          window.location.reload();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project. Please try again.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    } finally {
      setCreatingProject(false);
    }
  };

  const cancelNewProject = () => {
    setShowNewProject(false);
    setNewProjectPath('');
  };

  const loadMoreSessions = async (project) => {
    const canLoadMore = project.sessionMeta?.hasMore !== false;
    
    if (!canLoadMore || loadingSessions[project.name]) {
      return;
    }

    setLoadingSessions(prev => ({ ...prev, [project.name]: true }));

    try {
      const currentSessionCount = (project.sessions?.length || 0) + (additionalSessions[project.name]?.length || 0);
      const response = await fetch(
        `/api/projects/${project.name}/sessions?limit=5&offset=${currentSessionCount}`
      );
      
      if (response.ok) {
        const result = await response.json();
        
        setAdditionalSessions(prev => ({
          ...prev,
          [project.name]: [
            ...(prev[project.name] || []),
            ...result.sessions
          ]
        }));
        
        if (result.hasMore === false) {
          project.sessionMeta = { ...project.sessionMeta, hasMore: false };
        }
      }
    } catch (error) {
      console.error('Error loading more sessions:', error);
    } finally {
      setLoadingSessions(prev => ({ ...prev, [project.name]: false }));
    }
  };

  const getAllSessions = (project) => {
    const initialSessions = project.sessions || [];
    const additional = additionalSessions[project.name] || [];
    return [...initialSessions, ...additional];
  };

  const hasActiveSessions = (project) => {
    const sessions = getAllSessions(project);
    return sessions.some(session => {
      const sessionDate = new Date(session.lastActivity);
      const diffInMinutes = Math.floor((currentTime - sessionDate) / (1000 * 60));
      return diffInMinutes < 10;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    // State values
    expandedProjects,
    editingProject,
    showNewProject,
    editingName,
    newProjectPath,
    creatingProject,
    loadingSessions,
    additionalSessions,
    initialSessionsLoaded,
    currentTime,
    isRefreshing,
    editingSession,
    editingSessionName,
    generatingSummary,
    
    // State setters
    setEditingName,
    setNewProjectPath,
    setShowNewProject,
    setEditingSession,
    setEditingSessionName,
    
    // Event handlers and functions
    handleTouchClick,
    toggleProject,
    startEditing,
    cancelEditing,
    saveProjectName,
    deleteSession,
    generateSessionSummary,
    updateSessionSummary,
    deleteProject,
    createNewProject,
    cancelNewProject,
    loadMoreSessions,
    getAllSessions,
    hasActiveSessions,
    handleRefresh
  };
};