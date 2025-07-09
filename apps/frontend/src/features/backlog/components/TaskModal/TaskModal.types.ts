import type {Task} from '../TaskCard/TaskCard.types';

export interface TaskModalProps {
  mode: 'create' | 'edit';
  task?: Task;
  onSubmit: (formData: TaskFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  labels: string[];
  dependencies: string[];
  dueDate: string;
}

export interface TaskFormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: TaskFormErrors;
}
