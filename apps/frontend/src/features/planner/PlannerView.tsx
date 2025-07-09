import React, {useState} from 'react';
import {Brain, Settings} from 'lucide-react';
import {PlannerModal} from './PlannerModal';
import {PlannerHistory} from './PlannerHistory';
import {Button} from '@/shared-components/Button/Button';
import * as S from './PlannerView.styles';

export const PlannerView = ({selectedProject}: any) => {
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleNewTask = () => {
    setShowModal(true);
    setSelectedPlan(null);
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    // Could open a detail view or allow editing/re-running
  };

  const handlePlanComplete = (result: any) => {
    setShowModal(false);
    setShowHistory(true);
    // Refresh history to show new plan
  };

  if (!selectedProject) {
    return (
      <S.Container>
        <S.EmptyState>
          <Brain className="w-16 h-16 text-muted-foreground mb-4" />
          <S.EmptyTitle>Select a Project</S.EmptyTitle>
          <S.EmptyDescription>
            Choose a project from the sidebar to start planning features
          </S.EmptyDescription>
        </S.EmptyState>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <S.HeaderContent>
          <S.HeaderIcon>
            <Brain className="w-5 h-5" />
          </S.HeaderIcon>
          <S.HeaderTitle>TRAYCER</S.HeaderTitle>
        </S.HeaderContent>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <Settings className="w-4 h-4" />
        </Button>
      </S.Header>

      <S.TabBar>
        <S.Tab active={!selectedPlan}>Task</S.Tab>
        <S.Tab active={selectedPlan}>Review</S.Tab>
      </S.TabBar>

      <S.Content>
        {!showModal && !selectedPlan ? (
          <S.WelcomeScreen>
            <S.WelcomeIcon>
              <Brain className="w-24 h-24 text-muted-foreground/50" />
            </S.WelcomeIcon>
            <S.WelcomeTitle>What can I help you build today?</S.WelcomeTitle>
            <S.WelcomeDescription>
              Create new code, add features, or fix issues—let's make it happen.
            </S.WelcomeDescription>
            <S.NewTaskSection>
              <S.NewTaskLabel>Create new task chain</S.NewTaskLabel>
              <S.NewTaskActions>
                <Button
                  onClick={handleNewTask}
                  className="h-10 w-10 rounded-lg bg-muted hover:bg-muted/80"
                >
                  <Plus className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowHistory(!showHistory)}
                  className="h-10 w-10 rounded-lg"
                >
                  <List className="w-5 h-5" />
                </Button>
              </S.NewTaskActions>
            </S.NewTaskSection>
          </S.WelcomeScreen>
        ) : (
          <PlannerHistory
            selectedProject={selectedProject}
            onNewTask={handleNewTask}
            onSelectPlan={handleSelectPlan}
            isOpen={showHistory}
          />
        )}
      </S.Content>

      {showModal && (
        <PlannerModal
          selectedProject={selectedProject}
          onClose={() => setShowModal(false)}
          onPlanComplete={handlePlanComplete}
        />
      )}
    </S.Container>
  );
};

// Import the required icons that were missing
import {Plus, List} from 'lucide-react';
