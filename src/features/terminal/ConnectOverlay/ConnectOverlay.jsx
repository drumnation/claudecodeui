import React from 'react';
import {
  OverlayContainer,
  ConnectContainer,
  ConnectButton,
  ConnectIcon,
  ConnectDescription,
  ConnectingContainer,
  ConnectingContent,
  Spinner,
  ConnectingText,
  ConnectingDescription
} from '@/features/terminal/ConnectOverlay/ConnectOverlay.styles';

export const ConnectOverlay = ({ 
  isInitialized, 
  isConnected, 
  isConnecting, 
  onConnect, 
  selectedSession,
  projectName 
}) => {
  if (!isInitialized || isConnected) return null;

  if (isConnecting) {
    return (
      <OverlayContainer withPadding>
        <ConnectingContainer>
          <ConnectingContent>
            <Spinner />
            <ConnectingText>Connecting to shell...</ConnectingText>
          </ConnectingContent>
          <ConnectingDescription>
            Starting Claude CLI in {projectName}
          </ConnectingDescription>
        </ConnectingContainer>
      </OverlayContainer>
    );
  }

  return (
    <OverlayContainer withPadding>
      <ConnectContainer>
        <ConnectButton onClick={onConnect} title="Connect to shell">
          <ConnectIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </ConnectIcon>
          <span>Continue in Shell</span>
        </ConnectButton>
        <ConnectDescription>
          {selectedSession ? 
            `Resume session: ${selectedSession.summary.slice(0, 50)}...` : 
            'Start a new Claude session'
          }
        </ConnectDescription>
      </ConnectContainer>
    </OverlayContainer>
  );
};