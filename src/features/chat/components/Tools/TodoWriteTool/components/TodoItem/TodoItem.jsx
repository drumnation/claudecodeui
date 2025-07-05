import React from 'react';
import { TodoStatusIcon } from '../TodoStatusIcon';
import { TodoStatusBadge } from '../TodoStatusBadge';
import { TodoPriorityBadge } from '../TodoPriorityBadge';
import * as S from './TodoItem.styles';

export const TodoItem = ({ todo }) => {
  const { id, content, status, priority } = todo;
  const isCompleted = status === 'completed';

  return (
    <S.ItemContainer>
      <S.IconWrapper>
        <TodoStatusIcon status={status} />
      </S.IconWrapper>
      
      <S.ContentWrapper>
        <S.ContentRow>
          <S.TodoContent completed={isCompleted}>
            {content}
          </S.TodoContent>
          
          <S.BadgeContainer>
            <TodoPriorityBadge priority={priority} />
            <TodoStatusBadge status={status} />
          </S.BadgeContainer>
        </S.ContentRow>
      </S.ContentWrapper>
    </S.ItemContainer>
  );
};