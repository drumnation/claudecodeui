# Preview Feature

The Preview feature provides a live development server and browser preview for web applications. It enables users to run their projects, view live updates, navigate pages, and monitor server logs - all within an integrated preview panel.

## Overview

The Preview feature offers a complete development server experience with hot reloading, allowing developers to see their changes in real-time. It includes server controls, navigation tools, and comprehensive logging to streamline the development workflow.

## Components Structure

### Main Components
- **LivePreviewPanel** - Main container managing the preview experience
- **ServerControls** - Start/stop server controls and script selector
- **NavigationBar** - URL bar and navigation controls
- **PreviewFrame** - Iframe container for rendering the preview
- **StatusIndicator** - Visual server status display badge
- **LogsPanel** - Server output and error logs display

### File Structure
```
preview/
├── index.js                    # Named export
├── LivePreviewPanel.jsx        # Main component
├── LivePreviewPanel.hook.js    # Custom hooks and state management
├── LivePreviewPanel.logic.js   # Business logic functions
├── LivePreviewPanel.styles.js  # Styled components using @emotion/styled
├── LivePreviewPanel.stories.jsx # Storybook stories
├── README.md                   # This file
│
├── NavigationBar/              # Navigation controls sub-component
│   ├── index.js
│   ├── NavigationBar.jsx
│   ├── NavigationBar.styles.js
│   └── NavigationBar.stories.jsx
│
├── ServerControls/             # Server control buttons and script selector
│   ├── index.js
│   ├── ServerControls.jsx
│   ├── ServerControls.styles.js
│   └── ServerControls.stories.jsx
│
├── StatusIndicator/            # Server status badge
│   ├── index.js
│   ├── StatusIndicator.jsx
│   ├── StatusIndicator.styles.js
│   └── StatusIndicator.stories.jsx
│
├── LogsPanel/                  # Server logs display
│   ├── index.js
│   ├── LogsPanel.jsx
│   ├── LogsPanel.styles.js
│   └── LogsPanel.stories.jsx
│
└── PreviewFrame/              # Iframe preview container
    ├── index.js
    ├── PreviewFrame.jsx
    ├── PreviewFrame.styles.js
    └── PreviewFrame.stories.jsx
```

## Key Features

### Server Management
- Start/stop development server
- Script selection from package.json
- Automatic port detection
- Server process management
- Graceful shutdown handling
- Error recovery

### Live Preview
- Real-time page rendering
- Iframe-based isolation
- Auto-refresh on server ready
- Responsive viewport
- Full-screen preview option
- External browser launch

### Navigation Controls
- URL display and editing
- Manual navigation input
- Refresh preview button
- Back/forward controls (planned)
- Copy URL functionality
- HTTPS/HTTP indicator

### Server Monitoring
- Real-time log streaming
- Color-coded log levels
- Scrollable log history
- Clear logs functionality
- Auto-scroll to bottom
- Error highlighting

### Status Indication
- Visual server states:
  - `stopped` - Gray indicator
  - `starting` - Yellow pulsing
  - `running` - Green solid
  - `stopping` - Yellow pulsing
  - `error` - Red indicator
- Status text display
- Transition animations

## State Management

The feature uses React hooks for state management:
- **useLivePreview** - Main state management
- **useServerControl** - Server lifecycle management
- **useNavigation** - Preview navigation state
- **useLogManagement** - Log collection and display

## Props Interface

```typescript
interface LivePreviewPanelProps {
  selectedProject: Project | null;
  serverStatus: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  serverUrl: string;
  availableScripts: string[];
  onStartServer: (script: string) => void;
  onStopServer: () => void;
  onScriptSelect: (script: string) => void;
  currentScript: string;
  onClose?: () => void; // Mobile only
  isMobile: boolean;
  serverLogs: LogEntry[];
  onClearLogs: () => void;
}
```

## Usage Example

```jsx
import { LivePreviewPanel } from '@/features/preview';

function App() {
  const [serverStatus, setServerStatus] = useState('stopped');
  const [serverUrl, setServerUrl] = useState('');
  const [serverLogs, setServerLogs] = useState([]);

  return (
    <LivePreviewPanel
      selectedProject={currentProject}
      serverStatus={serverStatus}
      serverUrl={serverUrl}
      availableScripts={['dev', 'start', 'preview']}
      onStartServer={handleStartServer}
      onStopServer={handleStopServer}
      onScriptSelect={handleScriptSelect}
      currentScript="dev"
      onClose={handleClose}
      isMobile={false}
      serverLogs={serverLogs}
      onClearLogs={() => setServerLogs([])}
    />
  );
}
```

## Styling Approach

All components use:
- **@emotion/styled** - CSS-in-JS styling
- **twin.macro** - Tailwind CSS integration
- Consistent spacing and colors
- Theme-aware design
- Responsive breakpoints
- Smooth transitions

## Performance Considerations

- Iframe sandboxing for security
- Debounced log updates
- Virtual scrolling for logs (planned)
- Memoized renders
- Cleanup on unmount
- Resource monitoring

## Mobile Support

- Responsive layout
- Touch-friendly controls
- Collapsible panels
- Optimized spacing
- Swipe gestures (planned)
- Full functionality maintained

## Error Handling

- Server start failures
- Port conflicts
- Network errors
- Invalid URLs
- Process crashes
- Graceful recovery

## Security Considerations

- Iframe sandbox attributes
- Local server only
- No external access
- Input sanitization
- CSP compliance

## Future Enhancements

- Multiple server support
- Browser DevTools integration
- Network request monitoring
- Performance profiling
- Device emulation
- HAR file export

## Testing

- Component unit tests
- Integration tests
- Server mock utilities
- Storybook stories
- E2E preview tests