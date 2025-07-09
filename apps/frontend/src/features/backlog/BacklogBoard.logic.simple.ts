import {useState, useEffect, useCallback} from 'react';
import {
  organizeTasksByStatus,
  filterTasks,
  sortTasks,
  calculateTaskMetrics as _calculateTaskMetrics,
  validateTaskData as _validateTaskData,
  validateTaskMove as _validateTaskMove,
} from './BacklogBoard.logic';

/**
 * Simplified version of useBacklogLogic for debugging
 */
export function useBacklogLogic(selectedProject: any) {
  const [tasks, _setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState(null);
  const [cliAvailable, setCliAvailable] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    priority: [],
    assignee: '',
    labels: [],
  });
  const [sortBy, setSortBy] = useState('priority');
  const [planText, setPlanText] = useState('');
  const [generatingTasks, _setGeneratingTasks] = useState(false);

  // Simple initialization
  useEffect(() => {
    if (selectedProject) {
      // Simulate loading
      setTimeout(() => {
        setCliAvailable(true);
        setLoading(false);
      }, 1000);
    }
  }, [selectedProject]);

  // Mock functions
  const fetchTasks = useCallback(async () => {
    console.log('Fetching tasks...');
  }, []);

  const createTask = useCallback(async (taskData: any) => {
    console.log('Creating task:', taskData);
  }, []);

  const updateTask = useCallback(async (taskId: any, updates: any) => {
    console.log('Updating task:', taskId, updates);
  }, []);

  const deleteTask = useCallback(async (taskId: any) => {
    console.log('Deleting task:', taskId);
  }, []);

  const moveTask = useCallback(async (taskId: any, newStatus: any) => {
    console.log('Moving task:', taskId, 'to', newStatus);
  }, []);

  const generateTasksFromPlan = useCallback(async () => {
    console.log('Generating tasks from plan');
  }, []);

  const reviewTasks = useCallback(async (changesSummary: any) => {
    console.log('Reviewing tasks:', changesSummary);
  }, []);

  const updateFilter = useCallback((key: any, value: any) => {
    setFilters((prev) => ({...prev, [key]: value}));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      assignee: '',
      labels: [],
    });
  }, []);

  const checkCliAvailability = useCallback(async () => {
    console.log('Checking CLI availability');
  }, []);

  // Process tasks for display
  const processedTasks = sortTasks(filterTasks(tasks, filters), sortBy);
  const columns = organizeTasksByStatus(processedTasks);

  return {
    tasks: processedTasks,
    columns,
    loading,
    error,
    cliAvailable,
    filters,
    sortBy,
    planText,
    generatingTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    generateTasksFromPlan,
    reviewTasks,
    fetchTasks,
    updateFilter,
    clearFilters,
    setSortBy,
    setPlanText,
    checkCliAvailability,
  };
}
