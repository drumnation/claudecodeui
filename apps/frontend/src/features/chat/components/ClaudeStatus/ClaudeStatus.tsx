import React from 'react';
import {useClaudeStatus} from '@/features/chat/components/ClaudeStatus/ClaudeStatus.hook';
import {
  getCurrentSpinner,
  parseStatusData,
  getConnectionHealth,
  getDebugInfo,
} from '@/features/chat/components/ClaudeStatus/ClaudeStatus.logic';
import type {ClaudeStatusProps} from './ClaudeStatus.types';
import {
  StatusContainer,
  StatusBar,
  StatusContent,
  StatusItems,
  Spinner,
  StatusTextContainer,
  StatusLine,
  StatusText,
  TimeText,
  Separator,
  TokenText,
  HintText,
  MobileHintText,
  InterruptButton,
  InterruptIcon,
  InterruptText,
  ErrorIcon,
  ErrorContent,
  ErrorMessage,
  ErrorActions,
  ErrorLink,
  ErrorSeparator,
  SettingsButton,
  ConnectionIndicator,
  DebugInfo,
  DebugRow,
  DebugLabel,
  DebugValue,
} from '@/features/chat/components/ClaudeStatus/ClaudeStatus.styles';

export const ClaudeStatus: React.FC<ClaudeStatusProps> = ({
  status,
  onAbort,
  isLoading,
  dependencyError,
  connectionHealth = 'connected',
  lastUpdateTime = Date.now(),
}) => {
  const {elapsedTime, animationPhase, fakeTokens, dependencyStatus} =
    useClaudeStatus(isLoading);
  const [showDebug, setShowDebug] = React.useState(false);

  // Show dependency error if Claude CLI is not available
  if (dependencyError || (dependencyStatus && !dependencyStatus.available)) {
    return (
      <StatusContainer>
        <StatusBar $error>
          <StatusContent>
            <StatusItems>
              <ErrorIcon stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </ErrorIcon>
              <ErrorContent>
                <ErrorMessage>Claude CLI not installed</ErrorMessage>
                <ErrorActions>
                  <ErrorLink href="https://claude.ai/download" target="_blank">
                    Install Claude CLI
                  </ErrorLink>
                  <ErrorSeparator>·</ErrorSeparator>
                  <SettingsButton
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('openSettings'))
                    }
                  >
                    Configure Path
                  </SettingsButton>
                </ErrorActions>
              </ErrorContent>
            </StatusItems>
          </StatusContent>
        </StatusBar>
      </StatusContainer>
    );
  }

  // Toggle debug mode with keyboard shortcut (Ctrl+Shift+D)
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isLoading) return null;

  const currentSpinner = getCurrentSpinner(animationPhase);
  const health = getConnectionHealth(
    status?.connectionHealth || connectionHealth,
    lastUpdateTime,
  );
  const {
    statusText,
    tokens,
    tokenDetails,
    canInterrupt,
    toolStatus,
    contextRemaining,
    phase,
    isUsingFallback,
  } = parseStatusData(status, elapsedTime, fakeTokens, health);

  // Get connection indicator color
  const getHealthColor = () => {
    switch (health) {
      case 'connected':
        return '#22c55e'; // green
      case 'stale':
        return '#f59e0b'; // yellow
      case 'disconnected':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const debugInfo = showDebug
    ? getDebugInfo(status, health, lastUpdateTime)
    : null;

  return (
    <StatusContainer>
      <StatusBar>
        <StatusContent>
          <StatusItems>
            {/* Animated spinner */}
            <Spinner $isEven={animationPhase % 2 === 0}>
              {currentSpinner}
            </Spinner>

            {/* Connection health indicator */}
            <ConnectionIndicator
              $color={getHealthColor()}
              title={`Connection: ${health}${isUsingFallback ? ' (using fallback data)' : ''}`}
            />

            {/* Status text - first line */}
            <StatusTextContainer>
              <StatusLine>
                <StatusText>{statusText}...</StatusText>
                <TimeText>({elapsedTime}s)</TimeText>
                {tokens > 0 && (
                  <>
                    <Separator>·</Separator>
                    <TokenText $desktop>
                      ⚒ {tokens.toLocaleString()} tokens
                    </TokenText>
                    <TokenText>⚒ {tokens.toLocaleString()}</TokenText>
                  </>
                )}
                {toolStatus && (
                  <>
                    <Separator>·</Separator>
                    <StatusText>
                      {toolStatus.count} {toolStatus.tool} running
                    </StatusText>
                  </>
                )}
                {contextRemaining !== null && (
                  <>
                    <Separator>·</Separator>
                    <StatusText>Context: {contextRemaining}%</StatusText>
                  </>
                )}
                <Separator $hiddenOnMobile>·</Separator>
                <HintText>esc to interrupt</HintText>
              </StatusLine>
              {/* Second line for mobile */}
              <MobileHintText>esc to interrupt</MobileHintText>
            </StatusTextContainer>
          </StatusItems>
        </StatusContent>

        {/* Interrupt button */}
        {canInterrupt && onAbort && (
          <InterruptButton onClick={onAbort}>
            <InterruptIcon
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </InterruptIcon>
            <InterruptText>Stop</InterruptText>
          </InterruptButton>
        )}
      </StatusBar>

      {/* Debug information (development only) */}
      {showDebug && debugInfo && (
        <DebugInfo>
          <DebugRow>
            <DebugLabel>Connection Health:</DebugLabel>
            <DebugValue>{debugInfo.connectionHealth}</DebugValue>
          </DebugRow>
          <DebugRow>
            <DebugLabel>Time Since Update:</DebugLabel>
            <DebugValue>
              {Math.round(debugInfo.timeSinceUpdate / 1000)}s
            </DebugValue>
          </DebugRow>
          <DebugRow>
            <DebugLabel>Valid Status:</DebugLabel>
            <DebugValue>{debugInfo.hasValidStatus ? 'Yes' : 'No'}</DebugValue>
          </DebugRow>
          <DebugRow>
            <DebugLabel>Using Fallback:</DebugLabel>
            <DebugValue>{isUsingFallback ? 'Yes' : 'No'}</DebugValue>
          </DebugRow>
          <DebugRow>
            <DebugLabel>Phase:</DebugLabel>
            <DebugValue>{phase}</DebugValue>
          </DebugRow>
          {tokenDetails && (
            <DebugRow>
              <DebugLabel>Token Details:</DebugLabel>
              <DebugValue>
                I:{tokenDetails.input || 0} O:{tokenDetails.output || 0} T:
                {tokenDetails.total || 0}
              </DebugValue>
            </DebugRow>
          )}
          <DebugRow>
            <DebugLabel>Status Keys:</DebugLabel>
            <DebugValue>{debugInfo.statusKeys.join(', ')}</DebugValue>
          </DebugRow>
        </DebugInfo>
      )}
    </StatusContainer>
  );
};
