import React, { useState, useCallback } from 'react';
import { ThemeProvider } from '@emotion/react';
import { 
  Menu,
  Plus, 
  Filter, 
  RefreshCw,
  AlertCircle,
  Loader2,
  Edit3,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useBacklogLogic } from './BacklogBoard.logic';
import TaskCard from './components/TaskCard/TaskCard';
import TaskModal from './components/TaskModal/TaskModal';
import PlanPanel from './components/PlanPanel/PlanPanel';
import BacklogInstaller from './components/BacklogInstaller/BacklogInstaller';
import { BacklogErrorBoundary } from './components/BacklogErrorBoundary';
import { TaskStatus, TaskStatusLabels } from './constants';
import { calculateTaskMetrics } from './BacklogBoard.logic';
import { getTheme } from './theme';
import {
  MobileBoardContainer,
  MobileHeader,
  MobileHeaderLeft,
  HamburgerButton,
  MobileTitle,
  FloatingActionButton,
  MobileMetricsPanel,
  MetricsToggle,
  MobileMetrics,
  MobileMetricItem,
  MobileMetricValue,
  MobileMetricLabel,
  MobileContent,
  MobileColumnsContainer,
  MobileColumn,
  MobileColumnHeader,
  MobileColumnTitle,
  MobileColumnCount,
  MobileColumnContent,
  MobileEmptyColumn,
  BottomSheetOverlay,
  BottomSheet,
  BottomSheetHandle,
  BottomSheetTitle,
  MobileFilterButton,
  StatusOption,
  MobileLoadingOverlay,
  MobileErrorMessage
} from './BacklogBoard.mobile.styles';
import { Button } from '../../shared-components/Button';
import { createSafeLogger } from '../../logger';

/**
 * Mobile-specific hook for UI state management
 * This contains all the mobile-specific UI state and interactions
 */
function useBacklogMobileUI() {
  // UI state specific to mobile
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPlanningMode, setIsPlanningMode] = useState(false);
  
  // Mobile-specific UI state
  const [isMetricsCollapsed, setIsMetricsCollapsed] = useState(true);
  const [isFilterBottomSheetOpen, setIsFilterBottomSheetOpen] = useState(false);
  const [isMoveBottomSheetOpen, setIsMoveBottomSheetOpen] = useState(false);
  const [taskToMove, setTaskToMove] = useState(null);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback((task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  }, []);

  const closeModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedTask(null);
  }, []);

  // Planning mode handlers
  const togglePlanningMode = useCallback(() => {
    setIsPlanningMode(prev => !prev);
  }, []);

  // Mobile-specific handlers
  const toggleMetrics = useCallback(() => {
    setIsMetricsCollapsed(prev => !prev);
  }, []);

  const openFilterBottomSheet = useCallback(() => {
    setIsFilterBottomSheetOpen(true);
  }, []);

  const closeFilterBottomSheet = useCallback(() => {
    setIsFilterBottomSheetOpen(false);
  }, []);

  const openMoveBottomSheet = useCallback((task) => {
    setTaskToMove(task);
    setIsMoveBottomSheetOpen(true);
  }, []);

  const closeMoveBottomSheet = useCallback(() => {
    setIsMoveBottomSheetOpen(false);
    setTaskToMove(null);
  }, []);

  return {
    // UI state
    selectedTask,
    isCreateModalOpen,
    isEditModalOpen,
    isPlanningMode,
    isMetricsCollapsed,
    isFilterBottomSheetOpen,
    isMoveBottomSheetOpen,
    taskToMove,
    
    // Handlers
    openCreateModal,
    openEditModal,
    closeModals,
    togglePlanningMode,
    toggleMetrics,
    openFilterBottomSheet,
    closeFilterBottomSheet,
    openMoveBottomSheet,
    closeMoveBottomSheet
  };
}

