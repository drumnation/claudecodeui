import { useState, useEffect, useCallback, useRef } from 'react';
import { TaskStatus, TaskPriority } from './constants';
import { 
  getBacklogHealthUrl,
  getProjectBacklogUrl,
  getProjectBacklogTasksUrl,
  getProjectBacklogTaskUrl,
  getProjectBacklogPlanUrl,
  getProjectBacklogReviewUrl
} from '../../config/api';
import { createSafeLogger, sanitizeError, addTimestamp, isLevelEnabled } from '../../logger';

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

/**
 * Shared business logic hook for backlog management
 * This hook contains all the core functionality without platform-specific UI state
 */
export function useBacklogLogic(selectedProject) {
  // Use safe logger to prevent hook call errors
  const logger = createSafeLogger({ hook: 'useBacklogLogic' });
  
  if (isLevelEnabled(logger, 'debug')) {
    try {
      logger.debug('useBacklogLogic hook called', {
        projectName: selectedProject?.name,
        ...addTimestamp()
      });
    } catch (error) {
      console.debug('useBacklogLogic hook called', { projectName: selectedProject?.name });
    }
  }
  
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
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    priority: [],
    assignee: '',
    labels: []
  });
  const [sortBy, setSortBy] = useState('priority');
  
  // Planning state
  const [planText, setPlanText] = useState('');
  const [generatingTasks, setGeneratingTasks] = useState(false);
  
  // WebSocket ref for real-time updates
  const wsRef = useRef(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.name]); // Only depend on project name to avoid infinite loops
  
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
    if (!selectedProject) return;
    
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
      
      const response = await fetch(url, { 
        headers: { 'Content-Type': 'application/json' } 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      logger.error('Error fetching tasks', {
        error: sanitizeError(err),
        projectName: selectedProject.name
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.name]);

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

  // Move task (for both drag-and-drop and mobile interactions)
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

  // Initialize CLI check on project change
  useEffect(() => {
    if (!selectedProject) {
      setLoading(false);
      return;
    }
    
    if (cliAvailable === null) {
      checkCliAvailabilityInternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.name]);

  // Fetch tasks when CLI becomes available
  useEffect(() => {
    if (!selectedProject || cliAvailable !== true) {
      return;
    }
    
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.name, cliAvailable]);

  // Set loading false when CLI is not available
  useEffect(() => {
    if (cliAvailable === false) {
      setLoading(false);
    }
  }, [cliAvailable]);

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
    filters,
    sortBy,
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
    updateFilter,
    clearFilters,
    setSortBy,
    setPlanText,
    checkCliAvailability
  };
}

/**
 * Organize tasks by their status into columns
 */
export function organizeTasksByStatus(tasks = []) {
  const columns = {
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.DONE]: [],
    [TaskStatus.BLOCKED]: [],
    [TaskStatus.ARCHIVED]: []
  };

  tasks.forEach(task => {
    if (columns[task.status]) {
      columns[task.status].push(task);
    }
  });

  return columns;
}

/**
 * Validate if a task can be moved from one status to another
 */
export function validateTaskMove(task, fromStatus, toStatus) {
  // Can't move archived tasks
  if (fromStatus === TaskStatus.ARCHIVED) {
    return false;
  }

  // Can only archive from done status
  if (toStatus === TaskStatus.ARCHIVED && fromStatus !== TaskStatus.DONE) {
    return false;
  }

  // Check for blockers when moving to in-progress
  if (toStatus === TaskStatus.IN_PROGRESS && task.blockedBy?.length > 0) {
    return false;
  }

  return true;
}

/**
 * Calculate metrics for the board
 */
export function calculateTaskMetrics(tasks = []) {
  const metrics = {
    total: tasks.length,
    byStatus: {},
    byPriority: {},
    blocked: 0,
    overdue: 0,
    velocity: 0
  };

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  tasks.forEach(task => {
    // Count by status
    metrics.byStatus[task.status] = (metrics.byStatus[task.status] || 0) + 1;

    // Count by priority
    if (task.priority) {
      metrics.byPriority[task.priority] = (metrics.byPriority[task.priority] || 0) + 1;
    }

    // Count blocked
    if (task.status === TaskStatus.BLOCKED) {
      metrics.blocked++;
    }

    // Count overdue
    if (task.dueDate && new Date(task.dueDate) < now && task.status !== TaskStatus.DONE) {
      metrics.overdue++;
    }

    // Calculate velocity (tasks completed in last week)
    if (task.status === TaskStatus.DONE && task.completedAt) {
      const completedDate = new Date(task.completedAt);
      if (completedDate > oneWeekAgo) {
        metrics.velocity++;
      }
    }
  });

  return metrics;
}

