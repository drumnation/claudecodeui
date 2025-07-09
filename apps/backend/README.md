# Claude Code UI Backend (TypeScript)

This is the new TypeScript backend for Claude Code UI, replacing the legacy JavaScript implementation.

## Architecture

The backend is organized using a modular, feature-based architecture:

```
src/
├── modules/           # Feature modules
│   ├── claude-cli/   # Claude CLI integration
│   ├── projects/     # Project management
│   ├── sessions/     # Session management
│   └── ...
├── services/         # Core services
└── main.ts          # Application entry point
```

## Claude CLI Integration

The Claude CLI integration is the core feature that enables communication between the web UI and the Claude CLI tool.

### Key Components

1. **ClaudeCliService** (`src/services/claude-cli.service.ts`)
   - Event-driven service that spawns and manages Claude CLI processes
   - Handles parsing of Claude's stream-JSON output format
   - Supports all Claude CLI features (sessions, tools settings, etc.)

2. **WebSocket Handler** (`src/modules/claude-cli/claude-cli.websocket.ts`)
   - Manages WebSocket connections for real-time communication
   - Tracks active Claude sessions
   - Handles session lifecycle (create, resume, abort)

3. **Message Types** (`src/modules/claude-cli/claude-cli.types.ts`)
   - TypeScript interfaces for all message types
   - Ensures type safety across the application

### Features

- **Session Management**: Create new sessions or resume existing ones
- **Tool Settings**: Configure allowed/disallowed tools per session
- **Real-time Updates**: Stream Claude's responses and status updates
- **Interactive Prompts**: Handle Claude's interactive questions
- **Process Management**: Gracefully handle process lifecycle and errors

### Testing

The Claude CLI integration has comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Test files:
- `claude-cli.service.test.ts` - Unit tests for the core service
- `claude-cli.websocket.test.ts` - Integration tests for WebSocket handling
- `claude-cli.handlers.test.ts` - Tests for connection handling

### WebSocket API

The backend exposes a WebSocket endpoint for Claude CLI communication:

#### Client → Server Messages

1. **claude-command**: Send a command to Claude
```typescript
{
  type: 'claude-command',
  command: string,
  options?: {
    projectPath?: string,
    cwd?: string,
    sessionId?: string,
    resume?: boolean,
    toolsSettings?: {
      allowedTools?: string[],
      disallowedTools?: string[],
      skipPermissions?: boolean
    }
  }
}
```

2. **abort-session**: Abort an active session
```typescript
{
  type: 'abort-session',
  sessionId: string
}
```

#### Server → Client Messages

1. **claude-response**: Claude's JSON responses
2. **claude-status**: Status updates (tokens, progress)
3. **claude-output**: Raw text output
4. **claude-interactive-prompt**: Interactive prompts
5. **session-created**: New session created
6. **stream-end**: Stream completed
7. **error**: Error messages

## Development

```bash
# Install dependencies
pnpm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Environment Variables

- `PORT`: Server port (default: 8765)
- `SESSION_SUMMARY_UPDATE_INTERVAL`: Message count interval for summary updates (default: 3)
- `SESSION_SUMMARY_UPDATE_DELAY`: Delay before updating summary in ms (default: 2000)

## Migration from JavaScript

This TypeScript implementation provides:
- Better type safety with full TypeScript support
- Modular architecture for better maintainability
- Comprehensive test coverage
- Improved error handling
- Modern async/await patterns

The API is compatible with the existing frontend, allowing for a seamless migration.