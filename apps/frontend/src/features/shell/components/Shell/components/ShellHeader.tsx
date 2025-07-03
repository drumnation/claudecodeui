import React from "react";
import type { Session } from "@/app/types";

interface ShellHeaderProps {
  isConnected: boolean;
  isInitialized: boolean;
  isRestarting: boolean;
  selectedSession: Session | null;
  onDisconnect: () => void;
  onRestart: () => void;
}

export function ShellHeader({
  isConnected,
  isInitialized,
  isRestarting,
  selectedSession,
  onDisconnect,
  onRestart
}: ShellHeaderProps) {
  return (
    <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {selectedSession && (
            <span className="text-xs text-blue-300">
              ({selectedSession.summary.slice(0, 30)}...)
            </span>
          )}
          {!selectedSession && (
            <span className="text-xs text-gray-400">(New Session)</span>
          )}
          {!isInitialized && (
            <span className="text-xs text-yellow-400">(Initializing...)</span>
          )}
          {isRestarting && (
            <span className="text-xs text-blue-400">(Restarting...)</span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {isConnected && (
            <button
              onClick={onDisconnect}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-1"
              title="Disconnect from shell"
              data-testid="disconnect-shell-button"
            >
              <svg
                className="w-3 h-3"
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
              </svg>
              <span>Disconnect</span>
            </button>
          )}

          <button
            onClick={onRestart}
            disabled={isRestarting || isConnected}
            className="text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            title="Restart Shell (disconnect first)"
            data-testid="restart-shell-button"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Restart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
