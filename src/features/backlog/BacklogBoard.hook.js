import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TaskStatus } from './constants';
import { 
  organizeTasksByStatus, 
  filterTasks, 
  sortTasks, 
  validateTaskData,
  validateTaskMove 
} from './BacklogBoard.logic';
import { 
  getBacklogHealthUrl,
  getProjectBacklogUrl,
  getProjectBacklogTasksUrl,
  getProjectBacklogTaskUrl,
  getProjectBacklogPlanUrl,
  getProjectBacklogReviewUrl
} from '../../config/api';
import { useLogger, sanitizeError, addTimestamp, isLevelEnabled } from '../../logger';

// Simple debounce implementation
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function useBacklogBoard(selectedProject) {
  const logger = useLogger({ hook: 'useBacklogBoard' });
  
  logger.debug('useBacklogBoard hook called', {
    projectName: selectedProject?.name,
    ...addTimestamp()
  });
  
  // Core state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cliAvailable, setCliAvailable] = useState(null);
  
  // CLI check state
  const [isCheckingCli, setIsCheckingCli] = useState(false);
  const [cliCheckRetries, setCliCheckRetries] = useState(0);
  const [lastCliCheck, setLastCliCheck] = useState(0);
  const MAX_CLI_RETRIES = 3;
  const CLI_CHECK_DELAY = 1000; // 1 second between retries
  
  // UI state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPlanningMode, setIsPlanningMode] = useState(false);
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    priority: [],
    assignee: '',
    labels: []
  });
  const [sortBy, setSortBy] = useState('priority');
  
  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  
  // Planning state
  const [planText, setPlanText] = useState('');
  const [generatingTasks, setGeneratingTasks] = useState(false);
  
  // WebSocket ref for real-time updates
  const wsRef = useRef(null);
  const location = useLocation();

  // Check CLI availability with debouncing and retry logic
  const checkCliAvailabilityInternal = useCallback(async () => {
    // Prevent concurrent checks
    if (isCheckingCli) {
      if (isLevelEnabled(logger, 'debug')) {
        logger.debug('CLI check already in progress, skipping', {
          projectName: selectedProject?.name,
          cliAvailable,
          retryCount: cliCheckRetries,
          ...addTimestamp()
        });
      }
      return cliAvailable;
    }
    
    // Prevent rapid repeated checks
    const now = Date.now();
    if (now - lastCliCheck < CLI_CHECK_DELAY) {
      if (isLevelEnabled(logger, 'trace')) {
        logger.trace('CLI check too soon since last attempt', {
          timeSinceLastCheck: now - lastCliCheck,
          requiredDelay: CLI_CHECK_DELAY,
          projectName: selectedProject?.name,
          ...addTimestamp()
        });
      }
      return cliAvailable;
    }
    
    logger.debug('Checking CLI availability', { 
      attempt: cliCheckRetries + 1, 
      maxRetries: MAX_CLI_RETRIES,
      projectName: selectedProject?.name,
      ...addTimestamp()
    });
    
    setIsCheckingCli(true);
    setLastCliCheck(now);
    
    try {
      const response = await fetch(getBacklogHealthUrl());
      logger.debug('Health check response received', {
        status: response.status,
        statusText: response.statusText,
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      
      // Accept both 200 and 503 as valid responses (not network errors)
      // 503 was the old response for CLI not found, now we always return 200
      if (response.status === 200 || response.status === 503) {
        try {
          const data = await response.json();
          logger.debug('Health check data received', {
            backlogAvailable: data.backlogAvailable,
            hasDebugInfo: !!data.debug,
            projectName: selectedProject?.name,
            ...addTimestamp()
          });
          
          // Check for the backlogAvailable field
          if (typeof data.backlogAvailable === 'boolean') {
            setCliAvailable(data.backlogAvailable);
            setCliCheckRetries(0); // Reset retry counter on success
            setError(null);
            
            // Store debug info if available
            if (data.debug && isLevelEnabled(logger, 'debug')) {
              logger.debug('CLI debug info received', {
                debugInfo: data.debug,
                projectName: selectedProject?.name,
                ...addTimestamp()
              });
            }
            
            return data.backlogAvailable;
          } else {
            logger.warn('Unexpected health check response format', {
              responseData: data,
              projectName: selectedProject?.name,
              ...addTimestamp()
            });
            setCliAvailable(false);
            setError('Unexpected response format from health check');
            return false;
          }
        } catch (parseError) {
          logger.error('Failed to parse health check response', {
            error: sanitizeError(parseError),
            status: response.status,
            projectName: selectedProject?.name,
            ...addTimestamp()
          });
          setCliAvailable(false);
          setError('Failed to parse health check response');
          return false;
        }
      } else if (response.status >= 500) {
        // Only retry on server errors (500+)
        logger.error('Server error during health check', {
          status: response.status,
          statusText: response.statusText,
          retryAttempt: cliCheckRetries + 1,
          projectName: selectedProject?.name,
          ...addTimestamp()
        });
        
        // Retry logic with exponential backoff
        if (cliCheckRetries < MAX_CLI_RETRIES) {
          const delay = Math.min((cliCheckRetries + 1) * CLI_CHECK_DELAY, 10000); // Max 10 seconds
          logger.info('Retrying CLI check after server error', {
            delay,
            attempt: cliCheckRetries + 1,
            maxRetries: MAX_CLI_RETRIES,
            projectName: selectedProject?.name,
            ...addTimestamp()
          });
          setTimeout(() => {
            setCliCheckRetries(prev => prev + 1);
            checkCliAvailabilityInternal();
          }, delay);
        } else {
          logger.error('Max CLI check retries reached', {
            totalAttempts: cliCheckRetries + 1,
            lastError: 'Server error',
            projectName: selectedProject?.name,
            ...addTimestamp()
          });
          setCliAvailable(false);
          setError('Server error checking backlog CLI availability');
        }
        
        return false;
      } else {
        // Other HTTP errors (4xx, etc) - don't retry
        logger.error('HTTP error during health check', {
          status: response.status,
          statusText: response.statusText,
          projectName: selectedProject?.name,
          ...addTimestamp()
        });
        setCliAvailable(false);
        setError(`HTTP ${response.status} error checking backlog CLI`);
        return false;
      }
    } catch (err) {
      logger.error('Network error checking backlog CLI', {
        error: sanitizeError(err),
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      
      // Retry logic for network errors only
      if (cliCheckRetries < MAX_CLI_RETRIES) {
        const delay = Math.min((cliCheckRetries + 1) * CLI_CHECK_DELAY, 10000); // Max 10 seconds
        logger.info('Retrying CLI check after network error', {
          delay,
          attempt: cliCheckRetries + 1,
          maxRetries: MAX_CLI_RETRIES,
          errorMessage: err.message,
          projectName: selectedProject?.name,
          ...addTimestamp()
        });
        setTimeout(() => {
          setCliCheckRetries(prev => prev + 1);
          checkCliAvailabilityInternal();
        }, delay);
      } else {
        setCliAvailable(false);
        setError(`Network error checking backlog CLI: ${err.message}`);
      }
      
      return false;
    } finally {
      setIsCheckingCli(false);
    }
  }, [isCheckingCli, lastCliCheck, cliCheckRetries, cliAvailable]);
  
  // Create a stable debounced function using useRef
  const debouncedCheckRef = useRef(null);
  if (!debouncedCheckRef.current) {
    debouncedCheckRef.current = debounce(checkCliAvailabilityInternal, 300);
  }
  
  const checkCliAvailability = useCallback(() => {
    debouncedCheckRef.current();
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    logger.debug('fetchTasks called', {
      projectName: selectedProject?.name,
      loading,
      ...addTimestamp()
    });
    if (!selectedProject) return;
    
    // Prevent fetching if already loading
    if (loading) {
      if (isLevelEnabled(logger, 'trace')) {
        logger.trace('Already loading tasks, skipping fetch', {
          projectName: selectedProject?.name,
          ...addTimestamp()
        });
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.status.length > 0) params.append('status', filters.status.join(','));
      if (filters.priority.length > 0) params.append('priority', filters.priority.join(','));
      if (filters.assignee) params.append('assignee', filters.assignee);
      if (filters.labels.length > 0) params.append('labels', filters.labels.join(','));
      if (filters.search) params.append('search', filters.search);
      
      const url = getProjectBacklogUrl(selectedProject.name, params.toString());
      logger.debug('Fetching tasks from API', {
        url,
        projectName: selectedProject.name,
        filtersApplied: Object.keys(filters).filter(key => 
          Array.isArray(filters[key]) ? filters[key].length > 0 : !!filters[key]
        ),
        ...addTimestamp()
      });
      
      const response = await fetch(url, { 
        headers: { 'Content-Type': 'application/json' } 
      });
      
      logger.debug('Tasks fetch response received', {
        status: response.status,
        statusText: response.statusText,
        projectName: selectedProject.name,
        ...addTimestamp()
      });
      
      if (!response.ok) {
        const text = await response.text();
        logger.error('Tasks fetch failed', {
          status: response.status,
          responseBody: text.substring(0, 200),
          projectName: selectedProject.name,
          ...addTimestamp()
        });
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      logger.info('Tasks loaded successfully', {
        taskCount: data.tasks?.length || 0,
        projectName: selectedProject.name,
        ...addTimestamp()
      });
      setTasks(data.tasks || []);
    } catch (err) {
      logger.error('Error fetching tasks', {
        error: sanitizeError(err),
        projectName: selectedProject.name,
        ...addTimestamp()
      });
      setError(err.message);
    } finally {
      if (isLevelEnabled(logger, 'trace')) {
        logger.trace('Setting loading to false', {
          projectName: selectedProject.name,
          ...addTimestamp()
        });
      }
      setLoading(false);
    }
  }, [selectedProject, filters, loading]);

  // Create task
  const createTask = useCallback(async (taskData) => {
    if (!selectedProject) return;
    
    const validation = validateTaskData(taskData);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors).join(', '));
    }
    
    try {
      const response = await fetch(
        getProjectBacklogTasksUrl(selectedProject.name),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }
      
      const data = await response.json();
      
      // Optimistic update
      setTasks(prev => [...prev, data.task]);
      setIsCreateModalOpen(false);
      
      return data.task;
    } catch (err) {
      logger.error('Error creating task', {
        error: sanitizeError(err),
        taskData,
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      throw err;
    }
  }, [selectedProject]);

  // Update task
  const updateTask = useCallback(async (taskId, updates) => {
    if (!selectedProject) return;
    
    try {
      const response = await fetch(
        getProjectBacklogTaskUrl(selectedProject.name, taskId),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }
      
      const data = await response.json();
      
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? data.task : t));
      setIsEditModalOpen(false);
      setSelectedTask(null);
      
      return data.task;
    } catch (err) {
      logger.error('Error updating task', {
        error: sanitizeError(err),
        taskId,
        updates,
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      throw err;
    }
  }, [selectedProject]);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    if (!selectedProject) return;
    
    try {
      const response = await fetch(
        getProjectBacklogTaskUrl(selectedProject.name, taskId),
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }
      
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTask(null);
    } catch (err) {
      logger.error('Error deleting task', {
        error: sanitizeError(err),
        taskId,
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      throw err;
    }
  }, [selectedProject]);

  // Move task (drag and drop)
  const moveTask = useCallback(async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!validateTaskMove(task, task.status, newStatus)) {
      logger.warn('Invalid task move', {
        taskId,
        fromStatus: task.status,
        toStatus: newStatus,
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      return;
    }
    
    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));
    
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      // Revert on error
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: task.status } : t
      ));
      throw err;
    }
  }, [tasks, updateTask]);

  // Generate tasks from plan
  const generateTasksFromPlan = useCallback(async () => {
    if (!selectedProject || !planText.trim()) return;
    
    setGeneratingTasks(true);
    
    try {
      const response = await fetch(
        getProjectBacklogPlanUrl(selectedProject.name),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planText,
            projectContext: `Project: ${selectedProject.displayName}\nPath: ${selectedProject.path}`
          })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate tasks');
      }
      
      const data = await response.json();
      
      // Add generated tasks to the list
      setTasks(prev => [...prev, ...data.createdTasks]);
      setPlanText('');
      setIsPlanningMode(false);
      
      return data;
    } catch (err) {
      logger.error('Error generating tasks from plan', {
        error: sanitizeError(err),
        planTextLength: planText?.length || 0,
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      throw err;
    } finally {
      setGeneratingTasks(false);
    }
  }, [selectedProject, planText]);

  // Review and update tasks
  const reviewTasks = useCallback(async (changesSummary) => {
    if (!selectedProject) return;
    
    try {
      const response = await fetch(
        getProjectBacklogReviewUrl(selectedProject.name),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            changesSummary,
            projectContext: `Project: ${selectedProject.displayName}\nPath: ${selectedProject.path}`
          })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to review tasks');
      }
      
      const data = await response.json();
      
      // Refresh tasks after review
      await fetchTasks();
      
      return data;
    } catch (err) {
      logger.error('Error reviewing tasks', {
        error: sanitizeError(err),
        changesSummaryLength: changesSummary?.length || 0,
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      throw err;
    }
  }, [selectedProject, fetchTasks]);

  // Drag and drop handlers
  const handleDragStart = useCallback((task) => {
    setDraggedTask(task);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e, status) => {
    e.preventDefault();
    setDragOverColumn(status);
  }, []);

  const handleDrop = useCallback(async (e, status) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== status) {
      try {
        await moveTask(draggedTask.id, status);
      } catch (err) {
        logger.error('Failed to move task via drag and drop', {
          error: sanitizeError(err),
          taskId: draggedTask.id,
          fromStatus: draggedTask.status,
          toStatus: status,
          projectName: selectedProject?.name,
          ...addTimestamp()
        });
      }
    }
    
    setDraggedTask(null);
    setDragOverColumn(null);
  }, [draggedTask, moveTask]);

  // Filter handlers
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      assignee: '',
      labels: []
    });
  }, []);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback((task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  }, []);

  const closeModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedTask(null);
  }, []);

  // Planning mode handlers
  const togglePlanningMode = useCallback(() => {
    setIsPlanningMode(prev => !prev);
  }, []);

  // Initialize on mount and when project changes
  useEffect(() => {
    if (isLevelEnabled(logger, 'debug')) {
      logger.debug('Main initialization effect running', {
        projectName: selectedProject?.name,
        cliAvailable,
        loading,
        ...addTimestamp()
      });
    }
    
    if (!selectedProject) {
      setLoading(false);
      return;
    }
    
    // Check CLI if not yet checked
    if (cliAvailable === null) {
      logger.info('Starting CLI availability check', {
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      checkCliAvailabilityInternal();
    } 
    // Fetch tasks if CLI is available and not loading
    else if (cliAvailable === true && !loading) {
      logger.info('CLI available, fetching tasks', {
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      fetchTasks();
    }
    // Set loading false if CLI not available
    else if (cliAvailable === false) {
      logger.warn('CLI not available, stopping loading', {
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
      setLoading(false);
    }
  }, [selectedProject?.name, cliAvailable]); // Minimal dependencies

  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (!selectedProject) return;
    
    // TODO: Implement WebSocket connection for real-time updates
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedProject]);

  // Process tasks for display
  const processedTasks = sortTasks(filterTasks(tasks, filters), sortBy);
  const columns = organizeTasksByStatus(processedTasks);

  return {
    // State
    tasks: processedTasks,
    columns,
    loading,
    error,
    cliAvailable,
    selectedTask,
    isCreateModalOpen,
    isEditModalOpen,
    isPlanningMode,
    filters,
    sortBy,
    draggedTask,
    dragOverColumn,
    planText,
    generatingTasks,
    
    // Actions
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    generateTasksFromPlan,
    reviewTasks,
    fetchTasks,
    
    // UI Actions
    openCreateModal,
    openEditModal,
    closeModals,
    togglePlanningMode,
    updateFilter,
    clearFilters,
    setSortBy,
    setPlanText,
    checkCliAvailability,
    
    // Drag and drop handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };
}