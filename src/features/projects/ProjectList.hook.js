import { useState, useEffect } from 'react';
import { useConfirmation } from '@/hooks/useConfirmation';
import { gitApi } from '@/features/git/GitPanel.logic';
import { createLogger } from '@kit/logger/browser';

const logger = createLogger({ scope: 'ProjectList.hook' });

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
  const [showNewProject, setShowNewProjectState] = useState(false);
  
  const setShowNewProject = (value) => {
    logger.debug('setShowNewProject called', { value, stack: new Error().stack });
    setShowNewProjectState(value);
  };
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
  const [regeneratingTitle, setRegeneratingTitle] = useState({});
  
  // Worktree state
  const [showWorktreeModal, setShowWorktreeModal] = useState(false);
  const [worktreeFeatureName, setWorktreeFeatureName] = useState('');
  const [creatingWorktree, setCreatingWorktree] = useState(false);
  const [selectedProjectForWorktree, setSelectedProjectForWorktree] = useState(null);
  const [removingWorktree, setRemovingWorktree] = useState(false);
  
  // Planner state
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [selectedProjectForPlanner, setSelectedProjectForPlanner] = useState(null);
  
  // Confirmation modal state
  const {
    confirmationState,
    showConfirmation,
    handleConfirm,
    handleCancel
  } = useConfirmation();

  // Touch handler to prevent double-tap issues on iPad
  const handleTouchClick = (callback) => {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      logger.debug('handleTouchClick called');
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
    const confirmed = await showConfirmation({
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session? This action cannot be undone.',
      confirmText: 'Delete Session',
      confirmVariant: 'destructive'
    });

    if (!confirmed) return;

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
        // Could add error modal here too
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

  const regenerateSessionTitle = async (projectName, sessionId) => {
    const key = `${projectName}-${sessionId}`;
    setRegeneratingTitle(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await fetch(`/api/projects/${projectName}/sessions/${sessionId}/update-title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceRegenerate: true }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Refresh the project list to show the new title
        if (window.refreshProjects) {
          window.refreshProjects();
        }
        return data.title;
      } else {
        const error = await response.json();
        console.error('Failed to regenerate title:', error);
        alert(`Failed to regenerate title: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error regenerating title:', error);
      alert(`Error regenerating title: ${error.message || 'Network error'}`);
    } finally {
      setRegeneratingTitle(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const deleteProject = async (projectName) => {
    const confirmed = await showConfirmation({
      title: 'Delete Empty Project',
      message: 'Are you sure you want to delete this empty project? This action cannot be undone.',
      confirmText: 'Delete Project',
      confirmVariant: 'destructive'
    });

    if (!confirmed) return;

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
        logger.debug('Closing new project modal after successful creation');
        setShowNewProject(false);
        setNewProjectPath('');
        
        // Refresh projects first
        if (window.refreshProjects) {
          await window.refreshProjects();
        } else {
          window.location.reload();
          return; // Exit early if we're doing a full reload
        }
        
        // Auto-start a new session in the created project
        if (result.autoStartSession && onNewSession) {
          const project = {
            name: result.project.name,
            displayName: result.project.displayName,
            fullPath: result.project.fullPath
          };
          
          // Select the project and start a new session
          if (onProjectSelect) {
            onProjectSelect(project);
          }
          
          // Start a new session with the provided session ID
          onNewSession(project, result.autoStartSession.sessionId);
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
    logger.debug('cancelNewProject called');
    setShowNewProject(false);
    setNewProjectPath('');
  };

  // Worktree handlers
  const createWorktree = async () => {
    if (!worktreeFeatureName.trim() || !selectedProjectForWorktree) {
      alert('Please enter a feature name');
      return;
    }

    setCreatingWorktree(true);
    
    try {
      const result = await gitApi.createWorktree(
        selectedProjectForWorktree.name, 
        worktreeFeatureName.trim()
      );

      if (result.error) {
        alert(result.error);
        return;
      }

      // Close modal and clear state
      setShowWorktreeModal(false);
      setWorktreeFeatureName('');
      setSelectedProjectForWorktree(null);
      
      // Refresh projects to show the new worktree
      if (window.refreshProjects) {
        await window.refreshProjects();
      } else {
        window.location.reload();
        return;
      }
      
      // Auto-select the new worktree project if it was created successfully
      if (result.fullPath && onProjectSelect) {
        // Find the new worktree project in the refreshed list
        setTimeout(() => {
          const worktreeProject = projects.find(p => p.fullPath === result.fullPath);
          if (worktreeProject) {
            onProjectSelect(worktreeProject);
            
            // Auto-start a new session in the worktree
            if (onNewSession) {
              onNewSession(worktreeProject);
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error creating worktree:', error);
      alert('Error creating worktree. Please try again.');
    } finally {
      setCreatingWorktree(false);
    }
  };

  const removeWorktree = async (project) => {
    const confirmed = await showConfirmation({
      title: 'Remove Worktree',
      message: `Are you sure you want to remove the worktree "${project.displayName}"? Any uncommitted changes will be lost.`,
      confirmText: 'Remove Worktree',
      confirmVariant: 'destructive'
    });

    if (!confirmed) return;

    setRemovingWorktree(true);
    
    try {
      const result = await gitApi.removeWorktree(project.name, project.fullPath);

      if (result.error) {
        alert(result.error);
        return;
      }

      // Refresh projects to remove the worktree from the list
      if (window.refreshProjects) {
        await window.refreshProjects();
      } else {
        window.location.reload();
      }
      
      // If this was the selected project, deselect it
      if (selectedProject && selectedProject.name === project.name && onProjectSelect) {
        onProjectSelect(null);
      }
    } catch (error) {
      console.error('Error removing worktree:', error);
      alert('Error removing worktree. Please try again.');
    } finally {
      setRemovingWorktree(false);
    }
  };

  const cancelWorktree = () => {
    setShowWorktreeModal(false);
    setWorktreeFeatureName('');
    setSelectedProjectForWorktree(null);
  };

  const onCreateWorktree = (project) => {
    setSelectedProjectForWorktree(project);
    setShowWorktreeModal(true);
    setWorktreeFeatureName('');
  };

  const onRemoveWorktree = (project) => {
    removeWorktree(project);
  };

  // Planner handlers
  const handlePlanFeature = (project) => {
    setSelectedProjectForPlanner(project);
    setShowPlannerModal(true);
  };

  const closePlannerModal = () => {
    setShowPlannerModal(false);
    setSelectedProjectForPlanner(null);
  };

  const handlePlanComplete = (planResult) => {
    // Plan has been completed, could trigger notifications or other actions
    console.log('Plan completed:', planResult);
    
    // Keep modal open to show results and allow opening in Claude session
    // Modal will be closed when user clicks "Close" or "Open in Claude Session"
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
    regeneratingTitle,
    
    // Worktree state
    showWorktreeModal,
    worktreeFeatureName,
    creatingWorktree,
    selectedProjectForWorktree,
    removingWorktree,
    
    // Planner state
    showPlannerModal,
    selectedProjectForPlanner,
    
    // Confirmation modal state
    confirmationState,
    
    // State setters
    setEditingName,
    setNewProjectPath,
    setShowNewProject,
    setEditingSession,
    setEditingSessionName,
    setWorktreeFeatureName,
    
    // Event handlers and functions
    handleTouchClick,
    toggleProject,
    startEditing,
    cancelEditing,
    saveProjectName,
    deleteSession,
    generateSessionSummary,
    updateSessionSummary,
    regenerateSessionTitle,
    deleteProject,
    createNewProject,
    cancelNewProject,
    loadMoreSessions,
    getAllSessions,
    hasActiveSessions,
    handleRefresh,
    
    // Worktree handlers
    createWorktree,
    cancelWorktree,
    onCreateWorktree,
    onRemoveWorktree,
    
    // Planner handlers
    handlePlanFeature,
    closePlannerModal,
    handlePlanComplete,
    
    // Confirmation modal handlers
    handleConfirm,
    handleCancel
  };
};