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

  // Connect to shell function
  const connectToShell = () => {
    if (!isInitialized || isConnected || isConnecting) return;
    
    setIsConnecting(true);
    
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
    if (isConnecting || isConnected) return;
    
    try {
      const wsUrl = await getWebSocketUrl();
      console.log('Connecting to WebSocket:', wsUrl);
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        
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
          const data = JSON.parse(event.data);
          processTerminalOutput(data, terminal.current);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket closed:', event);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Clear terminal content when connection closes
        clearTerminal(terminal.current);
        
        // Don't auto-reconnect anymore - user must manually connect
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
      setIsConnecting(false);
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
    connectToShell,
    disconnectFromShell,
    restartShell
  };
};