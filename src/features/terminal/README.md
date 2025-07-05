# Terminal Feature

The Terminal feature provides a full-featured terminal emulator integrated into Claude Code UI. It enables users to execute shell commands, run scripts, and interact with their development environment through a familiar command-line interface.

## Overview

The Terminal feature offers a web-based terminal experience powered by xterm.js, with WebSocket-based communication to a backend shell. It provides a complete terminal environment with support for colors, cursor movement, and interactive programs, making it suitable for all command-line development tasks.

## Components Structure

### Main Components
- **Shell** - Main container orchestrating the terminal experience
- **Terminal** - The xterm.js terminal instance wrapper
- **ShellHeader** - Header with connection status and controls
- **ConnectOverlay** - Connection UI overlay
- **EmptyState** - Display when no project is selected

### File Structure
```
terminal/
├── index.js
├── Shell.jsx
├── Shell.styles.js
├── Shell.hook.js
├── Shell.logic.js
├── Shell.stories.jsx
├── README.md
├── Terminal/
│   ├── index.js
│   ├── Terminal.jsx
│   ├── Terminal.styles.js
│   └── Terminal.stories.jsx
├── ShellHeader/
│   ├── index.js
│   ├── ShellHeader.jsx
│   ├── ShellHeader.styles.js
│   └── ShellHeader.stories.jsx
├── ConnectOverlay/
│   ├── index.js
│   ├── ConnectOverlay.jsx
│   ├── ConnectOverlay.styles.js
│   └── ConnectOverlay.stories.jsx
└── EmptyState/
    ├── index.js
    ├── EmptyState.jsx
    ├── EmptyState.styles.js
    └── EmptyState.stories.jsx
```

## Key Features

### Terminal Emulation
- Full xterm.js terminal
- 256 color support
- Unicode character support
- Cursor positioning
- Screen buffer management
- ANSI escape sequences

### Shell Integration
- Bash/Zsh/Fish support
- Environment variable access
- Working directory management
- Command history
- Tab completion (via shell)
- Signal handling (Ctrl+C, etc.)

### Connection Management
- WebSocket-based communication
- Automatic reconnection
- Connection status display
- Manual connect/disconnect
- Session persistence
- Multiple terminal support (planned)

### User Interface
- Resizable terminal area
- Customizable font size
- Theme support (dark/light)
- Copy/paste functionality
- Selection highlighting
- Scrollback buffer

### Project Integration
- Auto-connect on project selection
- Working directory sync
- Environment setup
- Project-specific shells
- Path resolution
- Git status in prompt

## Terminal Configuration

### xterm.js Options
```javascript
{
  theme: {
    background: '#1a1a1a',
    foreground: '#e4e4e4',
    cursor: '#e4e4e4',
    selection: 'rgba(255, 255, 255, 0.3)'
  },
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Consolas, monospace',
  cursorBlink: true,
  scrollback: 10000,
  macOptionIsMeta: true
}
```

### WebSocket Protocol
- Binary data support
- Resize events
- Input/output streaming
- Control sequences
- Keep-alive pings

## State Management

The feature uses React hooks for state management:
- **useTerminal** - Terminal instance management
- **useWebSocket** - WebSocket connection handling
- **useResizeObserver** - Terminal size synchronization
- **useConnectionState** - Connection status tracking

## WebSocket Events

### Client → Server
- `terminal:input` - Keyboard input
- `terminal:resize` - Terminal dimensions
- `terminal:connect` - Start session
- `terminal:disconnect` - End session

### Server → Client
- `terminal:output` - Shell output
- `terminal:connected` - Session started
- `terminal:disconnected` - Session ended
- `terminal:error` - Error occurred

## Performance Optimizations

- Efficient rendering with xterm.js
- WebGL renderer option
- Debounced resize handling
- Binary data transfer
- Minimal re-renders
- Memory-efficient scrollback

## Accessibility

- Screen reader support
- Keyboard-only navigation
- ARIA labels
- Focus management
- High contrast themes
- Font size adjustment

## Security Considerations

- Sandboxed execution
- No direct system access
- Input sanitization
- Session isolation
- Secure WebSocket
- Permission checks

## Customization

### User Preferences
- Font family selection
- Font size adjustment
- Color scheme choice
- Cursor style
- Bell sound toggle
- Scrollback limit

### Shell Configuration
- Default shell selection
- Custom prompt
- Startup commands
- Environment variables
- Aliases support

## Integration Points

- **Project Context** - Working directory
- **File Explorer** - Navigate to paths
- **Git Panel** - Git commands
- **Preview** - Server commands
- **Chat** - Command suggestions

## Advanced Features

### Clipboard Integration
- Copy with Cmd/Ctrl+C
- Paste with Cmd/Ctrl+V
- Right-click context menu
- Selection auto-copy option
- Multi-line paste warning

### Search Functionality
- Find in scrollback
- Regex support
- Case sensitivity toggle
- Highlight matches
- Navigate results

## Usage Example

```jsx
import { Shell } from '@/features/terminal';

function App() {
  return (
    <Shell
      selectedProject={currentProject}
      isActive={showTerminal}
      onConnectionChange={handleConnectionChange}
    />
  );
}
```

## Props

- `selectedProject` - Current project configuration
- `isActive` - Whether terminal is visible
- `onConnectionChange` - Connection status callback

## Error Handling

- Connection failures
- Command errors
- Resize issues
- Clipboard failures
- WebSocket errors
- Graceful degradation

## Testing

- Component unit tests
- WebSocket mocking
- Terminal emulation tests
- Integration tests
- Storybook stories