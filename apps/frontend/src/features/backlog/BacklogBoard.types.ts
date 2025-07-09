export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  labels?: string[];
  dependencies?: string[];
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface BacklogBoardProps {
  selectedProject: {
    name: string;
    path: string;
    fullPath?: string;
    displayName?: string;
  } | null;
  selectedSession?: {
    id: string;
    title?: string;
  } | null;
}

export interface BacklogBoardState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;
  filterOptions: FilterOptions;
  isInstalling: boolean;
  installProgress: number;
  installMessage: string;
  showInstaller: boolean;
}

export interface FilterOptions {
  status: string[];
  priority: string[];
  assignee: string;
  labels: string[];
  search: string;
}

export interface TaskColumn {
  id: string;
  title: string;
  tasks: Task[];
}

export interface DragEndResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

export interface BacklogMetrics {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  completed: number;
  inProgress: number;
  todo: number;
  blocked: number;
  overdue: number;
  velocity: number;
}

export interface BacklogInstallStatus {
  installed: boolean;
  version?: string;
  path?: string;
  error?: string;
}
