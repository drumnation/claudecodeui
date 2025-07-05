# QuickSettingsPanel Component

A slide-out settings panel that provides quick access to appearance and behavior settings.

## Structure

```
QuickSettingsPanel/
├── index.js                     # Named exports
├── QuickSettingsPanel.jsx       # Main component with sub-components
├── QuickSettingsPanel.hook.js   # Custom hook for state management
├── QuickSettingsPanel.logic.js  # Business logic and constants
├── QuickSettingsPanel.styles.js # Styled-components with twin.macro
└── QuickSettingsPanel.stories.jsx # Storybook stories
```

## Features

- **Dark Mode Toggle** - Switch between light and dark themes
- **Tool Display Settings** - Configure auto-expand and raw parameters display
- **View Options** - Control auto-scroll behavior
- **Whisper Dictation Modes** - Choose between default, prompt enhancement, and vibe modes

## Sub-components

- `PullTab` - Clickable tab to open/close the panel
- `AppearanceSection` - Dark mode settings
- `ToolDisplaySection` - Tool-related settings
- `ViewOptionsSection` - View behavior settings
- `WhisperDictationSection` - Whisper mode selection
- `WhisperModeOption` - Individual whisper mode radio option

## Usage

```jsx
import { QuickSettingsPanel } from '@/components/QuickSettingsPanel';

<QuickSettingsPanel
  isOpen={isOpen}
  onToggle={setIsOpen}
  autoExpandTools={autoExpandTools}
  onAutoExpandChange={setAutoExpandTools}
  showRawParameters={showRawParameters}
  onShowRawParametersChange={setShowRawParameters}
  autoScrollToBottom={autoScrollToBottom}
  onAutoScrollChange={setAutoScrollToBottom}
  isMobile={isMobile}
/>
```

## Styling

All styles are extracted to styled-components using `@emotion/styled` and `twin.macro`. No inline styles or Tailwind classes in the component files.

## State Management

State is managed through the `useQuickSettingsPanel` hook, which handles:
- Local panel open/close state
- Whisper mode persistence to localStorage
- Integration with ThemeContext for dark mode