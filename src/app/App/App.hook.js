import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWebSocket } from '@/utils/websocket';
import { isUpdateAdditive } from '@/app/App/App.logic';
import { createLogger } from '@kit/logger/browser';

const logger = createLogger({ scope: 'app-hook' });

/**
 * Main App hook containing all state management and effects
 * Handles session protection, project management, and real-time updates
 */
export const useApp = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { ws, sendMessage, messages, connectionHealth } = useWebSocket();
  
  // Project and session state
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showToolsSettings, setShowToolsSettings] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  
  // Settings with localStorage persistence
  const [autoExpandTools, setAutoExpandTools] = useState(() => {
    const saved = localStorage.getItem('autoExpandTools');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [showRawParameters, setShowRawParameters] = useState(() => {
    const saved = localStorage.getItem('showRawParameters');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(() => {
    const saved = localStorage.getItem('autoScrollToBottom');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Session Protection System state
  const [activeSessions, setActiveSessions] = useState(new Set());

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Project fetching function
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      setProjectsError(null);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setProjects(prevProjects => {
        if (prevProjects.length === 0) {
          return data;
        }
        
        const hasChanges = data.some((newProject, index) => {
          const prevProject = prevProjects[index];
          if (!prevProject) return true;
          
          return (
            newProject.name !== prevProject.name ||
            newProject.displayName !== prevProject.displayName ||
            newProject.fullPath !== prevProject.fullPath ||
            JSON.stringify(newProject.sessionMeta) !== JSON.stringify(prevProject.sessionMeta) ||
            JSON.stringify(newProject.sessions) !== JSON.stringify(prevProject.sessions)
          );
        }) || data.length !== prevProjects.length;
        
        return hasChanges ? data : prevProjects;
      });
    } catch (error) {
      logger.error('Error fetching projects', {
        error,
        message: error.message,
        stack: error.stack,
        statusText: error.statusText
      });
      setProjectsError(error.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  // Expose fetchProjects globally
  useEffect(() => {
    window.refreshProjects = fetchProjects;
  }, [fetchProjects]);

  // Handle WebSocket messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      if (latestMessage.type === 'projects_updated') {
        const hasActiveSession = (selectedSession && activeSessions.has(selectedSession.id)) ||
                                 (activeSessions.size > 0 && Array.from(activeSessions).some(id => id.startsWith('new-session-')));
        
        if (hasActiveSession) {
          const updatedProjects = latestMessage.projects;
          const currentProjects = projects;
          
          const isAdditiveUpdate = isUpdateAdditive(currentProjects, updatedProjects, selectedProject, selectedSession);
          
          if (!isAdditiveUpdate) {
            return;
          }
        }
        
        const updatedProjects = latestMessage.projects;
        setProjects(updatedProjects);
        
        if (selectedProject) {
          const updatedSelectedProject = updatedProjects.find(p => p.name === selectedProject.name);
          if (updatedSelectedProject && updatedSelectedProject.fullPath !== selectedProject.fullPath) {
            // Only update if the project path has changed
            setSelectedProject(updatedSelectedProject);
            
            if (selectedSession) {
              const updatedSelectedSession = updatedSelectedProject.sessions?.find(s => s.id === selectedSession.id);
              if (!updatedSelectedSession) {
                setSelectedSession(null);
              }
            }
          }
        }
      }
      
      if (latestMessage.type === 'session-summary-updated') {
        logger.info('Session summary updated', {
          sessionId: latestMessage.sessionId,
          summary: latestMessage.summary,
          projectCount: projects.length
        });
        
        setProjects(prevProjects => {
          return prevProjects.map(project => {
            const hasSession = project.sessions?.some(s => s.id === latestMessage.sessionId);
            if (hasSession) {
              return {
                ...project,
                sessions: project.sessions.map(session => {
                  if (session.id === latestMessage.sessionId) {
                    return {
                      ...session,
                      summary: latestMessage.summary
                    };
                  }
                  return session;
                })
              };
            }
            return project;
          });
        });
        
        if (selectedSession?.id === latestMessage.sessionId) {
          setSelectedSession(prev => ({
            ...prev,
            summary: latestMessage.summary
          }));
        }
      }
    }
  }, [messages, selectedProject, selectedSession, activeSessions, projects]);

  // Handle URL-based session loading
  useEffect(() => {
    if (sessionId && projects.length > 0) {
      const shouldSwitchTab = !selectedSession || selectedSession.id !== sessionId;
      
      for (const project of projects) {
        const session = project.sessions?.find(s => s.id === sessionId);
        if (session) {
          setSelectedProject(project);
          setSelectedSession(session);
          if (shouldSwitchTab) {
            setActiveTab('chat');
          }
          return;
        }
      }
    }
  }, [sessionId, projects, navigate, selectedSession]);

  // Event handlers
  const handleProjectSelect = useCallback((project) => {
    setSelectedProject(project);
    
    // Auto-select the most recent session if available
    if (project.sessions && project.sessions.length > 0) {
      // Sessions are already sorted by lastUpdated (newest first)
      const mostRecentSession = project.sessions[0];
      setSelectedSession(mostRecentSession);
      navigate(`/session/${mostRecentSession.id}`);
    } else {
      setSelectedSession(null);
      navigate('/');
    }
    
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [navigate, isMobile]);

  const handleSessionSelect = useCallback((session) => {
    setSelectedSession(session);
    if (activeTab !== 'git' && activeTab !== 'preview') {
      setActiveTab('chat');
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
    navigate(`/session/${session.id}`);
  }, [navigate, isMobile, activeTab]);

  const handleNewSession = useCallback((project, sessionId) => {
    setSelectedProject(project);
    setSelectedSession(null);
    setActiveTab('chat');
    navigate(sessionId ? `/session/${sessionId}` : '/');
    if (isMobile) {
      setSidebarOpen(false);
    }
    
    // If a sessionId was provided, refresh projects after a short delay
    // to ensure the session file is created before we refresh
    if (sessionId) {
      setTimeout(() => {
        fetchProjects();
      }, 500);
    }
  }, [navigate, isMobile, fetchProjects]);

  const handleSessionDelete = useCallback((sessionId) => {
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
      navigate('/');
    }
    
    setProjects(prevProjects => 
      prevProjects.map(project => ({
        ...project,
        sessions: project.sessions?.filter(session => session.id !== sessionId) || [],
        sessionMeta: {
          ...project.sessionMeta,
          total: Math.max(0, (project.sessionMeta?.total || 0) - 1)
        }
      }))
    );
  }, [selectedSession, navigate]);

  const handleSidebarRefresh = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');
      const freshProjects = await response.json();
      
      setProjects(prevProjects => {
        const hasChanges = freshProjects.some((newProject, index) => {
          const prevProject = prevProjects[index];
          if (!prevProject) return true;
          
          return (
            newProject.name !== prevProject.name ||
            newProject.displayName !== prevProject.displayName ||
            newProject.fullPath !== prevProject.fullPath ||
            JSON.stringify(newProject.sessionMeta) !== JSON.stringify(prevProject.sessionMeta) ||
            JSON.stringify(newProject.sessions) !== JSON.stringify(prevProject.sessions)
          );
        }) || freshProjects.length !== prevProjects.length;
        
        return hasChanges ? freshProjects : prevProjects;
      });
      
      if (selectedProject) {
        const refreshedProject = freshProjects.find(p => p.name === selectedProject.name);
        if (refreshedProject) {
          if (JSON.stringify(refreshedProject) !== JSON.stringify(selectedProject)) {
            setSelectedProject(refreshedProject);
          }
          
          if (selectedSession) {
            const refreshedSession = refreshedProject.sessions?.find(s => s.id === selectedSession.id);
            if (refreshedSession && JSON.stringify(refreshedSession) !== JSON.stringify(selectedSession)) {
              setSelectedSession(refreshedSession);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error refreshing sidebar', {
        error,
        projectName: selectedProject?.name,
        sessionId: selectedSession?.id,
        stack: error.stack
      });
    }
  }, [selectedProject, selectedSession]);

  const handleProjectDelete = useCallback((projectName) => {
    if (selectedProject?.name === projectName) {
      setSelectedProject(null);
      setSelectedSession(null);
      navigate('/');
    }
    
    setProjects(prevProjects => 
      prevProjects.filter(project => project.name !== projectName)
    );
  }, [selectedProject, navigate]);

  // Session Protection Functions
  const markSessionAsActive = useCallback((sessionId) => {
    if (sessionId) {
      setActiveSessions(prev => new Set([...prev, sessionId]));
    }
  }, []);

  const markSessionAsInactive = useCallback((sessionId) => {
    if (sessionId) {
      setActiveSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  }, []);

  const replaceTemporarySession = useCallback((realSessionId) => {
    if (realSessionId) {
      setActiveSessions(prev => {
        const newSet = new Set();
        for (const sessionId of prev) {
          if (!sessionId.startsWith('new-session-')) {
            newSet.add(sessionId);
          }
        }
        newSet.add(realSessionId);
        return newSet;
      });
    }
  }, []);

  // Settings handlers
  const handleAutoExpandChange = useCallback((value) => {
    setAutoExpandTools(value);
    localStorage.setItem('autoExpandTools', JSON.stringify(value));
  }, []);

  const handleShowRawParametersChange = useCallback((value) => {
    setShowRawParameters(value);
    localStorage.setItem('showRawParameters', JSON.stringify(value));
  }, []);

  const handleAutoScrollChange = useCallback((value) => {
    setAutoScrollToBottom(value);
    localStorage.setItem('autoScrollToBottom', JSON.stringify(value));
  }, []);

  // Wrap setSidebarOpen with logging
  const setSidebarOpenWithLogging = useCallback((value) => {
    logger.debug('setSidebarOpen called', { value, from: new Error().stack });
    setSidebarOpen(value);
  }, []);

  return {
    // State
    projects,
    selectedProject,
    selectedSession,
    activeTab,
    isMobile,
    sidebarOpen,
    isLoadingProjects,
    projectsError,
    isInputFocused,
    showToolsSettings,
    showQuickSettings,
    autoExpandTools,
    showRawParameters,
    autoScrollToBottom,
    activeSessions,
    
    // WebSocket
    ws,
    sendMessage,
    messages,
    connectionHealth,
    
    // Setters
    setActiveTab,
    setSidebarOpen: setSidebarOpenWithLogging,
    setIsInputFocused,
    setShowToolsSettings,
    setShowQuickSettings,
    
    // Handlers
    handleProjectSelect,
    handleSessionSelect,
    handleNewSession,
    handleSessionDelete,
    handleSidebarRefresh,
    handleProjectDelete,
    markSessionAsActive,
    markSessionAsInactive,
    replaceTemporarySession,
    handleAutoExpandChange,
    handleShowRawParametersChange,
    handleAutoScrollChange,
    
    // Navigation
    navigate
  };
};