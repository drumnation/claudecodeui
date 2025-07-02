# Claude CLI Module

This module provides a functional, modular interface for spawning and managing Claude CLI processes.

## Architecture

The module is organized into separate concerns following functional programming principles:

### Files

- **claude-cli.types.ts** - All TypeScript interfaces and type definitions
- **claude-cli.utils.ts** - Pure utility functions and session state management
- **claude-cli.service.ts** - Core service functions for process management
- **claude-cli.handlers.ts** - WebSocket integration handlers
- **index.ts** - Barrel exports for the module

### Key Design Principles

1. **No Classes** - All exports are functions, following functional programming patterns
2. **Dependency Injection** - Functions accept dependencies as parameters
3. **Pure Functions** - Service functions are pure where possible
4. **State Management** - Session state managed through closures in utils
5. **Separation of Concerns** - Each file has a specific responsibility

## Usage

```typescript
import { spawnClaude, handleAbortSession } from './src/modules/claude-cli/index.js';

// Spawn a new Claude session
await spawnClaude('Hello Claude', {
  cwd: '/path/to/project',
  toolsSettings: {
    allowedTools: ['read', 'write'],
    disallowedTools: [],
    skipPermissions: false
  }
}, websocket);

// Abort a session
const success = handleAbortSession('session-123');
```

## Session Management

The module maintains session state using a closure-based approach:

- Active processes tracked by session ID
- Message counts for continuous summary updates
- Manual edit flags to prevent automatic updates

## WebSocket Integration

The handlers module provides WebSocket-ready functions that:
- Send properly formatted messages
- Handle process lifecycle events
- Manage interactive prompts
- Stream status updates

## Testing

Unit tests are provided in `claude-cli.test.ts` covering utility functions and core logic.