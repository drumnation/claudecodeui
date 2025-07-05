import React from 'react';
import { Badge } from '@/shared-components/Badge';
import * as S from './TodoPriorityBadge.styles';

export const TodoPriorityBadge = ({ priority }) => {
  const StyledBadge = priority === 'high' ? S.HighPriorityBadge :
                      priority === 'medium' ? S.MediumPriorityBadge :
                      S.LowPriorityBadge;

  return (
    <Badge variant="outline" as={StyledBadge}>
      {priority}
    </Badge>
  );
};