export default function BacklogBoardMobile({ selectedProject, selectedSession }) {
  // Use safe logger to prevent hook call errors
  const logger = createSafeLogger({ component: 'BacklogBoardMobile' });
  
  if (logger.isLevelEnabled && logger.isLevelEnabled('trace')) {
    try {
      logger.trace('BacklogBoardMobile component mounted/rendered', {
        projectName: selectedProject?.displayName,
        sessionId: selectedSession?.id
      });
    } catch (error) {
      console.trace('BacklogBoardMobile component mounted/rendered', {
        projectName: selectedProject?.displayName,
        sessionId: selectedSession?.id
      });
    }
  }
  
  // Shared business logic
  const {
    // State
    tasks,
    columns,
    loading,
    error,
    cliAvailable,
    filters,
    sortBy,
    planText,
    generatingTasks,
    
    // Actions
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    generateTasksFromPlan,
    reviewTasks,
    fetchTasks,
    
    // UI Actions
    updateFilter,
    clearFilters,
    setSortBy,
    setPlanText,
    checkCliAvailability
  } = useBacklogLogic(selectedProject);

  // Mobile-specific UI logic
  const {
    // UI state
    selectedTask,
    isCreateModalOpen,
    isEditModalOpen,
    isPlanningMode,
    isMetricsCollapsed,
    isFilterBottomSheetOpen,
    isMoveBottomSheetOpen,
    taskToMove,
    
    // Handlers
    openCreateModal,
    openEditModal,
    closeModals,
    togglePlanningMode,
    toggleMetrics,
    openFilterBottomSheet,
    closeFilterBottomSheet,
    openMoveBottomSheet,
    closeMoveBottomSheet
  } = useBacklogMobileUI();

  const metrics = calculateTaskMetrics(tasks);
  
  // Detect dark mode from body classes (safe for SSR)
  const isDarkMode = typeof document !== 'undefined' && document.body.classList.contains('dark');
  const theme = getTheme(isDarkMode);

  // Enhanced create task handler that closes modal
  const handleCreateTask = useCallback(async (taskData) => {
    const task = await createTask(taskData);
    closeModals();
    return task;
  }, [createTask, closeModals]);

  // Enhanced update task handler that closes modal
  const handleUpdateTask = useCallback(async (taskId, updates) => {
    const task = await updateTask(taskId, updates);
    closeModals();
    return task;
  }, [updateTask, closeModals]);

  // Enhanced delete task handler that closes modal
  const handleDeleteTask = useCallback(async (taskId) => {
    await deleteTask(taskId);
    closeModals();
  }, [deleteTask, closeModals]);

  // Handle task movement from bottom sheet
  const handleMoveTask = useCallback(async (newStatus) => {
    if (taskToMove) {
      try {
        await moveTask(taskToMove.id, newStatus);
        closeMoveBottomSheet();
      } catch (err) {
        logger.error('Failed to move task on mobile', {
          error: err,
          taskId: taskToMove.id,
          fromStatus: taskToMove.status,
          toStatus: newStatus,
          projectName: selectedProject?.name
        });
      }
    }
  }, [taskToMove, moveTask, closeMoveBottomSheet, logger, selectedProject]);

  // Handle mobile menu
  const handleMenuOpen = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🍔 Hamburger button clicked!');
    // For now, just show an alert to confirm it's working
    alert('Mobile menu clicked! This will open a navigation drawer in the future.');
  }, []);

  if (!selectedProject) {
    return (
      <BacklogErrorBoundary>
        <ThemeProvider theme={theme}>
          <MobileBoardContainer>
            <MobileEmptyColumn>
              <AlertCircle size={48} />
              <div>Please select a project to view the backlog</div>
            </MobileEmptyColumn>
          </MobileBoardContainer>
        </ThemeProvider>
      </BacklogErrorBoundary>
    );
  }

  // Show installer if CLI is not available (null = still checking)
  if (cliAvailable === false) {
    return (
      <BacklogErrorBoundary>
        <ThemeProvider theme={theme}>
          <MobileBoardContainer>
            <BacklogInstaller 
              onInstallComplete={() => {
                checkCliAvailability().then(isAvailable => {
                  if (isAvailable) {
                    fetchTasks();
                  }
                });
              }}
            />
          </MobileBoardContainer>
        </ThemeProvider>
      </BacklogErrorBoundary>
    );
  }
  
  // Show loading while checking CLI availability
  if (cliAvailable === null) {
    return (
      <BacklogErrorBoundary>
        <ThemeProvider theme={theme}>
          <MobileBoardContainer>
            <MobileLoadingOverlay>
              <Loader2 size={32} className="animate-spin" />
              <div style={{ marginTop: '1rem' }}>Checking backlog availability...</div>
            </MobileLoadingOverlay>
          </MobileBoardContainer>
        </ThemeProvider>
      </BacklogErrorBoundary>
    );
  }

  return (
    <BacklogErrorBoundary>
      <ThemeProvider theme={theme}>
        <MobileBoardContainer>
          <MobileHeader>
            <MobileHeaderLeft>
              <HamburgerButton 
                onClick={handleMenuOpen}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={handleMenuOpen}
                aria-label="Open navigation menu"
                type="button"
              >
                <Menu size={20} />
              </HamburgerButton>
              <MobileTitle>Backlog</MobileTitle>
            </MobileHeaderLeft>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MobileFilterButton onClick={openFilterBottomSheet}>
                <Filter size={20} />
              </MobileFilterButton>
              <FloatingActionButton onClick={openCreateModal}>
                <Plus size={24} />
              </FloatingActionButton>
            </div>
          </MobileHeader>

          <MobileMetricsPanel isCollapsed={isMetricsCollapsed}>
            <MetricsToggle onClick={toggleMetrics}>
              <span>Metrics</span>
              {isMetricsCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </MetricsToggle>
            {!isMetricsCollapsed && (
              <MobileMetrics>
                <MobileMetricItem>
                  <MobileMetricValue>{metrics.total}</MobileMetricValue>
                  <MobileMetricLabel>Total Tasks</MobileMetricLabel>
                </MobileMetricItem>
                <MobileMetricItem>
                  <MobileMetricValue color="#3b82f6">
                    {metrics.byStatus[TaskStatus.IN_PROGRESS] || 0}
                  </MobileMetricValue>
                  <MobileMetricLabel>In Progress</MobileMetricLabel>
                </MobileMetricItem>
                <MobileMetricItem>
                  <MobileMetricValue color="#ef4444">{metrics.blocked}</MobileMetricValue>
                  <MobileMetricLabel>Blocked</MobileMetricLabel>
                </MobileMetricItem>
                <MobileMetricItem>
                  <MobileMetricValue color="#10b981">{metrics.velocity}</MobileMetricValue>
                  <MobileMetricLabel>Weekly Velocity</MobileMetricLabel>
                </MobileMetricItem>
              </MobileMetrics>
            )}
          </MobileMetricsPanel>

          <MobileContent>
            {isPlanningMode ? (
              <PlanPanel
                planText={planText}
                setPlanText={setPlanText}
                onGenerateTasks={generateTasksFromPlan}
                onReviewTasks={reviewTasks}
                generatingTasks={generatingTasks}
                selectedProject={selectedProject}
              />
            ) : (
              <MobileColumnsContainer>
                {Object.entries(columns).map(([status, columnTasks]) => (
                  <MobileColumn key={status}>
                    <MobileColumnHeader>
                      <MobileColumnTitle>
                        {TaskStatusLabels[status]}
                      </MobileColumnTitle>
                      <MobileColumnCount>{columnTasks.length}</MobileColumnCount>
                    </MobileColumnHeader>
                    <MobileColumnContent>
                      {columnTasks.length === 0 ? (
                        <MobileEmptyColumn>
                          No tasks in {TaskStatusLabels[status].toLowerCase()}
                        </MobileEmptyColumn>
                      ) : (
                        columnTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => openEditModal(task)}
                            onMove={() => openMoveBottomSheet(task)}
                            isMobile={true}
                          />
                        ))
                      )}
                    </MobileColumnContent>
                  </MobileColumn>
                ))}
              </MobileColumnsContainer>
            )}
          </MobileContent>

          {loading && (
            <MobileLoadingOverlay>
              <Loader2 size={32} className="animate-spin" />
            </MobileLoadingOverlay>
          )}

          {error && (
            <MobileErrorMessage>
              <AlertCircle size={16} />
              {error}
            </MobileErrorMessage>
          )}

          {/* Filter Bottom Sheet */}
          <BottomSheetOverlay isOpen={isFilterBottomSheetOpen} onClick={closeFilterBottomSheet} />
          <BottomSheet isOpen={isFilterBottomSheetOpen}>
            <BottomSheetHandle />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <BottomSheetTitle>Filters</BottomSheetTitle>
              <button
                onClick={closeFilterBottomSheet}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.375rem'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Search input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                marginBottom: '0.5rem',
                color: 'rgb(75 85 99)'
              }}>
                Search Tasks
              </label>
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgb(229 231 235)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Clear filters button */}
            {(filters.search || filters.status.length > 0 || filters.priority.length > 0) && (
              <Button 
                onClick={() => {
                  clearFilters();
                  closeFilterBottomSheet();
                }} 
                variant="ghost" 
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Clear All Filters
              </Button>
            )}
          </BottomSheet>

          {/* Move Task Bottom Sheet */}
          <BottomSheetOverlay isOpen={isMoveBottomSheetOpen} onClick={closeMoveBottomSheet} />
          <BottomSheet isOpen={isMoveBottomSheetOpen}>
            <BottomSheetHandle />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <BottomSheetTitle>Move Task</BottomSheetTitle>
              <button
                onClick={closeMoveBottomSheet}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.375rem'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            {taskToMove && (
              <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'rgb(107 114 128)' }}>
                Moving: <strong>{taskToMove.title}</strong>
              </div>
            )}

            {Object.values(TaskStatus).map(status => (
              <StatusOption
                key={status}
                onClick={() => handleMoveTask(status)}
                disabled={taskToMove?.status === status}
                style={{
                  opacity: taskToMove?.status === status ? 0.5 : 1,
                  cursor: taskToMove?.status === status ? 'not-allowed' : 'pointer'
                }}
              >
                {TaskStatusLabels[status]}
                {taskToMove?.status === status && <span style={{ marginLeft: 'auto' }}>Current</span>}
              </StatusOption>
            ))}
          </BottomSheet>

          {/* Modals */}
          {isCreateModalOpen && (
            <TaskModal
              mode="create"
              onSubmit={handleCreateTask}
              onClose={closeModals}
            />
          )}

          {isEditModalOpen && selectedTask && (
            <TaskModal
              mode="edit"
              task={selectedTask}
              onSubmit={(data) => handleUpdateTask(selectedTask.id, data)}
              onDelete={() => handleDeleteTask(selectedTask.id)}
              onClose={closeModals}
            />
          )}
        </MobileBoardContainer>
      </ThemeProvider>
    </BacklogErrorBoundary>
  );
}