/**
 * Platform Pathways Pattern Level 3: Full Component Separation
 *
 * This entry point automatically detects the platform (mobile vs web) and renders
 * the appropriate BacklogBoard implementation. This pattern provides:
 *
 * - Shared business logic in BacklogBoard.logic.js via useBacklogLogic hook
 * - Platform-specific UI implementations (BacklogBoard.web.jsx, BacklogBoard.mobile.jsx)
 * - Automatic platform detection based on screen width
 * - Optimal user experience for each platform
 *
 * Mobile implementation features:
 * - Touch-friendly interface with larger tap targets
 * - Bottom sheet modals for filters and task movement
 * - Collapsible metrics panel
 * - Simplified header with hamburger menu
 * - Tap-to-move instead of drag-and-drop
 *
 * Web implementation features:
 * - Full kanban board layout with drag-and-drop
 * - Complete header with all controls
 * - Metrics bar and filter bar
 * - Mouse-optimized interactions
 */
import React from 'react';
import {useIsMobile} from '../../hooks/useIsMobile';
import BacklogBoardWeb from './BacklogBoard.web';
import BacklogBoardMobile from './BacklogBoard.mobile';
import {BacklogBoardProps} from './BacklogBoard.types';

export default function BacklogBoard({
  selectedProject,
  selectedSession,
}: BacklogBoardProps) {
  const isMobile = useIsMobile();

  // Return the appropriate platform-specific implementation
  return isMobile ? (
    <BacklogBoardMobile
      selectedProject={selectedProject}
      selectedSession={selectedSession}
    />
  ) : (
    <BacklogBoardWeb
      selectedProject={selectedProject}
      selectedSession={selectedSession}
    />
  );
}
