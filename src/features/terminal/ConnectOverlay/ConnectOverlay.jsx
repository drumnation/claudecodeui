import React, { useEffect } from 'react';
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
import { useLogger, isLevelEnabled } from '../../../logger';

export const ConnectOverlay = ({ 
  isInitialized, 
  isConnected, 
  isConnecting, 
  onConnect, 
  selectedSession,
  projectName 
}) => {
  const logger = useLogger({ component: 'ConnectOverlay' });
  
  // Debug logging
  useEffect(() => {
    if (isLevelEnabled(logger, 'trace')) {
      logger.trace('ConnectOverlay state change', {
        isInitialized,
        isConnected,
        isConnecting,
        shouldShow: isInitialized && !isConnected,
        projectName
      });
    }
  }, [isInitialized, isConnected, isConnecting, projectName]);
  
  // Component mount/unmount logging
  useEffect(() => {
    if (isLevelEnabled(logger, 'debug')) {
      logger.debug('ConnectOverlay mounted');
      return () => {
        logger.debug('ConnectOverlay unmounted');
      };
    }
  }, []);
  
  if (!isInitialized || isConnected) {
    return null;
  }

  if (isConnecting) {
    return (
      <OverlayContainer withPadding data-testid="connect-overlay-connecting" className="connect-overlay-visible">
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
    <OverlayContainer withPadding data-testid="connect-overlay" className="connect-overlay-visible">
      <ConnectContainer>
        <ConnectButton 
          onClick={() => {
            if (isLevelEnabled(logger, 'debug')) {
              logger.debug('Connect button clicked');
            }
            onConnect();
          }} 
          title="Connect to shell"
          data-testid="connect-button"
        >
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