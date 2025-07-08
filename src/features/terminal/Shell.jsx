import React, { useEffect } from 'react';
import { useShell } from '@/features/terminal/Shell.hook';
import { ShellContainer } from '@/features/terminal/Shell.styles';
import { ShellHeader } from '@/features/terminal/ShellHeader';
import { Terminal } from '@/features/terminal/Terminal';
import { ConnectOverlay } from '@/features/terminal/ConnectOverlay';
import { EmptyState } from '@/features/terminal/EmptyState';
// Removed Button import - using inline button instead

export const Shell = ({ selectedProject, selectedSession, isActive }) => {
  const {
    terminalRef,
    isConnected,
    isInitialized,
    isRestarting,
    isConnecting,
    connectionError,
    connectToShell,
    disconnectFromShell,
    restartShell,
    startFreshSession
  } = useShell({ selectedProject, selectedSession, isActive });

  // Debug logging for render state
  useEffect(() => {
    console.log('[Shell] Render state:', {
      isInitialized,
      isConnected,
      isConnecting,
      isRestarting,
      isActive,
      hasProject: !!selectedProject,
      hasSession: !!selectedSession,
      overlayVisible: isInitialized && !isConnected
    });
  }, [isInitialized, isConnected, isConnecting, isRestarting, isActive, selectedProject, selectedSession]);

  if (!selectedProject) {
    return <EmptyState />;
  }

  // Determine if fallback connect button should be shown
  const showFallbackConnect = isInitialized && !isConnected && !isConnecting;

  return (
    <ShellContainer>
      <ShellHeader
        isConnected={isConnected}
        selectedSession={selectedSession}
        isInitialized={isInitialized}
        isRestarting={isRestarting}
        isConnecting={isConnecting}
        onDisconnect={disconnectFromShell}
        onRestart={restartShell}
        onConnect={connectToShell}
        onStartFresh={startFreshSession}
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
      
      {/* Fallback connect button - always visible when not connected */}
      {showFallbackConnect && (
        <div className="absolute bottom-4 right-4 z-[10000] text-right">
          {connectionError && (
            <div className="text-red-500 text-sm mb-2 px-2">
              {connectionError}
            </div>
          )}
          <button
            onClick={connectToShell}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg font-medium"
          >
            Connect to Shell (Fallback)
          </button>
        </div>
      )}
    </ShellContainer>
  );
};