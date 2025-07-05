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
  InterruptText
} from '@/features/chat/components/ClaudeStatus/ClaudeStatus.styles';

/**
 * ClaudeStatus component displays the current status of Claude's processing
 * @param {Object} props
 * @param {Object} props.status - Status object with text, tokens, can_interrupt
 * @param {Function} props.onAbort - Callback to abort current operation
 * @param {boolean} props.isLoading - Whether Claude is currently processing
 */
function ClaudeStatus({ status, onAbort, isLoading }) {
  const { elapsedTime, animationPhase, fakeTokens } = useClaudeStatus(isLoading);
  
  if (!isLoading) return null;
  
  const currentSpinner = getCurrentSpinner(animationPhase);
  const { statusText, tokens, canInterrupt } = parseStatusData(status, elapsedTime, fakeTokens);
  
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

export default ClaudeStatus;