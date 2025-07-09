import React, {useState, useEffect} from 'react';
import {
  X,
  FileText,
  Clock,
  CheckCircle,
  Brain,
  Zap,
  Terminal,
  Download,
  Clipboard,
} from 'lucide-react';
import {Button} from '@/shared-components/Button/Button';
import * as S from './PlannerDetail.styles';

interface PlannerDetailProps {
  planId: string;
  projectPath: string;
  onClose: () => void;
  onExecute?: (plan: any) => void;
}

export const PlannerDetail: React.FC<PlannerDetailProps> = ({
  planId,
  projectPath,
  onClose,
  onExecute,
}) => {
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPlanDetails();
  }, [planId, projectPath]);

  const loadPlanDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/planner/session/${planId}?projectPath=${encodeURIComponent(projectPath)}`,
      );

      if (!response.ok) {
        throw new Error('Failed to load plan details');
      }

      const data = await response.json();
      setPlan(data);
    } catch (err) {
      console.error('Failed to load plan details:', err);
      setError('Failed to load plan details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPlan = () => {
    if (plan?.finalPlan) {
      navigator.clipboard.writeText(plan.finalPlan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPlan = () => {
    if (plan?.finalPlan) {
      const blob = new Blob([plan.finalPlan], {type: 'text/markdown'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan.title.replace(/\s+/g, '-').toLowerCase()}-plan.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'ARCH':
        return Brain;
      case 'DIFF':
        return FileText;
      case 'DEPS':
        return Zap;
      default:
        return FileText;
    }
  };

  return (
    <S.Overlay onClick={onClose}>
      <S.Modal onClick={(e) => e.stopPropagation()}>
        <S.Header>
          <S.HeaderLeft>
            <FileText className="w-5 h-5 text-primary" />
            <S.Title>{plan?.title || 'Plan Details'}</S.Title>
          </S.HeaderLeft>
          <S.CloseButton onClick={onClose}>
            <X className="w-4 h-4" />
          </S.CloseButton>
        </S.Header>

        {isLoading ? (
          <S.LoadingContainer>
            <S.LoadingSpinner />
            <span>Loading plan details...</span>
          </S.LoadingContainer>
        ) : error ? (
          <S.ErrorContainer>
            <S.ErrorMessage>{error}</S.ErrorMessage>
            <Button onClick={loadPlanDetails} variant="outline" size="sm">
              Retry
            </Button>
          </S.ErrorContainer>
        ) : plan ? (
          <>
            <S.MetaSection>
              <S.MetaItem>
                <Clock className="w-4 h-4" />
                <span>
                  Created: {new Date(plan.timestamp).toLocaleString()}
                </span>
              </S.MetaItem>
              <S.MetaItem>
                <Terminal className="w-4 h-4" />
                <span>Duration: {formatDuration(plan.duration || 0)}</span>
              </S.MetaItem>
              <S.MetaItem>
                {plan.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span>Status: {plan.status}</span>
              </S.MetaItem>
            </S.MetaSection>

            <S.DescriptionSection>
              <S.SectionTitle>Feature Description</S.SectionTitle>
              <S.Description>{plan.description}</S.Description>
            </S.DescriptionSection>

            {plan.agentResults && plan.agentResults.length > 0 && (
              <S.AgentsSection>
                <S.SectionTitle>Agent Results</S.SectionTitle>
                <S.AgentsList>
                  {plan.agentResults.map((result: any) => {
                    const Icon = getAgentIcon(result.agentType);
                    return (
                      <S.AgentItem
                        key={result.agentType}
                        status={result.status}
                      >
                        <S.AgentHeader>
                          <S.AgentInfo>
                            <Icon className="w-4 h-4" />
                            <S.AgentName>{result.agentType}</S.AgentName>
                          </S.AgentInfo>
                          <S.AgentDuration>
                            {formatDuration(result.duration || 0)}
                          </S.AgentDuration>
                        </S.AgentHeader>
                        {result.error && (
                          <S.AgentError>{result.error}</S.AgentError>
                        )}
                      </S.AgentItem>
                    );
                  })}
                </S.AgentsList>
              </S.AgentsSection>
            )}

            {plan.finalPlan && (
              <S.PlanSection>
                <S.PlanHeader>
                  <S.SectionTitle>Generated Plan</S.SectionTitle>
                  <S.PlanActions>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyPlan}
                      className="h-8 px-2"
                    >
                      <Clipboard className="w-4 h-4 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDownloadPlan}
                      className="h-8 px-2"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </S.PlanActions>
                </S.PlanHeader>
                <S.PlanContent>
                  <pre>{plan.finalPlan}</pre>
                </S.PlanContent>
              </S.PlanSection>
            )}

            <S.Actions>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {plan.finalPlan && onExecute && (
                <Button onClick={() => onExecute(plan)}>
                  Execute in Claude
                </Button>
              )}
            </S.Actions>
          </>
        ) : null}
      </S.Modal>
    </S.Overlay>
  );
};
