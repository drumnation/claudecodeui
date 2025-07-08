import { TaskStatus, TaskPriority } from './constants';

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