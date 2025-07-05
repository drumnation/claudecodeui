# Settings Feature

The Settings feature provides comprehensive configuration management for Claude Code UI. It enables users to customize their development environment, manage tool permissions, configure appearance preferences, and control various application behaviors.

## Overview

The Settings feature offers a centralized location for all application preferences and configurations. It includes tool permission management, theme customization, behavioral toggles, and security settings - all with a user-friendly interface that persists preferences across sessions.

## Components Structure

### Main Component
- **ToolsSettings** - Modal-based settings interface with categorized sections

### Sub-components
- **ToolCard** - Individual tool permission card with toggle
- **SettingToggle** - Reusable toggle component for boolean settings
- **ToolInputSection** - Input fields for allowed/disallowed tools
- **ThemeToggle** - Shared theme switching component (in shared-components)

### File Structure
```
settings/
├── index.js
├── ToolsSettings.jsx
├── ToolsSettings.styles.js
├── ToolsSettings.hook.js
├── ToolsSettings.logic.js
├── ToolsSettings.stories.jsx
├── README.md
├── components/
│   ├── ToolCard.jsx
│   ├── SettingToggle.jsx
│   └── ToolInputSection.jsx
```

## Key Features

### Tool Permissions
- Enable/disable individual tools
- Visual tool cards with descriptions
- Security level indicators
- Grouped by category
- Quick enable/disable all
- Custom tool additions

### Appearance Settings
- Dark/light theme toggle
- Theme persistence
- System theme detection
- Smooth theme transitions
- Component-wide theming
- Custom color schemes (planned)

### Behavioral Settings
- Skip permission prompts
- Auto-save preferences
- Notification controls
- Performance options
- Privacy settings
- Advanced configurations

### Security Management
- Tool access control
- Allowed tools whitelist
- Disallowed tools blacklist
- Permission explanations
- Risk indicators
- Security recommendations

## Available Tools

### Common Tools
- **Bash** - Execute shell commands
- **Edit** - Modify file contents
- **Write** - Create new files
- **Read** - View file contents
- **Task** - Launch autonomous agents
- **WebSearch** - Search the internet
- **WebFetch** - Fetch web content
- **Grep** - Search file contents
- **Glob** - Find files by pattern
- **LS** - List directory contents

### Tool Categories
- File System Operations
- Code Modification
- Information Retrieval
- System Commands
- Network Operations

## State Management

The feature uses React hooks for state management:
- **useToolsSettings** - Main settings state and operations
- **useToolPermissions** - Tool enable/disable logic
- **useThemePreference** - Theme management
- **useSettingsPersistence** - Save/load preferences

## Settings Storage

### Local Storage Keys
- `claude-tools-settings` - Tool permissions
- `claude-theme-preference` - Theme selection
- `claude-allowed-tools` - Allowed tools list
- `claude-disallowed-tools` - Disallowed tools list
- `claude-skip-permissions` - Permission prompts

### Settings Structure
```javascript
{
  enabledTools: {
    bash: true,
    edit: true,
    write: false,
    // ...
  },
  theme: 'dark' | 'light' | 'system',
  skipPermissions: false,
  allowedTools: ['custom-tool-1'],
  disallowedTools: ['dangerous-tool']
}
```

## UI/UX Features

### Modal Interface
- Overlay backdrop
- Smooth open/close animations
- Keyboard navigation
- Escape to close
- Click outside to close
- Scroll lock when open

### Visual Design
- Categorized sections
- Clear typography
- Icon indicators
- Color-coded states
- Responsive layout
- Accessible controls

### Interaction Patterns
- Toggle switches
- Text inputs
- Save confirmation
- Reset to defaults
- Undo capabilities
- Validation feedback

## Integration Points

- **Theme Context** - Global theme provider
- **Permission System** - Tool authorization
- **Local Storage** - Settings persistence
- **WebSocket** - Real-time updates
- **Analytics** - Usage tracking

## Security Considerations

- Tool permission validation
- Input sanitization
- XSS prevention
- Secure defaults
- Permission explanations
- Audit logging

## Performance Optimizations

- Lazy modal loading
- Debounced saves
- Memoized renders
- Efficient re-renders
- Minimal bundle size
- Fast setting lookups

## Accessibility

- Keyboard navigation
- ARIA labels and roles
- Focus management
- Screen reader support
- High contrast support
- Reduced motion options

## Usage Example

```jsx
import { ToolsSettings } from '@/features/settings';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <button onClick={() => setShowSettings(true)}>
        Open Settings
      </button>
      
      {showSettings && (
        <ToolsSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
```

## Props

- `isOpen` - Boolean to control modal visibility
- `onClose` - Callback when modal should close

## Future Enhancements

- Profile management
- Import/export settings
- Sync across devices
- Keyboard shortcuts config
- Plugin management
- Advanced tool configs

## Testing

- Component unit tests
- Settings persistence tests
- Integration tests
- Accessibility tests
- Storybook stories