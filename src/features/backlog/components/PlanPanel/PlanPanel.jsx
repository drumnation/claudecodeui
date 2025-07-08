import React, { useState } from 'react';
import styled from '@emotion/styled';
import { 
  Wand2, 
  RefreshCcw, 
  FileText, 
  Loader2,
  Info,
  Sparkles
} from 'lucide-react';
import { Button } from '../../../../shared-components/Button';

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
  background: ${props => props.theme.colors.surface};
`;

const PanelHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const PanelTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PanelDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  overflow: hidden;
`;

const EditorToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CharCount = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const Editor = styled.textarea`
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.875rem;
  line-height: 1.6;
  resize: none;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
`;

const HelpText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const PreviewSection = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
`;

const PreviewTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TaskPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PreviewTask = styled.div`
  padding: 0.5rem 0.75rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.colors.background}ee;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 0.25rem;
  background: ${props => props.theme.colors.background};
  padding: 0.25rem;
  border-radius: 0.375rem;
`;

const ModeButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.isActive ? 'white' : props.theme.colors.text};
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.isActive 
      ? props.theme.colors.primaryDark 
      : props.theme.colors.border};
  }
`;

export default function PlanPanel({
  planText,
  setPlanText,
  onGenerateTasks,
  onReviewTasks,
  generatingTasks,
  selectedProject
}) {
  const [mode, setMode] = useState('plan'); // 'plan' or 'review'
  const [reviewSummary, setReviewSummary] = useState('');
  const [previewTasks, setPreviewTasks] = useState([]);

  const handleGenerateTasks = async () => {
    try {
      const result = await onGenerateTasks();
      if (result && result.generatedTasks) {
        setPreviewTasks(result.generatedTasks);
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
    }
  };

  const handleReviewTasks = async () => {
    try {
      await onReviewTasks(reviewSummary);
      setReviewSummary('');
    } catch (error) {
      console.error('Error reviewing tasks:', error);
    }
  };

  const placeholder = mode === 'plan' 
    ? `Write your planning document here. Describe what you want to build, the features you need, and any technical requirements.

Example:
"I need to build a user authentication system with the following features:
- User registration with email verification
- Login with JWT tokens
- Password reset functionality
- OAuth integration with Google and GitHub
- User profile management

Technical requirements:
- Should use bcrypt for password hashing
- Implement rate limiting on auth endpoints
- Add proper logging and monitoring
- Include comprehensive test coverage"`
    : `Describe the changes in your project and how they might affect existing tasks.

Example:
"We've decided to switch from REST API to GraphQL for better performance. This affects all frontend integration tasks and requires updating the API documentation. Also, the client requested adding real-time notifications, which wasn't in the original scope."`;

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>
          <Sparkles size={20} />
          AI-Powered Planning
        </PanelTitle>
        <PanelDescription>
          {mode === 'plan' 
            ? 'Write your ideas and let AI generate structured backlog tasks'
            : 'Review and update existing tasks based on project changes'}
        </PanelDescription>
      </PanelHeader>

      <EditorContainer>
        <EditorToolbar>
          <ToolbarSection>
            <ModeToggle>
              <ModeButton 
                isActive={mode === 'plan'} 
                onClick={() => setMode('plan')}
              >
                Generate Tasks
              </ModeButton>
              <ModeButton 
                isActive={mode === 'review'} 
                onClick={() => setMode('review')}
              >
                Review Tasks
              </ModeButton>
            </ModeToggle>
          </ToolbarSection>
          <CharCount>
            {mode === 'plan' 
              ? `${planText.length} characters`
              : `${reviewSummary.length} characters`}
          </CharCount>
        </EditorToolbar>
        
        <Editor
          value={mode === 'plan' ? planText : reviewSummary}
          onChange={(e) => mode === 'plan' 
            ? setPlanText(e.target.value) 
            : setReviewSummary(e.target.value)}
          placeholder={placeholder}
        />
      </EditorContainer>

      <ActionBar>
        <HelpText>
          <Info size={14} />
          {mode === 'plan' 
            ? 'AI will analyze your plan and create actionable tasks'
            : 'AI will review existing tasks and suggest updates'}
        </HelpText>
        
        <Button
          onClick={mode === 'plan' ? handleGenerateTasks : handleReviewTasks}
          variant="primary"
          disabled={generatingTasks || (mode === 'plan' ? !planText.trim() : !reviewSummary.trim())}
        >
          {generatingTasks ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {mode === 'plan' ? 'Generating...' : 'Reviewing...'}
            </>
          ) : (
            <>
              {mode === 'plan' ? <Wand2 size={14} /> : <RefreshCcw size={14} />}
              {mode === 'plan' ? 'Generate Tasks' : 'Review & Update'}
            </>
          )}
        </Button>
      </ActionBar>

      {previewTasks.length > 0 && mode === 'plan' && (
        <PreviewSection>
          <PreviewTitle>
            <FileText size={16} />
            Generated Tasks Preview
          </PreviewTitle>
          <TaskPreview>
            {previewTasks.slice(0, 5).map((task, index) => (
              <PreviewTask key={index}>
                <strong>{task.title}</strong>
                {task.priority && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>
                    Priority: {task.priority}
                  </span>
                )}
              </PreviewTask>
            ))}
            {previewTasks.length > 5 && (
              <div style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'center' }}>
                And {previewTasks.length - 5} more tasks...
              </div>
            )}
          </TaskPreview>
        </PreviewSection>
      )}

      {generatingTasks && (
        <LoadingOverlay>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" />
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              {mode === 'plan' ? 'Generating tasks...' : 'Reviewing tasks...'}
            </p>
          </div>
        </LoadingOverlay>
      )}
    </PanelContainer>
  );
}