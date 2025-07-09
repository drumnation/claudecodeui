import React, {useState, useEffect} from 'react';
import {
  Plus,
  List,
  MoreVertical,
  FileText,
  Clock,
  CheckCircle,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {Button} from '@/shared-components/Button/Button';
import {PlannerDetail} from './PlannerDetail';
import * as S from './PlannerHistory.styles';

export const PlannerHistory = ({
  selectedProject,
  onNewTask,
  onSelectPlan,
  isOpen = false,
}: any) => {
  const [planHistory, setPlanHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailPlanId, setDetailPlanId] = useState(null);

  useEffect(() => {
    if (isOpen && selectedProject) {
      loadPlanHistory();
    }
  }, [isOpen, selectedProject]);

  const loadPlanHistory = async () => {
    if (!selectedProject?.fullPath) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/planner/history?projectPath=${encodeURIComponent(selectedProject.fullPath)}`,
      );

      if (!response.ok) {
        throw new Error('Failed to load planning history');
      }

      const data = await response.json();
      setPlanHistory(data.items || []);
    } catch (err) {
      console.error('Failed to load planning history:', err);
      setError('Failed to load planning history');
      setPlanHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (planId: any, event: any) => {
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this planning session?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/planner/session/${planId}?projectPath=${encodeURIComponent(selectedProject.fullPath)}`,
        {method: 'DELETE'},
      );

      if (!response.ok) {
        throw new Error('Failed to delete planning session');
      }

      // Reload the list
      await loadPlanHistory();
    } catch (err) {
      console.error('Failed to delete planning session:', err);
      alert('Failed to delete planning session');
    }
  };

  const formatTime = (timestamp: any) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} min ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handlePlanClick = (plan: any) => {
    setSelectedPlanId(plan.id);
    setDetailPlanId(plan.id);
    setShowDetail(true);
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  const handleExecutePlan = (plan: any) => {
    if (!plan.finalPlan || !selectedProject) return;

    // Navigate to a new Claude session with the plan as the initial message
    const command = `Please review this feature plan and help me implement it:\n\n${plan.finalPlan}`;

    // Create a new session URL with the command
    const sessionUrl = `/chat?project=${encodeURIComponent(selectedProject.name)}&command=${encodeURIComponent(command)}`;

    // Open in the current window
    window.location.href = sessionUrl;
  };

  if (!isOpen) return null;

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <List className="w-4 h-4" />
          <S.Title>Task List</S.Title>
        </S.HeaderLeft>
        <S.HeaderActions>
          <Button
            size="sm"
            onClick={onNewTask}
            className="h-8 px-3 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <List className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </S.HeaderActions>
      </S.Header>

      <S.TaskList>
        {isLoading ? (
          <S.LoadingState>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading planning history...
          </S.LoadingState>
        ) : error ? (
          <S.EmptyState>
            <S.EmptyTitle>Error loading history</S.EmptyTitle>
            <S.EmptyDescription>{error}</S.EmptyDescription>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPlanHistory}
              className="mt-2"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </S.EmptyState>
        ) : planHistory.length === 0 ? (
          <S.EmptyState>
            <FileText className="w-12 h-12 text-muted-foreground mb-2" />
            <S.EmptyTitle>No planning sessions yet</S.EmptyTitle>
            <S.EmptyDescription>
              Click the + button to create your first task plan
            </S.EmptyDescription>
          </S.EmptyState>
        ) : (
          planHistory.map((plan) => (
            <S.TaskItem
              key={plan.id}
              selected={selectedPlanId === plan.id}
              onClick={() => handlePlanClick(plan)}
            >
              <S.TaskHeader>
                type 'never'.
                <S.TaskTitle>{plan.title}</S.TaskTitle>
                <S.TaskActions>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanClick(plan);
                    }}
                    className="h-7 w-7 p-0"
                    title="View details"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDeletePlan(plan.id, e)}
                    className="h-7 w-7 p-0 hover:text-destructive"
                    title="Delete plan"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </S.TaskActions>
              </S.TaskHeader>
              <S.TaskMeta>
                on type 'never'.
                <S.StatusBadge status={plan.status}>
                  {/* @ts-expect-error TS(2339): Property 'status' does not exist on type 'never'. */}
                  {plan.status === 'completed' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <FileText className="w-3 h-3" />
                  )}
                  {/* @ts-expect-error TS(2339): Property 'status' does not exist on type 'never'. */}
                  {plan.status === 'completed' ? 'Completed' : 'Draft'}
                </S.StatusBadge>
                type 'never'.
                <S.ModeBadge mode={plan.mode}>
                  on type 'never'.
                  {plan.mode === 'multi' ? 'Multi Agent' : 'Single Agent'}
                </S.ModeBadge>
              </S.TaskMeta>
              <S.TaskDescription>
                {/* @ts-expect-error TS(2339): Property 'description' does not exist on type 'never'. */}
                {plan.description.length > 150
                  ? // @ts-expect-error TS(2339): Property 'description' does not exist on type 'never'.
                    `${plan.description.substring(0, 150)}...`
                  : // @ts-expect-error TS(2339): Property 'description' does not exist on type 'never'.
                    plan.description}
              </S.TaskDescription>
              <S.TaskFooter>
                <S.TaskTime>
                  <Clock className="w-3 h-3" />
                  {/* @ts-expect-error TS(2339): Property 'timestamp' does not exist on type 'never'. */}
                  {formatTime(plan.timestamp)}
                </S.TaskTime>
                on type 'never'.
                {plan.agents && plan.agents.length > 0 && (
                  <S.AgentList>
                    exist on type 'never'.
                    {plan.agents.join(' → ')}
                  </S.AgentList>
                )}
              </S.TaskFooter>
            </S.TaskItem>
          ))
        )}
      </S.TaskList>

      {showDetail && detailPlanId && (
        <PlannerDetail
          planId={detailPlanId}
          projectPath={selectedProject.fullPath}
          onClose={() => {
            setShowDetail(false);
            setDetailPlanId(null);
          }}
          onExecute={handleExecutePlan}
        />
      )}
    </S.Container>
  );
};
