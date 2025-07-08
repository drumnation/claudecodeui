import React from 'react';
import styled from '@emotion/styled';
import { 
  AlertTriangle, 
  ChevronUp, 
  Minus, 
  ChevronDown 
} from 'lucide-react';
import { TaskPriority, TaskPriorityLabels, TaskPriorityColors } from '../../constants';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  background: ${props => props.color}20;
  color: ${props => props.color};
  white-space: nowrap;
`;

const priorityIcons = {
  [TaskPriority.CRITICAL]: AlertTriangle,
  [TaskPriority.HIGH]: ChevronUp,
  [TaskPriority.MEDIUM]: Minus,
  [TaskPriority.LOW]: ChevronDown
};

export default function TaskPriorityBadge({ priority }) {
  const Icon = priorityIcons[priority] || Minus;
  const color = TaskPriorityColors[priority] || '#6b7280';
  const label = TaskPriorityLabels[priority] || priority;

  return (
    <Badge color={color}>
      <Icon size={12} />
      {label}
    </Badge>
  );
}