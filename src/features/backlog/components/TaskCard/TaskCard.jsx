import React from 'react';
import styled from '@emotion/styled';
import { 
  Calendar, 
  User, 
  Tag, 
  MoreVertical, 
  GripVertical,
  AlertCircle
} from 'lucide-react';
import TaskStatusBadge from '../TaskStatusBadge/TaskStatusBadge';
import TaskPriorityBadge from '../TaskPriorityBadge/TaskPriorityBadge';
import { formatTaskForDisplay } from '../../BacklogBoard.logic';

const Card = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  opacity: ${props => props.isDragging ? 0.5 : 1};
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const DragHandle = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  cursor: grab;
  margin-right: 0.25rem;
  
  &:active {
    cursor: grabbing;
  }
`;

const CardDescription = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const Labels = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
`;

const Label = styled.span`
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  border-radius: 0.25rem;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.border};
  }
`;

const OverdueIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.theme.colors.error};
  font-size: 0.75rem;
  font-weight: 500;
`;

export default function TaskCard({ 
  task, 
  onEdit, 
  onDragStart, 
  onDragEnd, 
  isDragging 
}) {
  const displayTask = formatTaskForDisplay(task);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
      onClick={onEdit}
    >
      <CardHeader>
        <DragHandle>
          <GripVertical size={14} />
        </DragHandle>
        <CardTitle>{displayTask.displayTitle}</CardTitle>
        <MenuButton onClick={handleMenuClick}>
          <MoreVertical size={14} />
        </MenuButton>
      </CardHeader>

      {displayTask.displayDescription && (
        <CardDescription>{displayTask.displayDescription}</CardDescription>
      )}

      <CardMeta>
        {task.assignee && (
          <MetaItem>
            <User size={12} />
            {task.assignee}
          </MetaItem>
        )}
        
        {task.dueDate && (
          <MetaItem>
            <Calendar size={12} />
            {displayTask.isOverdue ? (
              <OverdueIndicator>
                <AlertCircle size={12} />
                Overdue
              </OverdueIndicator>
            ) : (
              <>
                {displayTask.daysUntilDue === 0 ? 'Due today' :
                 displayTask.daysUntilDue === 1 ? 'Due tomorrow' :
                 displayTask.daysUntilDue < 0 ? `${Math.abs(displayTask.daysUntilDue)} days overdue` :
                 `${displayTask.daysUntilDue} days`}
              </>
            )}
          </MetaItem>
        )}
      </CardMeta>

      {task.labels && task.labels.length > 0 && (
        <Labels>
          {task.labels.map(label => (
            <Label key={label}>
              <Tag size={10} />
              {label}
            </Label>
          ))}
        </Labels>
      )}

      <CardFooter>
        <BadgeContainer>
          {task.priority && <TaskPriorityBadge priority={task.priority} />}
          <TaskStatusBadge status={task.status} />
        </BadgeContainer>
      </CardFooter>
    </Card>
  );
}