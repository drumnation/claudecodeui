# Claude Code UI Server API Documentation

This document captures the exact behavior of all API endpoints in the current server implementation.

## Configuration Endpoints

### GET /api/config
- **Purpose**: Get user configuration
- **Response**: JSON object with user settings
- **Error**: Returns `{}` if config file doesn't exist

### POST /api/config  
- **Purpose**: Save user configuration
- **Body**: JSON configuration object
- **Response**: `{ success: true }`
- **Side Effects**: Creates `~/.claude/config.json`

### GET /api/slash-commands
- **Purpose**: Get available slash commands
- **Response**: `{ commands: [...] }` or `{ commands: [] }` if none exist

## Project Management Endpoints

### GET /api/projects
- **Purpose**: Get all projects with metadata
- **Response**: Object with project paths as keys
- **Project Object**:
  ```json
  {
    "name": "string",
    "displayName": "string", 
    "path": "string",
    "language": "string",
    "lastActivity": "ISO date string",
    "sessions": [],
    "isMonorepo": boolean,
    "monorepoType": "string",
    "subprojects": [],
    "isWorktree": boolean,
    "mainRepoPath": "string"
  }
  ```

### POST /api/projects/create
- **Purpose**: Create a new project
- **Body**: `{ path: string, name?: string }`
- **Response**: `{ success: true }`
- **Error**: 400 if path missing

### GET /api/projects/:project/sessions
- **Purpose**: Get project sessions with pagination
- **Query**: `?offset=0&limit=50`
- **Response**: 
  ```json
  {
    "sessions": [...],
    "hasMore": boolean,
    "nextOffset": number
  }
  ```

### PUT /api/projects/:project/sessions/:sessionId/summary
- **Purpose**: Update session summary
- **Body**: `{ summary: string }`
- **Response**: `{ success: true }`

### DELETE /api/projects/:project/sessions/:sessionId/delete
- **Purpose**: Delete a session
- **Response**: `{ success: true }`

### GET /api/projects/:project/sessions/:sessionId/messages
- **Purpose**: Get session messages
- **Response**: Array of message objects (JSONL parsed)

### POST /api/projects/:project/rename
- **Purpose**: Rename/move a project
- **Body**: `{ newPath: string }`
- **Response**: `{ success: true }`

### POST /api/projects/:project/delete
- **Purpose**: Delete a project
- **Response**: `{ success: true }`

## File Operations Endpoints

### GET /api/files/read
- **Purpose**: Read file content
- **Query**: `?path=absolute_path`
- **Response**: `{ content: string, path: string }`

### POST /api/files/save
- **Purpose**: Save file with backup
- **Body**: `{ path: string, content: string }`
- **Response**: `{ success: true }`
- **Side Effects**: Creates `.backup` file if original exists

### GET /api/files/tree
- **Purpose**: Get directory tree
- **Query**: `?path=dir_path&maxDepth=3`
- **Response**: Nested tree structure

### GET /api/files/binary
- **Purpose**: Stream binary file
- **Query**: `?path=file_path`
- **Response**: Binary stream with appropriate headers

## Utility Endpoints

### POST /api/audio/transcribe
- **Purpose**: Transcribe audio using Whisper
- **Body**: `{ audio: base64_string }`
- **Response**: `{ text: string }`
- **Note**: Requires OPENAI_API_KEY

### POST /api/generate-session-summary
- **Purpose**: Generate AI session summary
- **Body**: `{ projectPath: string, sessionId: string }`
- **Response**: `{ summary: string }`

### POST /api/manual-session-summary
- **Purpose**: Manually set session summary
- **Body**: `{ projectPath: string, sessionId: string, summary: string }`
- **Response**: `{ success: true }`

### POST /api/update-session-summary
- **Purpose**: Update existing session summary
- **Body**: `{ projectPath: string, sessionId: string, summary: string }`
- **Response**: `{ success: true }`

## Git Operations (from routes/git.js)

### GET /api/git/status
- **Query**: `?project=path`
- **Response**: Git status with file changes

### GET /api/git/diff
- **Query**: `?project=path&file=filename&staged=bool`
- **Response**: `{ diff: string }`

### POST /api/git/commit
- **Body**: `{ project: string, message: string, files?: string[] }`
- **Response**: `{ success: true, output: string }`

### GET /api/git/branches
- **Query**: `?project=path`
- **Response**: `{ current: string, local: [], remote: [] }`

### POST /api/git/checkout
- **Body**: `{ project: string, branch: string }`
- **Response**: `{ success: true }`

### POST /api/git/create-branch
- **Body**: `{ project: string, branch: string }`
- **Response**: `{ success: true }`

### GET /api/git/commits
- **Query**: `?project=path&limit=50&skip=0`
- **Response**: Array of commit objects

### GET /api/git/commit-diff
- **Query**: `?project=path&hash=commit_hash`
- **Response**: `{ diff: string }`

### POST /api/git/generate-commit-message
- **Body**: `{ project: string }`
- **Response**: `{ message: string }`

## WebSocket Endpoints

### WS /chat
- **Query**: `?project=path`
- **Messages**:
  - Client: `{ type: 'message', content: string }`
  - Server: `{ type: 'message'|'chunk'|'error', data: any }`

### WS /shell
- **Query**: `?cwd=path`
- **Messages**:
  - Client: `{ type: 'input', data: string }` or `{ type: 'resize', cols, rows }`
  - Server: `{ type: 'output', data: string }` or `{ type: 'exit', code: number }`

## Server Manager Endpoints

### POST /api/servers/start
- **Body**: `{ name: string, command: string, args: [], cwd: string }`
- **Response**: `{ success: true, port?: number, message: string }`

### POST /api/servers/stop
- **Body**: `{ name: string }`
- **Response**: `{ success: true }`

### GET /api/servers/status
- **Response**: Object with server statuses

### GET /api/servers/scripts
- **Query**: `?cwd=path`
- **Response**: Array of available npm scripts