/**
 * Filter tasks based on criteria
 */
export function filterTasks(tasks = [], filters = {}) {
  return tasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower) || false;
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) {
        return false;
      }
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!task.priority || !filters.priority.includes(task.priority)) {
        return false;
      }
    }

    // Assignee filter
    if (filters.assignee && task.assignee !== filters.assignee) {
      return false;
    }

    // Labels filter
    if (filters.labels && filters.labels.length > 0) {
      const hasLabel = filters.labels.some(label => task.labels?.includes(label));
      if (!hasLabel) return false;
    }

    return true;
  });
}

/**
 * Sort tasks within columns
 */
export function sortTasks(tasks = [], sortCriteria = 'priority') {
  const sortedTasks = [...tasks];

  switch (sortCriteria) {
    case 'priority':
      const priorityOrder = {
        [TaskPriority.CRITICAL]: 0,
        [TaskPriority.HIGH]: 1,
        [TaskPriority.MEDIUM]: 2,
        [TaskPriority.LOW]: 3
      };
      sortedTasks.sort((a, b) => {
        const aPriority = a.priority ? priorityOrder[a.priority] : 4;
        const bPriority = b.priority ? priorityOrder[b.priority] : 4;
        return aPriority - bPriority;
      });
      break;

    case 'dueDate':
      sortedTasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      break;

    case 'created':
      sortedTasks.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      break;

    case 'title':
      sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
      break;

    default:
      // No sorting
      break;
  }

  return sortedTasks;
}

/**
 * Validate task data
 */
export function validateTaskData(taskData) {
  const errors = {};

  if (!taskData.title || taskData.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (taskData.title.length > 80) {
    errors.title = 'Title must be 80 characters or less';
  }

  if (taskData.description && taskData.description.length > 5000) {
    errors.description = 'Description must be 5000 characters or less';
  }

  if (taskData.dueDate) {
    const dueDate = new Date(taskData.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = 'Invalid due date';
    }
  }

  if (taskData.labels && !Array.isArray(taskData.labels)) {
    errors.labels = 'Labels must be an array';
  }

  if (taskData.dependencies && !Array.isArray(taskData.dependencies)) {
    errors.dependencies = 'Dependencies must be an array';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format task for display
 */
export function formatTaskForDisplay(task) {
  return {
    ...task,
    displayTitle: task.title.length > 50 ? task.title.substring(0, 47) + '...' : task.title,
    displayDescription: task.description?.length > 100 
      ? task.description.substring(0, 97) + '...' 
      : task.description,
    isOverdue: task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE,
    daysUntilDue: task.dueDate 
      ? Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null
  };
}

/**
 * Detect circular dependencies
 */
export function detectTaskConflicts(tasks = []) {
  const conflicts = [];
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  // Check for circular dependencies
  tasks.forEach(task => {
    if (task.dependencies && task.dependencies.length > 0) {
      const visited = new Set();
      const stack = new Set();

      const hasCycle = (taskId) => {
        if (stack.has(taskId)) return true;
        if (visited.has(taskId)) return false;

        visited.add(taskId);
        stack.add(taskId);

        const currentTask = taskMap.get(taskId);
        if (currentTask?.dependencies) {
          for (const depId of currentTask.dependencies) {
            if (hasCycle(depId)) return true;
          }
        }

        stack.delete(taskId);
        return false;
      };

      if (hasCycle(task.id)) {
        conflicts.push({
          type: 'circular-dependency',
          taskId: task.id,
          message: `Task "${task.title}" has circular dependencies`
        });
      }
    }

    // Check for missing dependencies
    if (task.dependencies) {
      task.dependencies.forEach(depId => {
        if (!taskMap.has(depId)) {
          conflicts.push({
            type: 'missing-dependency',
            taskId: task.id,
            dependencyId: depId,
            message: `Task "${task.title}" depends on non-existent task ${depId}`
          });
        }
      });
    }
  });

  return conflicts;
}