import React from 'react';
import { TodoItem } from '../TodoItem';
import * as S from './TodoList.styles';

export const TodoList = ({ todos, isResult = false }) => {
  if (!todos || !Array.isArray(todos)) {
    return null;
  }

  return (
    <S.Container>
      {isResult && (
        <S.Header>
          Todo List ({todos.length} {todos.length === 1 ? 'item' : 'items'})
        </S.Header>
      )}
      
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </S.Container>
  );
};