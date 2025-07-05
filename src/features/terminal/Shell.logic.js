import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { ClipboardAddon } from '@xterm/addon-clipboard';
import { WebglAddon } from '@xterm/addon-webgl';

// Global store for shell sessions to persist across tab switches
export const shellSessions = new Map();

// Terminal theme configuration
export const terminalTheme = {
  // Basic colors
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#ffffff',
  cursorAccent: '#1e1e1e',
  selection: '#264f78',
  selectionForeground: '#ffffff',
  
  // Standard ANSI colors (0-7)
  black: '#000000',
  red: '#cd3131',
  green: '#0dbc79',
  yellow: '#e5e510',
  blue: '#2472c8',
  magenta: '#bc3fbc',
  cyan: '#11a8cd',
  white: '#e5e5e5',
  
  // Bright ANSI colors (8-15)
  brightBlack: '#666666',
  brightRed: '#f14c4c',
  brightGreen: '#23d18b',
  brightYellow: '#f5f543',
  brightBlue: '#3b8eea',
  brightMagenta: '#d670d6',
  brightCyan: '#29b8db',
  brightWhite: '#ffffff',
  
  // Extended colors for better Claude output
  extendedAnsi: [
    // 16-color palette extension for 256-color support
    '#000000', '#800000', '#008000', '#808000',
    '#000080', '#800080', '#008080', '#c0c0c0',
    '#808080', '#ff0000', '#00ff00', '#ffff00',
    '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
  ]
};

// Terminal configuration
export const terminalConfig = {
  cursorBlink: true,
  fontSize: 14,
  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  allowProposedApi: true, // Required for clipboard addon
  allowTransparency: false,
  convertEol: true,
  scrollback: 10000,
  tabStopWidth: 4,
  // Enable full color support
  windowsMode: false,
  macOptionIsMeta: true,
  macOptionClickForcesSelection: false,
  theme: terminalTheme
};

// Create session key for a project/session combination
export const createSessionKey = (selectedProject, selectedSession) => {
  if (!selectedProject) return null;
  return selectedSession?.id || `project-${selectedProject.name}`;
};

// Initialize a new terminal instance
export const initializeTerminal = () => {
  const terminal = new Terminal(terminalConfig);
  const fitAddon = new FitAddon();
  const clipboardAddon = new ClipboardAddon();
  const webglAddon = new WebglAddon();
  
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(clipboardAddon);
  
  try {
    terminal.loadAddon(webglAddon);
  } catch (error) {
    console.warn('WebGL addon failed to load:', error);
  }
  
  return { terminal, fitAddon };
};

// Set up keyboard shortcuts for the terminal
export const setupKeyboardShortcuts = (terminal, ws) => {
  terminal.attachCustomKeyEventHandler((event) => {
    // Ctrl+C or Cmd+C for copy (when text is selected)
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && terminal.hasSelection()) {
      document.execCommand('copy');
      return false;
    }
    
    // Ctrl+V or Cmd+V for paste
    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
      navigator.clipboard.readText().then(text => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'input',
            data: text
          }));
        }
      }).catch(err => {
        console.error('Failed to read clipboard:', err);
      });
      return false;
    }
    
    return true;
  });
};

// Set up terminal data handler
export const setupDataHandler = (terminal, ws) => {
  terminal.onData((data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'input',
        data: data
      }));
    }
  });
};

// Clear terminal content
export const clearTerminal = (terminal) => {
  if (terminal) {
    terminal.clear();
    terminal.write('\x1b[2J\x1b[H'); // Clear screen and move cursor to home
  }
};

// Store session for reuse
export const storeSession = (sessionKey, terminal, fitAddon, ws, isConnected) => {
  try {
    shellSessions.set(sessionKey, {
      terminal,
      fitAddon,
      ws,
      isConnected
    });
  } catch (error) {
    console.error('Failed to store session:', error);
  }
};

// Clear sessions for a project
export const clearProjectSessions = (projectName) => {
  const sessionKeys = Array.from(shellSessions.keys()).filter(key => 
    key.includes(projectName)
  );
  sessionKeys.forEach(key => shellSessions.delete(key));
};

// Get WebSocket URL
export const getWebSocketUrl = async () => {
  let wsBaseUrl;
  try {
    const configResponse = await fetch('/api/config');
    const config = await configResponse.json();
    wsBaseUrl = config.wsUrl;
    
    // If the config returns localhost but we're not on localhost, use current host but with API server port
    if (wsBaseUrl.includes('localhost') && !window.location.hostname.includes('localhost')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // For development, API server is typically on port 3002 when Vite is on 3001
      const apiPort = window.location.port === '3001' ? '3002' : window.location.port;
      wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
    }
  } catch (error) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // For development, API server is typically on port 3002 when Vite is on 3001
    const apiPort = window.location.port === '3001' ? '3002' : window.location.port;
    wsBaseUrl = `${protocol}//${window.location.hostname}:${apiPort}`;
  }
  
  return `${wsBaseUrl}/shell`;
};

// Process terminal output (e.g., handle URLs)
export const processTerminalOutput = (data, terminal) => {
  if (data.type === 'output') {
    // Check for URLs in the output and make them clickable
    const urlRegex = /(https?:\/\/[^\s\x1b\x07]+)/g;
    let output = data.data;
    
    // Find URLs in the text (excluding ANSI escape sequences)
    const urls = [];
    let match;
    while ((match = urlRegex.exec(output.replace(/\x1b\[[0-9;]*m/g, ''))) !== null) {
      urls.push(match[1]);
    }
    
    // If URLs found, log them for potential opening
    if (urls.length > 0) {
      console.log('URLs found in output:', urls);
    }
    
    terminal.write(output);
  } else if (data.type === 'url_open') {
    // Handle explicit URL opening requests from server
    window.open(data.url, '_blank');
  }
};