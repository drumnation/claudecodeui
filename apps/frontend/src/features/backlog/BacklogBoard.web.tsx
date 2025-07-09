import React, {useState, useCallback} from 'react';
import {ThemeProvider} from '@emotion/react';
import {
  Kanban,
  Plus,
  Filter,
  RefreshCw as _RefreshCw,
  Search as _Search,
  AlertCircle,
  Loader2,
  Edit3 as _Edit3,
} from 'lucide-react';
import {useBacklogLogic} from './BacklogBoard.logic';
import TaskCard from './components/TaskCard/TaskCard';
import TaskModal from './components/TaskModal/TaskModal';
import PlanPanel from './components/PlanPanel/PlanPanel';
import BacklogInstaller from './components/BacklogInstaller/BacklogInstaller';
import {BacklogErrorBoundary} from './components/BacklogErrorBoundary';
import {TaskStatus, TaskStatusLabels} from './constants';
import {calculateTaskMetrics} from './BacklogBoard.logic';
import {getTheme} from './theme';
import {
  BoardContainer,
  BoardHeader,
  BoardTitle,
  BoardControls,
  BoardContent,
  ColumnsContainer,
  Column,
  ColumnHeader,
  ColumnTitle,
  ColumnCount,
  ColumnContent,
  EmptyColumn,
  FilterBar,
  SearchInput,
  FilterButton,
  LoadingOverlay,
  ErrorMessage,
  MetricsBar,
  MetricItem,
  MetricLabel,
  MetricValue,
} from './BacklogBoard.styles';
import {Button} from '../../shared-components/Button';
import {createSafeLogger} from '../../logger';

/**
 * Web-specific hook for drag-and-drop functionality
 * This contains all the web-specific UI state that mobile doesn't need
 */
function useBacklogWebUI() {
  // UI state specific to web (modals, drag-and-drop)
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPlanningMode, setIsPlanningMode] = useState(false);

  // Drag and drop state (web-specific)
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Drag and drop handlers
  const handleDragStart = useCallback((task: any) => {
    setDraggedTask(task);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e: any, status: any) => {
    e.preventDefault();
    setDragOverColumn(status);
  }, []);

  const handleDrop = useCallback(
    async (
      e: any,
      status: any,
      moveTask: any,
      selectedProject: any,
      logger: any,
    ) => {
      e.preventDefault();

      if (draggedTask && draggedTask.status !== status) {
        try {
          await moveTask(draggedTask.id, status);
        } catch (err) {
          logger.error('Failed to move task via drag and drop', {
            error: err,
            taskId: draggedTask.id,
            fromStatus: draggedTask.status,
            toStatus: status,
            projectName: selectedProject?.name,
          });
        }
      }

      setDraggedTask(null);
      setDragOverColumn(null);
    },
    [draggedTask],
  );

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback((task: any) => {
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
    setIsPlanningMode((prev) => !prev);
  }, []);

  return {
    // UI state
    selectedTask,
    isCreateModalOpen,
    isEditModalOpen,
    isPlanningMode,
    draggedTask,
    dragOverColumn,

    // Drag handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,

    // Modal handlers
    openCreateModal,
    openEditModal,
    closeModals,
    togglePlanningMode,
  };
}

