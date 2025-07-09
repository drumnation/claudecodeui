export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TodoStatusBadgeProps {
  status: TodoStatus;
}
