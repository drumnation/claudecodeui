import React from 'react';
import { Badge } from '@/shared-components/Badge';
import { formatStatusText } from './TodoStatusBadge.logic';
import * as S from './TodoStatusBadge.styles';

export const TodoStatusBadge = ({ status }) => {
  const StyledBadge = status === 'completed' ? S.CompletedBadge :
                      status === 'in_progress' ? S.InProgressBadge :
                      S.PendingBadge;

  return (
    <Badge variant="outline" as={StyledBadge}>
      {formatStatusText(status)}
    </Badge>
  );
};