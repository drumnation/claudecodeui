import { useEffect, useRef, useState } from 'react';
import {
  shellSessions,
  createSessionKey,
  initializeTerminal,
  setupKeyboardShortcuts,
  setupDataHandler,
  clearTerminal,
  storeSession,
  clearProjectSessions,
  getWebSocketUrl,
  processTerminalOutput
} from '@/features/terminal/Shell.logic';

export const useShell = ({ selectedProject, selectedSession, isActive }) => {
  const terminalRef = useRef(null);
  const terminal = useRef(null);
  const fitAddon = useRef(null);
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [lastSessionId, setLastSessionId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const autoConnectTimer = useRef(null);

  // Connect to shell function
  const connectToShell = () => {
    console.log('[Shell Hook] connectToShell called', {
      isInitialized,
      isConnected,
      isConnecting
    });
    
    if (!isInitialized || isConnected || isConnecting) {
      console.log('[Shell Hook] Skipping connection - conditions not met');
      return;
    }
    
    setIsConnecting(true);
    setConnectionError(null);
    
    // Start the WebSocket connection
    connectWebSocket();
  };

  // Disconnect from shell function
  const disconnectFromShell = () => {
    console.log('Disconnecting from shell...');
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    // Clear terminal content completely
    clearTerminal(terminal.current);
    
    setIsConnected(false);
    setIsConnecting(false);
  };
  
  // Start fresh session (without resume)
  const startFreshSession = () => {
    console.log('[Shell Hook] Starting fresh session');
    
    // First disconnect
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(true);
    
    // Connect with fresh session flag
    setTimeout(async () => {
      try {
        const wsUrl = await getWebSocketUrl();
        console.log('[Shell Hook] Connecting fresh session to:', wsUrl);
        
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log('[Shell Hook] Fresh session connected');
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionError(null);
          
          // Send init without session ID for fresh start
          const initPayload = {
            type: 'init',
            projectPath: selectedProject.fullPath || selectedProject.path,
            sessionId: null,
            hasSession: false
          };
          
          console.log('Sending fresh init payload:', initPayload);
          ws.current.send(JSON.stringify(initPayload));
        };

        ws.current.onmessage = (event) => {
          try {
            console.log('[Shell Hook] Received WebSocket message:', event.data.substring(0, 100));
            const data = JSON.parse(event.data);
            console.log('[Shell Hook] Parsed message type:', data.type);
            
            if (!terminal.current) {
              console.error('[Shell Hook] Terminal not initialized, cannot process output');
              return;
            }
            
            processTerminalOutput(data, terminal.current);
          } catch (error) {
            console.error('[Shell Hook] Error processing message:', error, event.data);
          }
        };

        ws.current.onclose = (event) => {
          console.log('[Shell Hook] WebSocket closed:', event.code, event.reason);
          setIsConnected(false);
          setIsConnecting(false);
          clearTerminal(terminal.current);
          
          if (event.code !== 1000) {
            setConnectionError(`Connection closed: ${event.reason || 'Unknown error'}`);
          }
        };

        ws.current.onerror = (error) => {
          console.error('[Shell Hook] WebSocket error:', error);
          setIsConnected(false);
          setIsConnecting(false);
          setConnectionError('Failed to connect to Claude Code shell');
        };
      } catch (error) {
        console.error('[Shell Hook] Failed to start fresh session:', error);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(error.message || 'Failed to start fresh session');
      }
    }, 100);
  };

  // Restart shell function
  const restartShell = () => {
    setIsRestarting(true);
    
    // Clear ALL session storage for this project to force fresh start
    if (selectedProject) {
      clearProjectSessions(selectedProject.name);
    }
    
    console.log('Restarting shell...');
    
    // Close existing WebSocket
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    // Clear and dispose existing terminal
    if (terminal.current) {
      console.log('Disposing terminal...');
      // Dispose terminal immediately without writing text
      terminal.current.dispose();
      terminal.current = null;
      fitAddon.current = null;
    }
    
    // Reset states
    setIsConnected(false);
    setIsInitialized(false);
    
    console.log('Shell restart initiated');
    
    // Force re-initialization after cleanup
    setTimeout(() => {
      setIsRestarting(false);
    }, 200);
  };

  // WebSocket connection function (called manually)
  const connectWebSocket = async () => {
    if (isConnecting || isConnected) {
      console.log('[Shell Hook] Already connecting or connected');
      return;
    }
    
    try {
      console.log('[Shell Hook] Getting WebSocket URL...');
      const wsUrl = await getWebSocketUrl();
      console.log('[Shell Hook] WebSocket URL:', wsUrl);
      
      if (!wsUrl) {
        throw new Error('Failed to get WebSocket URL');
      }
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('[Shell Hook] WebSocket connected successfully');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        
        // Send initial setup with project path and session info
        const initPayload = {
          type: 'init',
          projectPath: selectedProject.fullPath || selectedProject.path,
          sessionId: selectedSession?.id,
          hasSession: !!selectedSession
        };
        
        console.log('Sending init payload:', initPayload);
        ws.current.send(JSON.stringify(initPayload));
      };

      ws.current.onmessage = (event) => {
        try {
          console.log('[Shell Hook] Received WebSocket message:', event.data.substring(0, 100));
          const data = JSON.parse(event.data);
          console.log('[Shell Hook] Parsed message type:', data.type);
          
          if (!terminal.current) {
            console.error('[Shell Hook] Terminal not initialized, cannot process output');
            return;
          }
          
          processTerminalOutput(data, terminal.current);
        } catch (error) {
          console.error('[Shell Hook] Error processing message:', error, event.data);
        }
      };

      ws.current.onclose = (event) => {
        console.log('[Shell Hook] WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Clear terminal content when connection closes
        clearTerminal(terminal.current);
        
        // Set error message for abnormal closures
        if (event.code !== 1000) {
          setConnectionError(`Connection closed: ${event.reason || 'Unknown error'}`);
        }
      };

      ws.current.onerror = (error) => {
        console.error('[Shell Hook] WebSocket error:', error);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError('Failed to connect to Claude Code shell');
      };
    } catch (error) {
      console.error('[Shell Hook] Failed to connect WebSocket:', error);
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError(error.message || 'Failed to connect to shell');
    }
  };

  // Watch for session changes and restart shell
  useEffect(() => {
    const currentSessionId = selectedSession?.id || null;
    
    console.log('Session changed:', lastSessionId || 'none', '->', currentSessionId || 'none');
    
    // Disconnect when session changes (user will need to manually reconnect)
    if (lastSessionId !== null && lastSessionId !== currentSessionId && isInitialized) {
      console.log('Session changed - disconnecting from shell');
      
      // Disconnect from current shell
      disconnectFromShell();
      
      // Clear stored sessions for this project
      if (selectedProject) {
        clearProjectSessions(selectedProject.name);
      }
    }
    
    setLastSessionId(currentSessionId);
  }, [selectedSession?.id, isInitialized]);

  // Initialize terminal when component mounts
  useEffect(() => {
    console.log('Terminal initialization effect triggered', { 
      hasTerminalRef: !!terminalRef.current, 
      selectedProject, 
      isRestarting 
    });
    
    if (!terminalRef.current || !selectedProject || isRestarting) {
      return;
    }

    // Create session key for this project/session combination
    const sessionKey = createSessionKey(selectedProject, selectedSession);
    console.log('Session key:', sessionKey);
    
    // Check if we have an existing session
    const existingSession = shellSessions.get(sessionKey);
    if (existingSession && !terminal.current) {
      console.log('Reusing existing session');
      try {
        // Reuse existing terminal
        terminal.current = existingSession.terminal;
        fitAddon.current = existingSession.fitAddon;
        ws.current = existingSession.ws;
        setIsConnected(existingSession.isConnected);
        
        // Reattach to DOM - dispose existing element first if needed
        if (terminal.current.element && terminal.current.element.parentNode) {
          terminal.current.element.parentNode.removeChild(terminal.current.element);
        }
        
        terminal.current.open(terminalRef.current);
        
        setTimeout(() => {
          if (fitAddon.current) {
            fitAddon.current.fit();
          }
        }, 100);
        
        setIsInitialized(true);
        console.log('[Shell Hook] Terminal initialized successfully');
        return;
      } catch (error) {
        console.error('Failed to reuse session:', error);
        // Clear the broken session and continue to create a new one
        shellSessions.delete(sessionKey);
        terminal.current = null;
        fitAddon.current = null;
        ws.current = null;
      }
    }

    if (terminal.current) {
      return;
    }

    console.log('Creating new terminal');

    // Initialize new terminal
    const { terminal: newTerminal, fitAddon: newFitAddon } = initializeTerminal();
    terminal.current = newTerminal;
    fitAddon.current = newFitAddon;
    
    terminal.current.open(terminalRef.current);

    // Set up keyboard shortcuts and data handler
    setupKeyboardShortcuts(terminal.current, ws);
    setupDataHandler(terminal.current, ws);
    
    // Write initial message to show terminal is ready
    terminal.current.write('\x1b[90mTerminal initialized. Click "Connect" to start Claude...\x1b[0m\r\n');
    
    // Ensure terminal takes full space
    setTimeout(() => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    }, 100);
    
    setIsInitialized(true);
    console.log('[Shell Hook] New terminal created and initialized');

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddon.current && terminal.current) {
        setTimeout(() => {
          fitAddon.current.fit();
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
        const sessionKey = createSessionKey(selectedProject, selectedSession);
        console.log('Storing session for reuse:', sessionKey);
        
        storeSession(sessionKey, terminal.current, fitAddon.current, ws.current, isConnected);
      }
    };
  }, [terminalRef.current, selectedProject, selectedSession, isRestarting]);

  // Auto-connect after initialization with retry logic
  useEffect(() => {
    if (!isInitialized || isConnected || isConnecting) {
      return;
    }

    // Clear any existing timer
    if (autoConnectTimer.current) {
      clearTimeout(autoConnectTimer.current);
    }

    console.log('[Shell Hook] Setting up auto-connect timer');
    
    // Try to auto-connect after 2 seconds if not connected
    autoConnectTimer.current = setTimeout(() => {
      if (isInitialized && !isConnected && !isConnecting) {
        console.log('[Shell Hook] Auto-connecting to shell after delay');
        connectToShell();
      }
    }, 2000);

    return () => {
      if (autoConnectTimer.current) {
        clearTimeout(autoConnectTimer.current);
      }
    };
  }, [isInitialized, isConnected, isConnecting]);

  // Fit terminal when tab becomes active
  useEffect(() => {
    if (!isActive || !isInitialized) return;

    // Fit terminal when tab becomes active
    setTimeout(() => {
      if (fitAddon.current) {
        fitAddon.current.fit();
      }
    }, 100);
  }, [isActive, isInitialized]);

  return {
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
  };
};