import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { 
  AlertCircle, 
  Download, 
  CheckCircle, 
  Loader2, 
  Terminal,
  Info,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../../../shared-components/Button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
`;

const IconContainer = styled.div`
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: ${props => props.theme.colors.text};
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 2rem 0;
  max-width: 500px;
`;

const InstallationProgress = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 2rem 0;
`;

const ProgressMessage = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ManualInstructions = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  text-align: left;
  max-width: 600px;
`;

const InstructionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CodeBlock = styled.pre`
  background: ${props => props.theme.colors.background};
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-family: ${props => props.theme.fonts.mono};
  font-size: 0.75rem;
  overflow-x: auto;
  margin: 0.5rem 0;
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.error}10;
  color: ${props => props.theme.colors.error};
  border: 1px solid ${props => props.theme.colors.error}30;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.success}10;
  color: ${props => props.theme.colors.success};
  border: 1px solid ${props => props.theme.colors.success}30;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default function BacklogInstaller({ onInstallComplete, onSkip }) {
  const [status, setStatus] = useState('checking'); // checking, not-installed, installing, installed, error
  const [installProgress, setInstallProgress] = useState(null);
  const [error, setError] = useState(null);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    checkBacklogStatus();
  }, []);

  const checkBacklogStatus = async () => {
    try {
      console.log('Checking backlog status...');
      const response = await fetch('/api/backlog/health');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Response body:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Backlog health data:', data);
      
      if (data.backlogAvailable) {
        setStatus('installed');
        if (onInstallComplete) {
          setTimeout(() => onInstallComplete(), 1500);
        }
      } else {
        setStatus('not-installed');
      }
    } catch (error) {
      console.error('Error checking backlog status:', error);
      setStatus('error');
      setError('Failed to check backlog status');
    }
  };

  const installBacklog = async () => {
    setStatus('installing');
    setError(null);
    setInstallProgress({ message: 'Starting installation...', progress: 0 });

    try {
      const response = await fetch('/api/backlog/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Installation request failed');
      }

      // Handle event stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setInstallProgress(data);

              if (data.status === 'completed') {
                setStatus('installed');
                if (onInstallComplete) {
                  setTimeout(() => onInstallComplete(), 1500);
                }
              } else if (data.status === 'failed') {
                setStatus('error');
                setError(data.message);
              }
            } catch (e) {
              console.error('Error parsing progress:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Installation error:', error);
      setStatus('error');
      setError(error.message || 'Installation failed');
    }
  };

  const loadManualInstructions = async () => {
    try {
      const response = await fetch('/api/backlog/install-instructions');
      const data = await response.json();
      
      if (data.success && data.instructions) {
        setShowManualInstructions(true);
      }
    } catch (error) {
      console.error('Error loading instructions:', error);
    }
  };

  if (status === 'checking') {
    return (
      <Container>
        <IconContainer>
          <Loader2 size={48} className="animate-spin" />
        </IconContainer>
        <Title>Checking Backlog Installation</Title>
        <Description>
          Verifying if backlog.md CLI is installed on your system...
        </Description>
      </Container>
    );
  }

  if (status === 'installed') {
    return (
      <Container>
        <IconContainer>
          <CheckCircle size={48} color="#10b981" />
        </IconContainer>
        <Title>Backlog is Ready!</Title>
        <SuccessMessage>
          <CheckCircle size={16} />
          Backlog CLI is installed and ready to use
        </SuccessMessage>
      </Container>
    );
  }

  if (status === 'installing') {
    return (
      <Container>
        <IconContainer>
          <Download size={48} />
        </IconContainer>
        <Title>Installing Backlog</Title>
        <InstallationProgress>
          <ProgressMessage>
            <Loader2 size={14} className="animate-spin" />
            {installProgress?.message || 'Installing...'}
          </ProgressMessage>
          <ProgressBar>
            <ProgressFill progress={installProgress?.progress || 0} />
          </ProgressBar>
        </InstallationProgress>
      </Container>
    );
  }

  return (
    <Container>
      <IconContainer>
        <AlertCircle size={48} />
      </IconContainer>
      <Title>Backlog CLI Not Found</Title>
      <Description>
        The backlog.md CLI tool is required to manage project backlogs. 
        It can be installed automatically or manually using npm.
      </Description>

      {error && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
        </ErrorMessage>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <Button
          onClick={installBacklog}
          variant="primary"
          disabled={status === 'installing'}
        >
          <Download size={14} />
          Install Automatically
        </Button>
        <Button
          onClick={loadManualInstructions}
          variant="secondary"
        >
          <Terminal size={14} />
          Manual Instructions
        </Button>
        {onSkip && (
          <Button
            onClick={onSkip}
            variant="ghost"
          >
            Skip for Now
          </Button>
        )}
      </div>

      <Button
        onClick={checkBacklogStatus}
        variant="ghost"
        size="small"
        style={{ marginTop: '1rem' }}
      >
        <RefreshCw size={14} />
        Check Again
      </Button>

      {showManualInstructions && (
        <ManualInstructions>
          <InstructionTitle>
            <Info size={16} />
            Manual Installation
          </InstructionTitle>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            Install backlog.md globally using npm:
          </p>
          <CodeBlock>npm install -g backlog.md</CodeBlock>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            After installation, click "Check Again" to verify.
          </p>
        </ManualInstructions>
      )}
    </Container>
  );
}