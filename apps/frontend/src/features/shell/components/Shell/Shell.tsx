import React from "react";
import "xterm/css/xterm.css";
import { ShellHeader } from "./components/ShellHeader";
import { ShellTerminal } from "./components/ShellTerminal";
import { ShellEmptyState } from "./components/ShellEmptyState";
import { useShell } from "./Shell.hook";
import type { ShellProps } from "./Shell.types";

export function Shell({ selectedProject, selectedSession, isActive }: ShellProps) {
  const {
    terminalRef,
    isConnected,
    isInitialized,
    isRestarting,
    isConnecting,
    connectToShell,
    disconnectFromShell,
    restartShell,
  } = useShell({ selectedProject, selectedSession, isActive });

  if (!selectedProject) {
    return <ShellEmptyState />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <ShellHeader
        isConnected={isConnected}
        isInitialized={isInitialized}
        isRestarting={isRestarting}
        selectedSession={selectedSession}
        onDisconnect={disconnectFromShell}
        onRestart={restartShell}
      />

      <ShellTerminal
        terminalRef={terminalRef}
        isInitialized={isInitialized}
        isConnected={isConnected}
        isConnecting={isConnecting}
        selectedSession={selectedSession}
        selectedProject={selectedProject}
        onConnect={connectToShell}
      />
    </div>
  );
}
