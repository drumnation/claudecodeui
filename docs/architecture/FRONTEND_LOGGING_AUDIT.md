# Frontend Logging Audit Report

## Summary

The frontend codebase contains numerous violations of the @kit/logger rules. There are **50+ instances of console.* usage** across various files, no @kit/logger imports, and several areas that need improved logging for better debugging.

## Critical Issues Found

### 1. Console Method Usage (Rule 1 Violation)
All console.log/error/warn/info/debug calls need to be replaced with @kit/logger methods.

#### High Priority Files (Core functionality with errors):
- **src/app/main.jsx** (4 violations) - Main app entry with error boundaries
- **src/utils/websocket.js** (6 violations) - Critical WebSocket communication
- **src/shared-components/ErrorBoundary/ErrorBoundary.jsx** (3 violations) - Error handling component
- **src/features/git/GitPanel.hook.js** (18 violations) - Git operations with many error cases
- **src/hooks/useAudioRecorder.js** (6 violations) - Audio recording functionality
- **src/app/App/App.hook.js** (3 violations) - Main app logic

#### Medium Priority Files:
- **src/hooks/useConfirmation.js** (1 violation)
- **src/shared-components/MicButton/MicButton.hook.js** (3 violations)
- **src/shared-components/CodeEditor/CodeEditor.hook.js** (1 violation)
- **src/features/settings/ToolsSettings.hook.js** (1 violation)
- **src/features/backlog/BacklogBoard.hook.js** (4 violations)
- **src/features/terminal/Shell.hook.js** (Multiple violations)

#### Low Priority Files (Stories/Tests):
- **src/shared-components/MicButton/MicButton.stories.jsx** (2 violations)
- **src/shared-components/MicButton/MicButton.mobile.stories.jsx** (2 violations)
- **src/shared-components/Input/Input.stories.jsx** (1 violation)

### 2. String Concatenation in Logs (Rule 2 Violation)
Found template literals and concatenation in logs that need structured metadata:
- src/app/main.jsx: `console.log(\`[Mobile Debug] ${message}\`, data)`
- src/features/git/GitPanel.hook.js: Multiple error messages with concatenation

### 3. Missing Error Context (Rule 3 Violation)
Many catch blocks log errors without proper context:
```javascript
} catch (error) {
  console.error('Error fetching file diff:', error);
  // Missing: userId, projectId, fileName, operation details
}
```

### 4. High-Frequency Code Without Guards
Found setTimeout/setInterval usage with console logging that needs level checks:
- src/features/backlog/BacklogBoard.hook.js - Retry logic with console.log
- src/features/terminal/Shell.hook.js - Connection attempts

### 5. No Logger Imports
**Zero @kit/logger imports found** in the frontend codebase.

## Recommended Implementation Plan

### Phase 1: Setup Logger Infrastructure
1. Add @kit/logger to frontend package.json dependencies
2. Create logger instances for each feature module
3. Setup React context for logger propagation

### Phase 2: Critical Path Updates
1. **WebSocket Utils** - Critical for app communication
2. **Error Boundaries** - Centralized error handling
3. **Main App Entry** - Application lifecycle logging
4. **Git Panel** - Complex operations with many error cases

### Phase 3: Feature Module Updates
1. Audio Recorder
2. Backlog Board
3. Terminal/Shell
4. Settings
5. Code Editor

### Phase 4: Component Updates
1. MicButton
2. Confirmation hooks
3. Other shared components

### Phase 5: Cleanup
1. Remove console.* from Storybook files
2. Add ESLint rule to prevent console usage
3. Update developer documentation

## Logger Configuration Suggestions

### For React Components:
```typescript
import { useLogger } from '@kit/logger/react';

function MyComponent() {
  const logger = useLogger({ component: 'MyComponent' });
  // ...
}
```

### For Hooks and Utilities:
```typescript
import { createLogger } from '@kit/logger/browser';

const logger = createLogger({ scope: 'websocket-utils' });
```

### For High-Frequency Operations:
```typescript
if (logger.isLevelEnabled('debug')) {
  logger.debug('Retry attempt', { attempt: retryCount, delay });
}
```

## Noise Reduction Recommendations

1. **Set appropriate log levels**:
   - ERROR: Critical failures only
   - WARN: Degraded functionality
   - INFO: Important state changes
   - DEBUG: Development troubleshooting
   - TRACE: Detailed execution flow

2. **Use child loggers** for request/session context
3. **Implement log sampling** for high-frequency events
4. **Add structured metadata** instead of string messages

## Security Considerations
- Never log sensitive data (tokens, passwords, PII)
- Sanitize user input before logging
- Use redaction for sensitive fields

## Next Steps
1. Install @kit/logger in frontend
2. Start with critical path files (websocket, main.jsx, error boundaries)
3. Gradually migrate feature modules
4. Add linting rules to prevent regression