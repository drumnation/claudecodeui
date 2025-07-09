export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
  createdAt?: string;
  updatedAt?: string;
  // Allow for additional fields that might be present
  [key: string]: any;
}

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'in-progress'
  | 'done'
  | 'blocked'
  | 'archived';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onMove?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isMobile?: boolean;
}

export interface TaskCardWebProps
  extends Omit<TaskCardProps, 'onMove' | 'isMobile'> {
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export interface TaskCardMobileProps
  extends Omit<TaskCardProps, 'onDragStart' | 'onDragEnd' | 'isDragging'> {
  onMove: () => void;
  isMobile?: boolean;
}

export interface TaskDisplayInfo {
  displayTitle: string;
  displayDescription?: string;
  isOverdue: boolean;
  daysUntilDue?: number;
}

export interface MetaItem {
  type: 'assignee' | 'dueDate';
  value: string;
  icon: 'User' | 'Calendar';
  isOverdue?: boolean;
}
