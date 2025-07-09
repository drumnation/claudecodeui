import {TodoItem} from '@/features/chat/components/Tools/Tools.types';

export interface TodoListProps {
  todos: TodoItem[];
  isResult?: boolean;
}
