import { useEffect, useRef, useState, useCallback } from "react";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";
import type { ShellProps, ShellSession } from "./Shell.types";
import { shellLogic } from "./Shell.logic";

export function useShell({ selectedProject, selectedSession, isActive }: ShellProps) {
  // Refs
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const ws = useRef<WebSocket | null>(null);
  
  // State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Connect to shell function
  const connectToShell = useCallback(() => {
    if (!isInitialized || isConnected || isConnecting) return;
    setIsConnecting(true);
    connectWebSocket();
  }, [isInitialized, isConnected, isConnecting]);

  // Disconnect from shell function
  const disconnectFromShell = useCallback(() => {
    if (ws.current) {
      shellLogic.closeWebSocket(ws.current);
      ws.current = null;
    }

    if (terminal.current) {
      shellLogic.clearTerminal(terminal.current);
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Restart shell function
  const restartShell = useCallback(() => {
    if (!selectedProject) return;
    
    setIsRestarting(true);

    // Clear ALL session storage for this project to force fresh start
    shellLogic.clearProjectSessions(selectedProject.name);

    // Close existing WebSocket
    if (ws.current) {
      shellLogic.closeWebSocket(ws.current);
      ws.current = null;
    }

    // Clear and dispose existing terminal
    if (terminal.current) {
      shellLogic.disposeTerminal(terminal.current);
      terminal.current = null;
      fitAddon.current = null;
    }

    // Reset states
    setIsConnected(false);
    setIsInitialized(false);

    // Force re-initialization after cleanup
    setTimeout(() => {
      setIsRestarting(false);
    }, 200);
  }, [selectedProject]);

  // WebSocket connection function
  const connectWebSocket = useCallback(async () => {
    if (isConnecting || isConnected) return;

    try {
      const wsUrl = await shellLogic.getWebSocketUrl();
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);

        const initPayload = shellLogic.createInitPayload(selectedProject, selectedSession);
        ws.current?.send(JSON.stringify(initPayload));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (terminal.current) {
            shellLogic.processMessage(data, terminal.current);
          }
        } catch (error) {
          // Invalid JSON, ignore
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);

        if (terminal.current) {
          shellLogic.clearTerminal(terminal.current);
        }
      };

      ws.current.onerror = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (error) {
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, selectedProject, selectedSession]);

  // Watch for session changes and restart shell
  useEffect(() => {
    const currentSessionId = selectedSession?.id || null;

    if (
      lastSessionId !== null &&
      lastSessionId !== currentSessionId &&
      isInitialized
    ) {
      disconnectFromShell();

      if (selectedProject) {
        shellLogic.clearAllProjectSessions(selectedProject.name);
      }
    }

    setLastSessionId(currentSessionId);
  }, [selectedSession?.id, isInitialized, disconnectFromShell, selectedProject]);

  // Initialize terminal when component mounts
  useEffect(() => {
    if (!terminalRef.current || !selectedProject || isRestarting) {
      return;
    }

    const sessionKey = shellLogic.getSessionKey(selectedProject, selectedSession);
    const existingSession = shellLogic.getStoredSession(sessionKey);
    
    if (existingSession && !terminal.current) {
      try {
        // Reuse existing terminal
        terminal.current = existingSession.terminal;
        fitAddon.current = existingSession.fitAddon;
        ws.current = existingSession.ws;
        setIsConnected(existingSession.isConnected);

        // Reattach to DOM
        if (terminal.current?.element?.parentNode) {
          terminal.current.element.parentNode.removeChild(terminal.current.element);
        }

        if (terminalRef.current && terminal.current) {
          terminal.current.open(terminalRef.current);
        }

        setTimeout(() => {
          if (fitAddon.current) {
            fitAddon.current.fit();
          }
        }, 100);

        setIsInitialized(true);
        return;
      } catch (error) {
        // Clear the broken session and continue to create a new one
        shellLogic.clearSession(sessionKey);
        terminal.current = null;
        fitAddon.current = null;
        ws.current = null;
      }
    }

    if (terminal.current) {
      return;
    }

    // Initialize new terminal
    terminal.current = shellLogic.createTerminal();
    fitAddon.current = shellLogic.setupTerminalAddons(terminal.current);

    terminal.current.open(terminalRef.current);

    // Setup keyboard and data handlers
    shellLogic.setupKeyboardHandlers(terminal.current, ws);
    shellLogic.setupDataHandler(terminal.current, ws);

    // Ensure terminal takes full space
    setTimeout(() => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    }, 100);

    setIsInitialized(true);

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddon.current && terminal.current) {
        setTimeout(() => {
          fitAddon.current?.fit();
        }, 50);
      }
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      resizeObserver.disconnect();

      // Store session for reuse instead of disposing
      if (terminal.current && selectedProject) {
        const sessionKey = shellLogic.getSessionKey(selectedProject, selectedSession);
        
        shellLogic.storeSession(sessionKey, {
          terminal: terminal.current,
          fitAddon: fitAddon.current!,
          ws: ws.current,
          isConnected: isConnected,
        });
      }
    };
  }, [terminalRef.current, selectedProject, selectedSession, isRestarting, isConnected]);

  // Fit terminal when tab becomes active
  useEffect(() => {
    if (!isActive || !isInitialized) return;

    setTimeout(() => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    }, 100);
  }, [isActive, isInitialized]);

  return {
    // Refs
    terminalRef,
    
    // State
    isConnected,
    isInitialized,
    isRestarting,
    isConnecting,
    
    // Actions
    connectToShell,
    disconnectFromShell,
    restartShell,
  };
}
