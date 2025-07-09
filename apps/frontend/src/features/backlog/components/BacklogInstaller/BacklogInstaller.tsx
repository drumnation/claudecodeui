import React, {useState, useEffect} from 'react';
import styled from '@emotion/styled';
import {
  AlertCircle,
  Download,
  CheckCircle,
  Loader2,
  Terminal,
  Info,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import {Button} from '../../../../shared-components/Button';
import {
  getBacklogHealthUrl,
  getBacklogInstallUrl,
  getBacklogInstallInstructionsUrl,
  getBacklogDebugUrl,
  getBacklogEnvironmentUrl,
} from '../../../../config/api';
import type {
  BacklogInstallerProps,
  InstallationStatus,
  InstallProgress,
  DetailedError,
  DebugInfo,
  EnvironmentInfo,
  BacklogHealthResponse,
} from './BacklogInstaller.types';

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
  color: 'var(--color-text-secondary)';
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: 'var(--color-text)';
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: 'var(--color-text-secondary)';
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
  color: 'var(--color-text-secondary)';
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: var(--color-primary);
  width: ${(props: {progress: number}) => props.progress}%;
  transition: width 0.3s ease;
`;

const ManualInstructions = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: ${(props) => 'var(--color-surface)'};
  border: 1px solid ${(props) => 'var(--color-border)'};
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
  background: ${(props) => 'var(--color-background)'};
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-family: ${(props) => props.theme.fonts.mono};
  font-size: 0.75rem;
  overflow-x: auto;
  margin: 0.5rem 0;
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${(props) => 'var(--color-error)'}10;
  color: ${(props) => 'var(--color-error)'};
  border: 1px solid ${(props) => 'var(--color-error)'}30;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${(props) => 'var(--color-success)'}10;
  color: ${(props) => 'var(--color-success)'};
  border: 1px solid ${(props) => 'var(--color-success)'}30;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DiagnosticInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${(props) => 'var(--color-surface)'};
  border: 1px solid ${(props) => 'var(--color-border)'};
  border-radius: 0.375rem;
  font-size: 0.75rem;
  text-align: left;
  max-width: 600px;
`;

const DiagnosticItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DiagnosticLabel = styled.span`
  font-weight: 600;
  color: 'var(--color-text)';
  min-width: 100px;
`;

const DiagnosticValue = styled.span`
  color: 'var(--color-text-secondary)';
  font-family: ${(props) => props.theme.fonts.mono};
  word-break: break-word;
`;

export default function BacklogInstaller({
  onInstallComplete,
  onSkip,
}: BacklogInstallerProps) {
  const [status, setStatus] = useState<InstallationStatus>('checking');
  const [installProgress, setInstallProgress] =
    useState<InstallProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [detailedError, setDetailedError] = useState<DetailedError>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [environmentInfo, setEnvironmentInfo] =
    useState<EnvironmentInfo | null>(null);

  // Get platform information
  const platform = navigator.platform.toLowerCase();
  const isWindows = platform.includes('win');
  const isMac = platform.includes('mac');
  const isLinux = platform.includes('linux');

  useEffect(() => {
    checkBacklogStatus();
  }, []);

  const checkBacklogStatus = async () => {
    try {
      console.log('Checking backlog status...');
      const response = await fetch(getBacklogHealthUrl());
      console.log('Response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('Response body:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BacklogHealthResponse = await response.json();
      console.log('Backlog health data:', data);

      if (data.backlogAvailable) {
        setStatus('installed');
        if (onInstallComplete) {
          setTimeout(() => onInstallComplete(), 1500);
        }
      } else {
        setStatus('not-installed');

        // Store debug info if available
        if (data.debug) {
          setDebugInfo(data.debug);
        }

        // Analyze error type
        const errorMessage = typeof data.error === 'string' ? data.error : (data.error && typeof data.error === 'object' && 'message' in data.error ? data.error.message : '') || '';
        if (errorMessage.includes('PATH') || (data.debug && !data.debug.path)) {
          setDetailedError('path-issue');
        } else if (errorMessage.includes('npm')) {
          setDetailedError('npm-issue');
        } else if (errorMessage.includes('not found')) {
          setDetailedError('not-installed');
        }
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
    setInstallProgress({message: 'Starting installation...', progress: 0});

    try {
      const response = await fetch(getBacklogInstallUrl(), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      });

      if (!response.ok) {
        throw new Error('Installation request failed');
      }

      // Handle event stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const {done, value} = await reader.read();
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
      setError((error as Error).message || 'Installation failed');
    }
  };

  const loadManualInstructions = async () => {
    try {
      const response = await fetch(getBacklogInstallInstructionsUrl());
      const data = await response.json();

      if (data.success && data.instructions) {
        setShowManualInstructions(true);
      }
    } catch (error) {
      console.error('Error loading instructions:', error);
    }
  };

  const loadDebugInfo = async () => {
    try {
      const debugResponse = await fetch(getBacklogDebugUrl());
      const debugData = await debugResponse.json();

      if (debugData.success) {
        setDebugInfo(debugData.debug);
      }

      const envResponse = await fetch(getBacklogEnvironmentUrl());
      const envData = await envResponse.json();

      if (envData.success) {
        setEnvironmentInfo(envData.validation);
      }
    } catch (error) {
      console.error('Error loading debug info:', error);
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
        The backlog.md CLI tool is required to manage project backlogs. It can
        be installed automatically or manually using npm.
      </Description>

      {error && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
        </ErrorMessage>
      )}

      <div style={{display: 'flex', gap: '0.75rem', marginTop: '1rem'}}>
        <Button
          onClick={installBacklog}
          variant="primary"
          disabled={status !== 'not-installed' && status !== 'error'}
        >
          <Download size={14} />
          Install Automatically
        </Button>
        <Button onClick={loadManualInstructions} variant="secondary">
          <Terminal size={14} />
          Manual Instructions
        </Button>
        {onSkip && (
          <Button onClick={onSkip} variant="ghost">
            Skip for Now
          </Button>
        )}
      </div>

      <Button
        onClick={checkBacklogStatus}
        variant="ghost"
        size="small"
        style={{marginTop: '1rem'}}
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
          <p style={{fontSize: '0.875rem', marginBottom: '1rem'}}>
            Install backlog.md globally using your package manager:
          </p>
          <div style={{marginBottom: '1rem'}}>
            <strong style={{fontSize: '0.75rem'}}>Using npm:</strong>
            <CodeBlock>npm install -g backlog.md</CodeBlock>
          </div>
          <div style={{marginBottom: '1rem'}}>
            <strong style={{fontSize: '0.75rem'}}>Using pnpm:</strong>
            <CodeBlock>pnpm add -g backlog.md</CodeBlock>
          </div>

          {detailedError === 'path-issue' && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '0.375rem',
              }}
            >
              <InstructionTitle
                style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}
              >
                <AlertCircle size={14} />
                PATH Configuration Required
              </InstructionTitle>
              <p style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}>
                The CLI appears to be installed but not found in your PATH.
              </p>
              <strong style={{fontSize: '0.75rem'}}>
                Find npm global directory:
              </strong>
              <CodeBlock>npm config get prefix</CodeBlock>
              {isMac || isLinux ? (
                <>
                  <strong style={{fontSize: '0.75rem'}}>
                    Add to PATH (bash/zsh):
                  </strong>
                  <CodeBlock>
                    echo 'export PATH="$PATH:$(npm config get prefix)/bin"'{' '}
                    {'>>'}
                    {'~/.zshrc'}
                  </CodeBlock>
                </>
              ) : isWindows ? (
                <p style={{fontSize: '0.75rem'}}>
                  Add the npm prefix to your Windows PATH environment variable
                  (usually %APPDATA%\npm)
                </p>
              ) : null}
            </div>
          )}

          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '1rem',
            }}
          >
            After installation, click "Check Again" to verify.
          </p>
        </ManualInstructions>
      )}

      <Button
        onClick={() => {
          setShowDiagnostics(!showDiagnostics);
          if (!showDiagnostics && !debugInfo) {
            loadDebugInfo();
          }
        }}
        variant="ghost"
        size="small"
        style={{marginTop: '0.5rem'}}
      >
        <HelpCircle size={14} />
        {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
      </Button>

      {showDiagnostics && (
        <DiagnosticInfo>
          <InstructionTitle
            style={{fontSize: '0.75rem', marginBottom: '0.75rem'}}
          >
            <Info size={14} />
            System Diagnostics
          </InstructionTitle>

          {/* Basic Info */}
          <DiagnosticItem>
            <DiagnosticLabel>Platform:</DiagnosticLabel>
            <DiagnosticValue>{navigator.platform}</DiagnosticValue>
          </DiagnosticItem>
          <DiagnosticItem>
            <DiagnosticLabel>Error Type:</DiagnosticLabel>
            <DiagnosticValue>{detailedError || 'Unknown'}</DiagnosticValue>
          </DiagnosticItem>

          {/* Debug Info from Backend */}
          {debugInfo && (
            <>
              <div style={{marginTop: '1rem', marginBottom: '0.5rem'}}>
                <strong style={{fontSize: '0.75rem'}}>Environment:</strong>
              </div>
              <DiagnosticItem>
                <DiagnosticLabel>npm Global:</DiagnosticLabel>
                <DiagnosticValue>
                  {debugInfo.npmGlobalBin || 'Not detected'}
                </DiagnosticValue>
              </DiagnosticItem>
              <DiagnosticItem>
                <DiagnosticLabel>pnpm Global:</DiagnosticLabel>
                <DiagnosticValue>
                  {debugInfo.pnpmGlobalBin || 'Not detected'}
                </DiagnosticValue>
              </DiagnosticItem>
              {debugInfo.environment?.backlogCliPath && (
                <DiagnosticItem>
                  <DiagnosticLabel>BACKLOG_CLI_PATH:</DiagnosticLabel>
                  <DiagnosticValue>
                    {debugInfo.environment.backlogCliPath}
                  </DiagnosticValue>
                </DiagnosticItem>
              )}

              {/* Common Locations */}
              {debugInfo.commonLocations &&
                Object.keys(debugInfo.commonLocations).length > 0 && (
                  <>
                    <div style={{marginTop: '1rem', marginBottom: '0.5rem'}}>
                      <strong style={{fontSize: '0.75rem'}}>
                        Checked Locations:
                      </strong>
                    </div>
                    {Object.entries(debugInfo.commonLocations).map(
                      ([path, exists]) => (
                        <DiagnosticItem key={path}>
                          <DiagnosticLabel style={{minWidth: '60px'}}>
                            {exists ? '✓ Found' : '✗ Missing'}
                          </DiagnosticLabel>
                          <DiagnosticValue style={{fontSize: '0.7rem'}}>
                            {path}
                          </DiagnosticValue>
                        </DiagnosticItem>
                      ),
                    )}
                  </>
                )}
            </>
          )}

          {/* Environment Validation */}
          {environmentInfo && (
            <>
              <div style={{marginTop: '1rem', marginBottom: '0.5rem'}}>
                <strong style={{fontSize: '0.75rem'}}>Package Managers:</strong>
              </div>
              {environmentInfo.npm && (
                <DiagnosticItem>
                  <DiagnosticLabel>npm:</DiagnosticLabel>
                  <DiagnosticValue>
                    {environmentInfo.npm.available
                      ? `v${environmentInfo.npm.version} (${environmentInfo.npm.globalBin})`
                      : 'Not available'}
                  </DiagnosticValue>
                </DiagnosticItem>
              )}
              {environmentInfo.pnpm && (
                <DiagnosticItem>
                  <DiagnosticLabel>pnpm:</DiagnosticLabel>
                  <DiagnosticValue>
                    {environmentInfo.pnpm.available
                      ? `v${environmentInfo.pnpm.version} (${environmentInfo.pnpm.globalBin})`
                      : 'Not available'}
                  </DiagnosticValue>
                </DiagnosticItem>
              )}
            </>
          )}

          {/* Recommendations */}
          {(debugInfo?.recommendations || environmentInfo?.recommendations) && (
            <>
              <div style={{marginTop: '1rem', marginBottom: '0.5rem'}}>
                <strong style={{fontSize: '0.75rem', color: 'var(--warning)'}}>
                  Recommendations:
                </strong>
              </div>
              {[
                ...(debugInfo?.recommendations || []),
                ...(environmentInfo?.recommendations || []),
              ].map((rec, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: '0.7rem',
                    marginBottom: '0.5rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  • {rec}
                </p>
              ))}
            </>
          )}

          <div style={{marginTop: '1rem'}}>
            <strong style={{fontSize: '0.75rem'}}>
              Manual Verification Commands:
            </strong>
            <CodeBlock>
              {`# Check if backlog is installed
which backlog

# Check npm global packages
npm list -g --depth=0 | grep backlog

# Check npm global bin directory
npm config get prefix

# Check pnpm global packages
pnpm list -g | grep backlog`}
            </CodeBlock>
          </div>

          {/* Set Environment Variable */}
          {detailedError === 'path-issue' && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '0.375rem',
              }}
            >
              <InstructionTitle
                style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}
              >
                <AlertCircle size={14} />
                Quick Fix: Set Environment Variable
              </InstructionTitle>
              <p style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}>
                If you know where backlog is installed, you can set the
                BACKLOG_CLI_PATH environment variable:
              </p>
              <CodeBlock>export BACKLOG_CLI_PATH="/path/to/backlog"</CodeBlock>
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                }}
              >
                Then restart the backend service for changes to take effect.
              </p>
            </div>
          )}
        </DiagnosticInfo>
      )}
    </Container>
  );
}
