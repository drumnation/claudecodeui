import React, { useState } from 'react';
import styled from '@emotion/styled';
import { 
  Calendar, 
  User, 
  Tag, 
  MoreVertical, 
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import TaskStatusBadge from '../TaskStatusBadge/TaskStatusBadge';
import TaskPriorityBadge from '../TaskPriorityBadge/TaskPriorityBadge';
import { 
  getTaskDisplayInfo, 
  getTaskMetaItems, 
  getDisplayLabels,
  hasOverflowContent
} from './TaskCard.logic';
import { Button } from '../../../../shared-components/Button';

const MobileCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  min-height: 44px; /* Accessibility: minimum touch target */

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: scale(0.98);
    background: ${props => props.theme.colors.border}20;
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const MobileCardTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  color: ${props => props.theme.colors.text};
  line-height: 1.4;
  margin-right: 0.5rem;
`;

const MobileCardDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: ${props => props.isExpanded ? 'block' : '-webkit-box'};
  -webkit-line-clamp: ${props => props.isExpanded ? 'none' : '2'};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MobileCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const MobileMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  min-height: 24px; /* Ensure consistent height */
`;

const MobileCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const MobileBadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const MobileLabels = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const MobileLabel = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  border-radius: 0.375rem;
  font-weight: 500;
`;

const MobileActionButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 44px; /* Accessibility: minimum touch target */
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primaryHover || props.theme.colors.primary};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MobileOverdueIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: ${props => props.theme.colors.error};
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.theme.colors.error}10;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
`;

const ExpandToggle = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  min-height: 32px;

  &:hover {
    background: ${props => props.theme.colors.border}30;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;

  &:hover {
    background: ${props => props.theme.colors.border}30;
  }

  &:active {
    background: ${props => props.theme.colors.border}50;
  }
`;

export default function TaskCardMobile({ 
  task, 
  onEdit, 
  onMove,
  isMobile = true
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const displayTask = getTaskDisplayInfo(task);
  const metaItems = getTaskMetaItems(task, true); // true = mobile
  const displayLabels = getDisplayLabels(task.labels, true);
  const hasOverflow = hasOverflowContent(task);

  const handleCardClick = (e) => {
    // Don't trigger if clicking on buttons
    if (e.target.closest('button')) return;
    onEdit();
  };

  const handleMoveClick = (e) => {
    e.stopPropagation();
    onMove();
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const toggleExpanded = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const renderMetaItem = (metaItem) => {
    const IconComponent = metaItem.icon === 'User' ? User : Calendar;
    
    if (metaItem.type === 'dueDate' && metaItem.isOverdue) {
      return (
        <MobileOverdueIndicator key={metaItem.type}>
          <AlertCircle size={14} />
          {metaItem.value}
        </MobileOverdueIndicator>
      );
    }
    
    return (
      <MobileMetaItem key={metaItem.type}>
        <IconComponent size={16} />
        {metaItem.value}
      </MobileMetaItem>
    );
  };

  return (
    <MobileCard onClick={handleCardClick}>
      <MobileCardHeader>
        <MobileCardTitle>
          {isExpanded ? task.title : displayTask.displayTitle}
        </MobileCardTitle>
        <MenuButton onClick={handleMenuClick}>
          <MoreVertical size={20} />
        </MenuButton>
      </MobileCardHeader>

      {task.description && (
        <>
          <MobileCardDescription isExpanded={isExpanded}>
            {isExpanded ? task.description : displayTask.displayDescription}
          </MobileCardDescription>
          {hasOverflow && (
            <ExpandToggle onClick={toggleExpanded}>
              {isExpanded ? (
                <>
                  Show less <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Show more <ChevronDown size={14} />
                </>
              )}
            </ExpandToggle>
          )}
        </>
      )}

      {metaItems.length > 0 && (
        <MobileCardMeta>
          {metaItems.map(renderMetaItem)}
        </MobileCardMeta>
      )}

      {displayLabels.length > 0 && (
        <MobileLabels>
          {displayLabels.map(label => (
            <MobileLabel key={label}>
              <Tag size={12} />
              {label}
            </MobileLabel>
          ))}
          {task.labels && task.labels.length > 2 && !isExpanded && (
            <MobileLabel style={{ opacity: 0.7 }}>
              +{task.labels.length - 2} more
            </MobileLabel>
          )}
        </MobileLabels>
      )}

      <MobileCardFooter>
        <MobileBadgeContainer>
          {task.priority && <TaskPriorityBadge priority={task.priority} />}
          <TaskStatusBadge status={task.status} />
        </MobileBadgeContainer>
        
        <MobileActionButton onClick={handleMoveClick}>
          Move
          <ArrowRight size={16} />
        </MobileActionButton>
      </MobileCardFooter>
    </MobileCard>
  );
}