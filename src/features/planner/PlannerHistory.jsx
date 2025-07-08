import React, { useState, useEffect } from 'react';
import { Plus, List, MoreVertical, FileText, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/shared-components/Button/Button';
import * as S from './PlannerHistory.styles';

export const PlannerHistory = ({ 
  selectedProject,
  onNewTask,
  onSelectPlan,
  isOpen = false
}) => {
  const [planHistory, setPlanHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Mock data for now - will integrate with backend later
  useEffect(() => {
    if (isOpen && selectedProject) {
      loadPlanHistory();
    }
  }, [isOpen, selectedProject]);

  const loadPlanHistory = async () => {
    setIsLoading(true);
    // TODO: Load from backend
    setTimeout(() => {
      setPlanHistory([
        {
          id: 'plan-1',
          title: 'Replicating Traycer\'s Multi-Agent Planner',
          description: 'How might I develop a feature similar to traycer that uses claude code to think, with multiple agents, or single agent, to plan...',
          timestamp: new Date().toISOString(),
          status: 'completed',
          mode: 'multi',
          agents: ['ARCH', 'DIFF', 'DEPS']
        },
        {
          id: 'plan-2',
          title: 'Project Management Suite',
          description: 'How might I add backlog.md into this app? A project management tab. It needs to handle the entire lifecycle. Spin up a new...',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          mode: 'multi',
          agents: ['ARCH', 'DIFF', 'DEPS']
        },
        {
          id: 'plan-3',
          title: 'Worktree Project Creation',
          description: 'Could we make a feature where, maybe in the project item 3 dot menu, spawn a worktree based on the project you clicked...',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed',
          mode: 'multi',
          agents: ['ARCH', 'DIFF']
        }
      ]);
      setIsLoading(false);
    }, 500);
  };

  const formatTime = (timestamp) => {
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

  const handlePlanClick = (plan) => {
    setSelectedPlanId(plan.id);
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
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
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </S.HeaderActions>
      </S.Header>

      <S.TaskList>
        {isLoading ? (
          <S.LoadingState>Loading planning history...</S.LoadingState>
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
                <S.TaskTitle>{plan.title}</S.TaskTitle>
                <S.TaskMeta>
                  <S.StatusBadge status={plan.status}>
                    <FileText className="w-3 h-3" />
                    Plan Generated
                  </S.StatusBadge>
                  <S.ModeBadge mode={plan.mode}>
                    {plan.mode === 'multi' ? 'Multi Agent' : 'Single Agent'}
                  </S.ModeBadge>
                </S.TaskMeta>
              </S.TaskHeader>
              <S.TaskDescription>
                {plan.description}
              </S.TaskDescription>
              <S.TaskFooter>
                <S.TaskTime>
                  <Clock className="w-3 h-3" />
                  {formatTime(plan.timestamp)}
                </S.TaskTime>
                {plan.agents && (
                  <S.AgentList>
                    {plan.agents.join(' → ')}
                  </S.AgentList>
                )}
              </S.TaskFooter>
            </S.TaskItem>
          ))
        )}
      </S.TaskList>
    </S.Container>
  );
};