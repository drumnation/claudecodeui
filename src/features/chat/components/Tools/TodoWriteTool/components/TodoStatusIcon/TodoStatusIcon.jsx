import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import * as S from './TodoStatusIcon.styles';

export const TodoStatusIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <S.CompletedIcon>
          <CheckCircle2 className="w-full h-full" />
        </S.CompletedIcon>
      );
    case 'in_progress':
      return (
        <S.InProgressIcon>
          <Clock className="w-full h-full" />
        </S.InProgressIcon>
      );
    case 'pending':
    default:
      return (
        <S.PendingIcon>
          <Circle className="w-full h-full" />
        </S.PendingIcon>
      );
  }
};