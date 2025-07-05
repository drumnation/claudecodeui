import React from 'react';
import {
  Header,
  HeaderContent,
  StatusGroup,
  StatusIndicator,
  SessionInfo,
  SessionLabel,
  StatusMessage,
  ControlGroup,
  DisconnectButton,
  RestartButton,
  IconSvg
} from '@/features/terminal/ShellHeader/ShellHeader.styles';

export const ShellHeader = ({
  isConnected,
  selectedSession,
  isInitialized,
  isRestarting,
  onDisconnect,
  onRestart
}) => {
  return (
    <Header>
      <HeaderContent>
        <StatusGroup>
          <StatusIndicator isConnected={isConnected} />
          {selectedSession && (
            <SessionInfo>
              ({selectedSession.summary.slice(0, 30)}...)
            </SessionInfo>
          )}
          {!selectedSession && (
            <SessionLabel>(New Session)</SessionLabel>
          )}
          {!isInitialized && (
            <StatusMessage type="initializing">(Initializing...)</StatusMessage>
          )}
          {isRestarting && (
            <StatusMessage type="restarting">(Restarting...)</StatusMessage>
          )}
        </StatusGroup>
        <ControlGroup>
          {isConnected && (
            <DisconnectButton
              onClick={onDisconnect}
              title="Disconnect from shell"
            >
              <IconSvg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </IconSvg>
              <span>Disconnect</span>
            </DisconnectButton>
          )}
          
          <RestartButton
            onClick={onRestart}
            disabled={isRestarting || isConnected}
            title="Restart Shell (disconnect first)"
          >
            <IconSvg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </IconSvg>
            <span>Restart</span>
          </RestartButton>
        </ControlGroup>
      </HeaderContent>
    </Header>
  );
};