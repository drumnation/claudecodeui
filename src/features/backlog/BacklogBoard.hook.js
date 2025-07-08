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

export function useBacklogBoard(selectedProject) {
  // Core state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cliAvailable, setCliAvailable] = useState(null);
  
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

  // Check CLI availability
  const checkCliAvailability = useCallback(async () => {
    console.log('Checking CLI availability...');
    try {
      const response = await fetch('/api/backlog/health');
      console.log('Health check response:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('Backlog health check failed:', response.status, response.statusText);
        const text = await response.text();
        console.error('Response body:', text);
        setCliAvailable(false);
        return false;
      }
      
      const data = await response.json();
      console.log('Health check data:', data);
      setCliAvailable(data.backlogAvailable);
      return data.backlogAvailable;
    } catch (err) {
      console.error('Error checking backlog CLI:', err);
      setCliAvailable(false);
      return false;
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    console.log('fetchTasks called for project:', selectedProject?.name);
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
  }, [selectedProject, filters]);

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

  // Initialize CLI check
  useEffect(() => {
    if (selectedProject && cliAvailable === null) {
      console.log('Initial CLI check for project:', selectedProject.name);
      checkCliAvailability();
    }
  }, [selectedProject?.name]); // Only run when project changes

  // Fetch tasks when CLI is available
  useEffect(() => {
    if (selectedProject && cliAvailable === true) {
      console.log('CLI is available, fetching tasks');
      fetchTasks();
    } else if (cliAvailable === false) {
      console.log('CLI not available');
      setLoading(false);
    }
  }, [selectedProject?.name, cliAvailable]); // Run when project or CLI availability changes

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