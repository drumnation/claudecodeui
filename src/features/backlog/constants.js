export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  BLOCKED: 'blocked',
  ARCHIVED: 'archived'
};

export const TaskPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const TaskStatusLabels = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.BLOCKED]: 'Blocked',
  [TaskStatus.ARCHIVED]: 'Archived'
};

export const TaskPriorityLabels = {
  [TaskPriority.CRITICAL]: 'Critical',
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.LOW]: 'Low'
};

export const TaskStatusColors = {
  [TaskStatus.TODO]: '#64748b',
  [TaskStatus.IN_PROGRESS]: '#3b82f6',
  [TaskStatus.DONE]: '#10b981',
  [TaskStatus.BLOCKED]: '#ef4444',
  [TaskStatus.ARCHIVED]: '#6b7280'
};

export const TaskPriorityColors = {
  [TaskPriority.CRITICAL]: '#dc2626',
  [TaskPriority.HIGH]: '#f59e0b',
  [TaskPriority.MEDIUM]: '#3b82f6',
  [TaskPriority.LOW]: '#6b7280'
};