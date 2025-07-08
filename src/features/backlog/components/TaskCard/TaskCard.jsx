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
import { useIsMobile } from '../../../../hooks/useIsMobile';
import TaskCardWeb from './TaskCard.web';
import TaskCardMobile from './TaskCard.mobile';

export default function TaskCard(props) {
  const isMobile = useIsMobile();

  // Return the appropriate platform-specific implementation
  return isMobile ? (
    <TaskCardMobile {...props} isMobile={true} />
  ) : (
    <TaskCardWeb {...props} />
  );
}