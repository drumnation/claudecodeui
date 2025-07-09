import React from 'react';
import styled from '@emotion/styled';
import {Circle, PlayCircle, CheckCircle, XCircle, Archive} from 'lucide-react';
import {TaskStatus, TaskStatusLabels, TaskStatusColors} from '../../constants';
import type {TaskStatusBadgeProps} from './TaskStatusBadge.types';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  background: ${(props: {color: string}) => props.color}20;
  color: ${(props: {color: string}) => props.color};
  white-space: nowrap;
`;

const statusIcons = {
  [TaskStatus.TODO]: Circle,
  [TaskStatus.IN_PROGRESS]: PlayCircle,
  [TaskStatus.DONE]: CheckCircle,
  [TaskStatus.BLOCKED]: XCircle,
  [TaskStatus.ARCHIVED]: Archive,
};

export default function TaskStatusBadge({status}: TaskStatusBadgeProps) {
  const Icon = statusIcons[status] || Circle;
  const color = TaskStatusColors[status] || '#6b7280';
  const label = TaskStatusLabels[status] || status;

  return (
    <Badge color={color}>
      <Icon size={12} />
      {label}
    </Badge>
  );
}
