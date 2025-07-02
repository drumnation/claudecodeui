# Projects Module

This module handles all project-related functionality in a functional, dependency-injected architecture.

## Architecture

The module is organized into distinct layers with clear responsibilities:

### 1. Types (`projects.types.ts`)
- All TypeScript interfaces and type definitions
- Shared across all layers
- No implementation logic

### 2. Repository Layer (`projects.repository.ts`)
- File system operations
- JSONL file reading/writing
- Directory management
- Pure functions that interact with the file system
- All functions accept dependencies as parameters (e.g., `homePath`)

### 3. Service Layer (`projects.service.ts`)
- Business logic and data transformation
- Session parsing and aggregation
- Display name generation
- Project building
- All functions are pure and accept dependencies

### 4. Controller Layer (`projects.controller.ts`)
- HTTP request/response handling
- Input validation
- Error handling
- Delegates to service layer for business logic
- Express route handlers

### 5. Watcher (`projects.watcher.ts`)
- File system watching functionality
- WebSocket broadcasting
- Event handling for project changes
- Accepts chokidar and other dependencies via injection

## Key Design Principles

1. **Functional Programming**: No classes, only pure functions
2. **Dependency Injection**: All dependencies passed as parameters
3. **Separation of Concerns**: Clear boundaries between layers
4. **Testability**: Each function can be tested in isolation
5. **Type Safety**: Full TypeScript types throughout

## Usage Example

```typescript
import * as projectsController from './src/modules/projects/index.js';

// In Express routes
app.get('/api/projects', projectsController.getProjects);
app.get('/api/projects/:projectName/sessions', projectsController.getSessionsHandler);

// Using service functions directly
import { getSessions } from './src/modules/projects/index.js';
const sessions = await getSessions(homePath, projectName, limit, offset);

// Setting up watcher
import { createProjectWatcher } from './src/modules/projects/index.js';
const watcher = createProjectWatcher(
  { chokidar, homePath },
  { onProjectAdded, onProjectRemoved, onProjectChanged }
);
```

## Data Flow

1. HTTP Request → Controller
2. Controller → Service (with dependencies)
3. Service → Repository (for file operations)
4. Repository → File System
5. Response flows back through the layers

## File System Structure

Projects are stored in `~/.claude/projects/` with the following structure:
- Each project is a directory named with path encoding (e.g., `/Users/foo` → `-Users-foo`)
- Sessions are stored in JSONL files within each project directory
- A global `project-config.json` stores custom display names and metadata