export default function BacklogBoardWeb({
  selectedProject,
  selectedSession,
}: any) {
  // Use safe logger to prevent hook call errors
  const logger = createSafeLogger({component: 'BacklogBoardWeb'});

  if (logger.isLevelEnabled && logger.isLevelEnabled('trace')) {
    try {
      logger.trace('BacklogBoardWeb component mounted/rendered', {
        projectName: selectedProject?.displayName,
        sessionId: selectedSession?.id,
      });
    } catch (_error) {
      console.trace('BacklogBoardWeb component mounted/rendered', {
        projectName: selectedProject?.displayName,
        sessionId: selectedSession?.id,
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
    sortBy: _sortBy,
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
    setSortBy: _setSortBy,
    setPlanText,
    checkCliAvailability,
  } = useBacklogLogic(selectedProject);

  // Web-specific UI logic
  const {
    // UI state
    selectedTask,
    isCreateModalOpen,
    isEditModalOpen,
    isPlanningMode,
    draggedTask,
    dragOverColumn,

    // Handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    openCreateModal,
    openEditModal,
    closeModals,
    togglePlanningMode,
  } = useBacklogWebUI();

  const metrics = calculateTaskMetrics(tasks);

  // Detect dark mode from body classes (safe for SSR)
  const isDarkMode =
    typeof document !== 'undefined' && document.body.classList.contains('dark');
  const theme = getTheme(isDarkMode);

  // Enhanced create task handler that closes modal
  const handleCreateTask = useCallback(
    async (taskData: any) => {
      const task = await createTask(taskData);
      closeModals();
      return task;
    },
    [createTask, closeModals],
  );

  // Enhanced update task handler that closes modal
  const handleUpdateTask = useCallback(
    async (taskId: any, updates: any) => {
      const task = await updateTask(taskId, updates);
      closeModals();
      return task;
    },
    [updateTask, closeModals],
  );

  // Enhanced delete task handler that closes modal
  const handleDeleteTask = useCallback(
    async (taskId: any) => {
      await deleteTask(taskId);
      closeModals();
    },
    [deleteTask, closeModals],
  );

  if (!selectedProject) {
    return (
      <BacklogErrorBoundary>
        <ThemeProvider theme={theme}>
          <BoardContainer>
            <EmptyColumn>
              <AlertCircle size={48} />
              <div>Please select a project to view the backlog</div>
            </EmptyColumn>
          </BoardContainer>
        </ThemeProvider>
      </BacklogErrorBoundary>
    );
  }

  // Show installer if CLI is not available (null = still checking)
  if (cliAvailable === false) {
    return (
      <BacklogErrorBoundary>
        <ThemeProvider theme={theme}>
          <BoardContainer>
            <BacklogInstaller
              onInstallComplete={() => {
                checkCliAvailability();
                fetchTasks();
              }}
            />
          </BoardContainer>
        </ThemeProvider>
      </BacklogErrorBoundary>
    );
  }

  // Show loading while checking CLI availability
  if (cliAvailable === null) {
    return (
      <BacklogErrorBoundary>
        <ThemeProvider theme={theme}>
          <BoardContainer>
            <LoadingOverlay>
              <Loader2 size={32} className="animate-spin" />
              <div style={{marginTop: '1rem'}}>
                Checking backlog availability...
              </div>
            </LoadingOverlay>
          </BoardContainer>
        </ThemeProvider>
      </BacklogErrorBoundary>
    );
  }

  return (
    <BacklogErrorBoundary>
      <ThemeProvider theme={theme}>
        <BoardContainer>
          <BoardHeader>
            <BoardTitle>
              <Kanban size={20} />
              Backlog Board
            </BoardTitle>
            <BoardControls>
              <Button
                onClick={togglePlanningMode}
                variant={isPlanningMode ? 'primary' : 'secondary'}
                size="small"
              >
                <_Edit3 size={14} />
                {isPlanningMode ? 'Exit Planning' : 'Planning Mode'}
              </Button>
              <Button onClick={openCreateModal} variant="primary" size="small">
                <Plus size={14} />
                Add Task
              </Button>
              <Button onClick={fetchTasks} variant="ghost" size="small">
                <_RefreshCw size={14} />
              </Button>
            </BoardControls>
          </BoardHeader>

          <MetricsBar>
            <MetricItem>
              <MetricLabel>Total Tasks:</MetricLabel>
              <MetricValue>{metrics.total}</MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>In Progress:</MetricLabel>
              <MetricValue color="#3b82f6">
                {metrics.byStatus[TaskStatus.IN_PROGRESS] || 0}
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Blocked:</MetricLabel>
              <MetricValue color="#ef4444">{metrics.blocked}</MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Weekly Velocity:</MetricLabel>
              <MetricValue color="#10b981">{metrics.velocity}</MetricValue>
            </MetricItem>
            {metrics.overdue > 0 && (
              <MetricItem>
                <MetricLabel>Overdue:</MetricLabel>
                <MetricValue color="#f59e0b">{metrics.overdue}</MetricValue>
              </MetricItem>
            )}
          </MetricsBar>

          <FilterBar>
            <SearchInput
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e: any) => updateFilter('search', e.target.value)}
            />
            <FilterButton
              isActive={filters.status.length > 0}
              onClick={() => {
                /* TODO: Implement status filter dropdown */
              }}
            >
              <Filter size={14} />
              Status {filters.status.length > 0 && `(${filters.status.length})`}
            </FilterButton>
            <FilterButton
              isActive={filters.priority.length > 0}
              onClick={() => {
                /* TODO: Implement priority filter dropdown */
              }}
            >
              <Filter size={14} />
              Priority{' '}
              {filters.priority.length > 0 && `(${filters.priority.length})`}
            </FilterButton>
            {(filters.search ||
              filters.status.length > 0 ||
              filters.priority.length > 0) && (
              <Button onClick={clearFilters} variant="ghost" size="small">
                Clear Filters
              </Button>
            )}
          </FilterBar>

          <BoardContent>
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
              <ColumnsContainer>
                {Object.entries(columns).map(([status, columnTasks]) => (
                  <Column
                    key={status}
                    isDragOver={dragOverColumn === status}
                    onDragOver={(e: any) => handleDragOver(e, status)}
                    onDrop={(e: any) =>
                      handleDrop(e, status, moveTask, selectedProject, logger)
                    }
                  >
                    <ColumnHeader>
                      <ColumnTitle>
                        {TaskStatusLabels[status]}
                        <ColumnCount>{columnTasks.length}</ColumnCount>
                      </ColumnTitle>
                    </ColumnHeader>
                    <ColumnContent>
                      {columnTasks.length === 0 ? (
                        <EmptyColumn>Drop tasks here</EmptyColumn>
                      ) : (
                        columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => openEditModal(task)}
                            onDragStart={() => handleDragStart(task)}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedTask?.id === task.id}
                          />
                        ))
                      )}
                    </ColumnContent>
                  </Column>
                ))}
              </ColumnsContainer>
            )}
          </BoardContent>

          {loading && (
            <LoadingOverlay>
              <Loader2 size={32} className="animate-spin" />
            </LoadingOverlay>
          )}

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

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
              onSubmit={(data: any) => handleUpdateTask(selectedTask.id, data)}
              onDelete={() => handleDeleteTask(selectedTask.id)}
              onClose={closeModals}
            />
          )}
        </BoardContainer>
      </ThemeProvider>
    </BacklogErrorBoundary>
  );
}
