import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { 
  Kanban, 
  Plus, 
  Filter, 
  RefreshCw, 
  Search,
  AlertCircle,
  Loader2,
  Edit3
} from 'lucide-react';
import { useBacklogBoard } from './BacklogBoard.hook';
import TaskCard from './components/TaskCard/TaskCard';
import TaskModal from './components/TaskModal/TaskModal';
import PlanPanel from './components/PlanPanel/PlanPanel';
import BacklogInstaller from './components/BacklogInstaller/BacklogInstaller';
import { BacklogErrorBoundary } from './components/BacklogErrorBoundary';
import { TaskStatus, TaskStatusLabels } from './constants';
import { calculateTaskMetrics } from './BacklogBoard.logic';
import { getTheme } from './theme';
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
  MetricValue
} from './BacklogBoard.styles';
import { Button } from '../../shared-components/Button';
import { createSafeLogger } from '../../logger';

export default function BacklogBoard({ selectedProject, selectedSession }) {
  // Use safe logger to prevent hook call errors
  const logger = createSafeLogger({ component: 'BacklogBoard' });
  
  if (logger.isLevelEnabled && logger.isLevelEnabled('trace')) {
    try {
      logger.trace('BacklogBoard component mounted/rendered', {
        projectName: selectedProject?.displayName,
        sessionId: selectedSession?.id
      });
    } catch (error) {
      console.trace('BacklogBoard component mounted/rendered', {
        projectName: selectedProject?.displayName,
        sessionId: selectedSession?.id
      });
    }
  }
  
  const {
    // State
    tasks,
    columns,
    loading,
    error,
    cliAvailable,
    selectedTask,
    isCreateModalOpen,
    isEditModalOpen,
    isPlanningMode,
    filters,
    sortBy,
    draggedTask,
    dragOverColumn,
    planText,
    generatingTasks,
    
    // Actions
    createTask,
    updateTask,
    deleteTask,
    generateTasksFromPlan,
    reviewTasks,
    fetchTasks,
    
    // UI Actions
    openCreateModal,
    openEditModal,
    closeModals,
    togglePlanningMode,
    updateFilter,
    clearFilters,
    setSortBy,
    setPlanText,
    checkCliAvailability,
    
    // Drag and drop handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  } = useBacklogBoard(selectedProject);

  const metrics = calculateTaskMetrics(tasks);
  
  // Detect dark mode from body classes (safe for SSR)
  const isDarkMode = typeof document !== 'undefined' && document.body.classList.contains('dark');
  const theme = getTheme(isDarkMode);

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
                checkCliAvailability().then(isAvailable => {
                  if (isAvailable) {
                    fetchTasks();
                  }
                });
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
              <div style={{ marginTop: '1rem' }}>Checking backlog availability...</div>
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
                <Edit3 size={14} />
                {isPlanningMode ? 'Exit Planning' : 'Planning Mode'}
              </Button>
              <Button onClick={openCreateModal} variant="primary" size="small">
                <Plus size={14} />
                Add Task
              </Button>
              <Button onClick={fetchTasks} variant="ghost" size="small">
                <RefreshCw size={14} />
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
              onChange={(e) => updateFilter('search', e.target.value)}
            />
            <FilterButton
              isActive={filters.status.length > 0}
              onClick={() => {/* TODO: Implement status filter dropdown */}}
            >
              <Filter size={14} />
              Status {filters.status.length > 0 && `(${filters.status.length})`}
            </FilterButton>
            <FilterButton
              isActive={filters.priority.length > 0}
              onClick={() => {/* TODO: Implement priority filter dropdown */}}
            >
              <Filter size={14} />
              Priority {filters.priority.length > 0 && `(${filters.priority.length})`}
            </FilterButton>
            {(filters.search || filters.status.length > 0 || filters.priority.length > 0) && (
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
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <ColumnHeader>
                      <ColumnTitle>
                        {TaskStatusLabels[status]}
                        <ColumnCount>{columnTasks.length}</ColumnCount>
                      </ColumnTitle>
                    </ColumnHeader>
                    <ColumnContent>
                      {columnTasks.length === 0 ? (
                        <EmptyColumn>
                          Drop tasks here
                        </EmptyColumn>
                      ) : (
                        columnTasks.map(task => (
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
              onSubmit={createTask}
              onClose={closeModals}
            />
          )}

          {isEditModalOpen && selectedTask && (
            <TaskModal
              mode="edit"
              task={selectedTask}
              onSubmit={(data) => updateTask(selectedTask.id, data)}
              onDelete={() => deleteTask(selectedTask.id)}
              onClose={closeModals}
            />
          )}
        </BoardContainer>
      </ThemeProvider>
    </BacklogErrorBoundary>
  );
}