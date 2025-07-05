import React from 'react';
import { useShell } from '@/features/terminal/Shell.hook';
import { ShellContainer } from '@/features/terminal/Shell.styles';
import { ShellHeader } from '@/features/terminal/ShellHeader';
import { Terminal } from '@/features/terminal/Terminal';
import { ConnectOverlay } from '@/features/terminal/ConnectOverlay';
import { EmptyState } from '@/features/terminal/EmptyState';

export const Shell = ({ selectedProject, selectedSession, isActive }) => {
  const {
    terminalRef,
    isConnected,
    isInitialized,
    isRestarting,
    isConnecting,
    connectToShell,
    disconnectFromShell,
    restartShell
  } = useShell({ selectedProject, selectedSession, isActive });

  if (!selectedProject) {
    return <EmptyState />;
  }

  return (
    <ShellContainer>
      <ShellHeader
        isConnected={isConnected}
        selectedSession={selectedSession}
        isInitialized={isInitialized}
        isRestarting={isRestarting}
        onDisconnect={disconnectFromShell}
        onRestart={restartShell}
      />
      
      <Terminal 
        terminalRef={terminalRef}
        isInitialized={isInitialized}
      />
      
      <ConnectOverlay
        isInitialized={isInitialized}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onConnect={connectToShell}
        selectedSession={selectedSession}
        projectName={selectedProject.displayName}
      />
    </ShellContainer>
  );
};