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
  console.log('🎣 useBacklogBoard hook called with project:', selectedProject?.name);
  
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
      console.log('CLI check already in progress, skipping...');
      return cliAvailable;
    }
    
    // Prevent rapid repeated checks
    const now = Date.now();
    if (now - lastCliCheck < CLI_CHECK_DELAY) {
      console.log('Too soon since last CLI check, skipping...');
      return cliAvailable;
    }
    
    console.log('Checking CLI availability...', { 
      attempt: cliCheckRetries + 1, 
      maxRetries: MAX_CLI_RETRIES 
    });
    
    setIsCheckingCli(true);
    setLastCliCheck(now);
    
    try {
      const response = await fetch('/api/backlog/health');
      console.log('Health check response:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('Backlog health check failed:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response body:', text);
        
        // Retry logic with exponential backoff
        if (cliCheckRetries < MAX_CLI_RETRIES) {
          console.log(`Retrying CLI check in ${(cliCheckRetries + 1) * CLI_CHECK_DELAY}ms...`);
          setTimeout(() => {
            setCliCheckRetries(prev => prev + 1);
            checkCliAvailabilityInternal();
          }, (cliCheckRetries + 1) * CLI_CHECK_DELAY);
        } else {
          console.error('Max CLI check retries reached');
          setCliAvailable(false);
          setError('Failed to check backlog CLI availability after multiple attempts');
        }
        
        return false;
      }
      
      const data = await response.json();
      console.log('Health check data:', data);
      setCliAvailable(data.backlogAvailable);
      setCliCheckRetries(0); // Reset retry counter on success
      setError(null);
      return data.backlogAvailable;
    } catch (err) {
      console.error('Error checking backlog CLI:', err);
      
      // Retry logic for network errors
      if (cliCheckRetries < MAX_CLI_RETRIES) {
        console.log(`Retrying CLI check after error in ${(cliCheckRetries + 1) * CLI_CHECK_DELAY}ms...`);
        setTimeout(() => {
          setCliCheckRetries(prev => prev + 1);
          checkCliAvailabilityInternal();
        }, (cliCheckRetries + 1) * CLI_CHECK_DELAY);
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
    console.log('fetchTasks called for project:', selectedProject?.name);
    if (!selectedProject) return;
    
    // Prevent fetching if already loading
    if (loading) {
      console.log('Already loading tasks, skipping fetch');
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
      
      const url = `/api/projects/${encodeURIComponent(selectedProject.name)}/backlog?${params}`;
      console.log('Fetching tasks from:', url);
      
      const response = await fetch(url, { 
        headers: { 'Content-Type': 'application/json' } 
      });
      
      console.log('Fetch response:', response.status, response.statusText);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Fetch failed, response body:', text);
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      console.log('Tasks data:', data);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      console.log('Setting loading to false');
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
        `/api/projects/${encodeURIComponent(selectedProject.name)}/backlog/tasks`,
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
      console.error('Error creating task:', err);
      throw err;
    }
  }, [selectedProject]);

  // Update task
  const updateTask = useCallback(async (taskId, updates) => {
    if (!selectedProject) return;
    
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(selectedProject.name)}/backlog/tasks/${taskId}`,
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
      console.error('Error updating task:', err);
      throw err;
    }
  }, [selectedProject]);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    if (!selectedProject) return;
    
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(selectedProject.name)}/backlog/tasks/${taskId}`,
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
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [selectedProject]);

  // Move task (drag and drop)
  const moveTask = useCallback(async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (!validateTaskMove(task, task.status, newStatus)) {
      console.warn('Invalid task move');
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
        `/api/projects/${encodeURIComponent(selectedProject.name)}/backlog/plan`,
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
      console.error('Error generating tasks:', err);
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
        `/api/projects/${encodeURIComponent(selectedProject.name)}/backlog/review`,
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
      console.error('Error reviewing tasks:', err);
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
        console.error('Failed to move task:', err);
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
    console.log('Main initialization effect running', {
      project: selectedProject?.name,
      cliAvailable,
      loading
    });
    
    if (!selectedProject) {
      setLoading(false);
      return;
    }
    
    // Check CLI if not yet checked
    if (cliAvailable === null) {
      console.log('Starting CLI availability check');
      checkCliAvailabilityInternal();
    } 
    // Fetch tasks if CLI is available and not loading
    else if (cliAvailable === true && !loading) {
      console.log('CLI available, fetching tasks');
      fetchTasks();
    }
    // Set loading false if CLI not available
    else if (cliAvailable === false) {
      console.log('CLI not available, stopping loading');
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