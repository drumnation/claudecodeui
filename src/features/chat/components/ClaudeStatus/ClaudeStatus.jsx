import React from 'react';
import { useClaudeStatus } from '@/features/chat/components/ClaudeStatus/ClaudeStatus.hook';
import { getCurrentSpinner, parseStatusData } from '@/features/chat/components/ClaudeStatus/ClaudeStatus.logic';
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
  SettingsButton
} from '@/features/chat/components/ClaudeStatus/ClaudeStatus.styles';

/**
 * ClaudeStatus component displays the current status of Claude's processing
 * @param {Object} props
 * @param {Object} props.status - Status object with text, tokens, can_interrupt
 * @param {Function} props.onAbort - Callback to abort current operation
 * @param {boolean} props.isLoading - Whether Claude is currently processing
 * @param {boolean} props.dependencyError - Whether there's a dependency error (Claude CLI not found)
 */
export function ClaudeStatus({ status, onAbort, isLoading, dependencyError }) {
  const { elapsedTime, animationPhase, fakeTokens, dependencyStatus } = useClaudeStatus(isLoading);
  
  // Show dependency error if Claude CLI is not available
  if (dependencyError || (dependencyStatus && !dependencyStatus.available)) {
    return (
      <StatusContainer>
        <StatusBar $error>
          <StatusContent>
            <StatusItems>
              <ErrorIcon stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </ErrorIcon>
              <ErrorContent>
                <ErrorMessage>Claude CLI not installed</ErrorMessage>
                <ErrorActions>
                  <ErrorLink href="https://claude.ai/download" target="_blank">
                    Install Claude CLI
                  </ErrorLink>
                  <ErrorSeparator>·</ErrorSeparator>
                  <SettingsButton onClick={() => window.dispatchEvent(new CustomEvent('openSettings'))}>
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
  
  if (!isLoading) return null;
  
  const currentSpinner = getCurrentSpinner(animationPhase);
  const { statusText, tokens, canInterrupt, toolStatus, contextRemaining } = parseStatusData(status, elapsedTime, fakeTokens);
  
  return (
    <StatusContainer>
      <StatusBar>
        <StatusContent>
          <StatusItems>
            {/* Animated spinner */}
            <Spinner $isEven={animationPhase % 2 === 0}>
              {currentSpinner}
            </Spinner>
            
            {/* Status text - first line */}
            <StatusTextContainer>
              <StatusLine>
                <StatusText>{statusText}...</StatusText>
                <TimeText>({elapsedTime}s)</TimeText>
                {tokens > 0 && (
                  <>
                    <Separator>·</Separator>
                    <TokenText $desktop>⚒ {tokens.toLocaleString()} tokens</TokenText>
                    <TokenText>⚒ {tokens.toLocaleString()}</TokenText>
                  </>
                )}
                {toolStatus && (
                  <>
                    <Separator>·</Separator>
                    <StatusText>{toolStatus.count} {toolStatus.tool} running</StatusText>
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
              <MobileHintText>
                esc to interrupt
              </MobileHintText>
            </StatusTextContainer>
          </StatusItems>
        </StatusContent>
        
        {/* Interrupt button */}
        {canInterrupt && onAbort && (
          <InterruptButton onClick={onAbort}>
            <InterruptIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </InterruptIcon>
            <InterruptText>Stop</InterruptText>
          </InterruptButton>
        )}
      </StatusBar>
    </StatusContainer>
  );
}

