/**
 * Platform Pathways Pattern Level 3: TaskCard Entry Point
 *
 * This entry point automatically detects the platform and renders the appropriate
 * TaskCard implementation:
 *
 * - TaskCard.web.jsx: Desktop version with drag-and-drop functionality
 * - TaskCard.mobile.jsx: Mobile version with touch-friendly interactions
 *
 * Shared logic is handled in TaskCard.logic.js for:
 * - Task formatting and display
 * - Meta item calculation
 * - Label display logic
 * - Overflow content detection
 */
import React from 'react';
import {useIsMobile} from '../../../../hooks/useIsMobile';
import TaskCardWeb from './TaskCard.web';
import TaskCardMobile from './TaskCard.mobile';
import type {TaskCardProps} from './TaskCard.types';

export default function TaskCard(props: TaskCardProps) {
  const isMobile = useIsMobile();

  // Return the appropriate platform-specific implementation
  if (isMobile) {
    const mobileProps = {
      task: props.task,
      onEdit: props.onEdit,
      onMove: props.onMove || (() => {}),
      isMobile: true,
    };
    return <TaskCardMobile {...mobileProps} />;
  } else {
    const webProps = {
      task: props.task,
      onEdit: props.onEdit,
      onDragStart: props.onDragStart || (() => {}),
      onDragEnd: props.onDragEnd || (() => {}),
      isDragging: props.isDragging,
    };
    return <TaskCardWeb {...webProps} />;
  }
}
