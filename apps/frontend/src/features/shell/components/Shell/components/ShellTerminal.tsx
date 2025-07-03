import React from "react";
import type { Session, Project } from "@/app/types";

interface ShellTerminalProps {
  terminalRef: React.RefObject<HTMLDivElement>;
  isInitialized: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  selectedSession: Session | null;
  selectedProject: Project;
  onConnect: () => void;
}

export function ShellTerminal({
  terminalRef,
  isInitialized,
  isConnected,
  isConnecting,
  selectedSession,
  selectedProject,
  onConnect
}: ShellTerminalProps) {
  return (
    <div className="flex-1 p-2 overflow-hidden relative">
      <div
        ref={terminalRef}
        className="h-full w-full"
        data-testid="terminal-container"
      />

      {/* Loading state */}
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
          <div className="text-white">Loading terminal...</div>
        </div>
      )}

      {/* Connect button when not connected */}
      {isInitialized && !isConnected && !isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
          <div className="text-center max-w-sm w-full">
            <button
              onClick={onConnect}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-base font-medium w-full sm:w-auto"
              title="Connect to shell"
              data-testid="connect-shell-button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Continue in Shell</span>
            </button>
            <p className="text-gray-400 text-sm mt-3 px-2">
              {selectedSession
                ? `Resume session: ${selectedSession.summary.slice(0, 50)}...`
                : "Start a new Claude session"}
            </p>
          </div>
        </div>
      )}

      {/* Connecting state */}
      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 p-4">
          <div className="text-center max-w-sm w-full">
            <div className="flex items-center justify-center space-x-3 text-yellow-400">
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent"></div>
              <span className="text-base font-medium">Connecting to shell...</span>
            </div>
            <p className="text-gray-400 text-sm mt-3 px-2">
              Starting Claude CLI in {selectedProject.displayName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
