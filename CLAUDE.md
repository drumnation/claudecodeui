Of course. Here is the updated `CLAUDE.md` file with the v4 monorepo tooling rules.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Start development servers (frontend on :8766, backend on :8765, with ngrok)
pnpm run dev

# Start individual components
pnpm run server:dev    # Backend only (port 8765)
pnpm run client:dev    # Frontend only (port 8766)
pnpm run ngrok         # Ngrok tunnel for remote access

# Production
pnpm run build         # Build frontend
pnpm run start         # Build and start production server
pnpm run prod          # Production mode with PM2

# Utilities
pnpm run clean:dist    # Clean build artifacts
```

### Environment Setup

  - Copy `.env.example` to `.env`
  - Default ports: Frontend (8766), Backend API (8765)
  - Optional: Set `OPENAI_API_KEY` for session summaries (fallback from Claude CLI)

## Architecture

### System Overview

This is a web UI for Claude Code CLI with three main components:

1.  **Frontend (React/Vite)**: Single-page app with routing for sessions
2.  **Backend (Express/WebSocket)**: API server handling Claude CLI integration
3.  **Claude CLI Integration**: Spawned processes for each chat session

### Key Architectural Patterns

#### WebSocket Communication

  - **Chat WebSocket** (`/ws`): Handles Claude CLI interactions, project updates, and server management
  - **Shell WebSocket** (`/shell`): Terminal emulation for direct Claude CLI access
  - Real-time project updates via file system watcher (chokidar)

#### Session Protection System

Located in `App.jsx`, this prevents project updates from interrupting active conversations:

  - Tracks active sessions in a Set
  - Marks sessions active when user sends message
  - Pauses project updates during conversations
  - Handles transition from temporary to real session IDs

#### Project Management

  - Projects discovered from `~/.claude/projects/`
  - JSONL files parsed for session history
  - Lazy loading of sessions (5 at a time with pagination)
  - Session summaries generated automatically or manually

#### Tools Security Model

  - All Claude Code tools disabled by default
  - Settings stored in localStorage
  - Three modes: allowed tools, disallowed tools, or skip permissions
  - Passed to Claude CLI via command-line flags

### Critical Files & Their Roles

#### Backend Integration Points

  - `server/claude-cli.js`: Claude CLI process spawning and message handling
  - `server/projects.js`: JSONL parsing and session management
  - `server/serverManager.js`: Development server lifecycle (npm scripts)
  - `server/slash-commands.js`: Claude CLI command discovery

#### Frontend State Management

  - `App.jsx`: Main routing, session protection, WebSocket message handling
  - `MainContent.jsx`: Tab management, active content display
  - `ChatInterface.jsx`: Message display, input handling, tool rendering
  - `utils/websocket.js`: WebSocket connection management

#### Component Organization

  - Components use `.jsx` files with accompanying `.logic.js` for business logic
  - Shared UI components in `components/ui/` (button, input, badge, scroll-area)
  - Complex components split into subcomponents (e.g., `ChatInterface/components/`)

### Message Flow

1.  User input → ChatInterface → WebSocket message
2.  Backend spawns Claude CLI with appropriate flags
3.  Stream JSON output parsed and forwarded to frontend
4.  Frontend renders messages, tool uses, and responses
5.  Session protection prevents interruption during active chats

### File System Integration

  - File tree browser limited to project directory
  - Read/write capabilities through Express endpoints
  - Binary file serving for images
  - Automatic backups on file save

### Development Server Integration

  - Discovers npm scripts from package.json
  - Manages server lifecycle per project
  - Streams logs to preview panel
  - Automatic port detection and iframe preview

## Important Implementation Details

### Session ID Handling

  - Temporary IDs (`new-session-*`) used before Claude CLI assigns real ID
  - Real session ID captured from `session-created` event
  - Graceful transition maintains UI state

### Project Path Encoding

  - Paths encoded as dashes in URL (e.g., `/Users/foo` → `-Users-foo`)
  - Metadata.json provides actual path mapping
  - Fallback logic attempts intelligent path reconstruction

### Summary Generation

  - First user message used as fallback summary
  - Filters out system messages containing "Caveat:"
  - Manual edits marked to prevent automatic updates
  - Continuous updates every N messages (configurable)

### Mobile Responsiveness

  - Breakpoint at 768px
  - Bottom navigation for mobile
  - Collapsible sidebar with overlay
  - Touch-friendly interactions

## Common Issues & Solutions

### Sessions Showing "Unknown"

  - Check JSONL parsing in `server/projects.js`
  - Ensure timestamps are properly set (`createdAt`, `updatedAt`)
  - Verify session summary generation logic

### WebSocket Reconnection

  - Auto-reconnect after 3 seconds
  - Connection state tracked in `useWebSocket` hook
  - Messages queued if connection drops

### Tool Permissions

  - Tools settings in `ToolsSettings.jsx`
  - Stored in localStorage as `claudeToolsSettings`
  - Applied via CLI flags in `claude-cli.js`

-----

# Monorepo Structure and Configuration (v4)

## ⚠️ CRITICAL STRUCTURAL UNDERSTANDING

This document contains ESSENTIAL information about how the monorepo is structured and the development philosophy behind it. It must be understood for ALL operations in the codebase.

### Core Principles

1.  **ESM-Only:** We exclusively use ES Modules. CommonJS (`require`, `module.exports`) is not used. This simplifies our tooling and aligns with the modern JavaScript ecosystem.
2.  **No Build Step for Libraries:** Packages in `/packages` are not "built" into a `dist` folder. We export TypeScript source files (`.ts`, `.tsx`) directly. A runtime transpiler (like `tsx`) handles this for us, enabling instantaneous hot-reloading and simpler debugging.
3.  **Configuration is SHARED:** All tooling configuration (ESLint, Prettier, TypeScript, Testing) is centralized in the `/tooling` directory and consumed by all other workspaces. **DO NOT** create duplicate or one-off configurations.
4.  **Strict Naming & Structure:** Packages and folder structures follow a strict, predictable pattern. **DO NOT** deviate from it.
5.  **Agent Coordination First:** Before running any command, always check the `_errors/` and `_logs/` directories managed by `@kit/brain-monitor` to prevent redundant work.

### Devil's Advocate: Why No CommonJS?

You're right to want to keep things simple with ESM-only. But for the sake of completeness, here's the trade-off:

  * **Pros (Our Approach):** Massively simplified build process (or lack thereof), single module system to reason about, aligns with web standards, and enables cleaner, more modern syntax like top-level `await`.
  * **Cons:** Dropping CJS means older Node.js environments or tools that *only* support `require()` cannot consume our packages natively. Since we control the entire stack within this monorepo and all our applications are ESM-compatible, this is a trade-off we gladly accept for the significant boost in developer experience and simplicity.

-----

## 📂 Monorepo Layout

```txt
/apps           Executable applications (e.g., servers, web frontends)
/packages       Shared libraries consumed by apps or other packages
/tooling        Shared tooling and configuration (`@kit/*`)
/_errors        Real-time validation failure reports (via @kit/brain-monitor)
/_logs          Real-time server logs (via @kit/brain-monitor)
```

### 🏷 Naming Patterns

Packages must be scoped to align with their location and purpose.

```txt
/apps           @[app-name]
/packages       @[app-name]/[package-name]
/tooling        @kit/*
```

-----

## 📦 Package Configuration (The "No Build" Way)

This is the most critical change from `v3`. Library packages in `/packages` **do not have a build step**.

### `package.json` Template for a Library

This is the standard template for any new or converted library in `/packages`.

```json
{
  "name": "@[app-name]/[package-name]",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    // Points directly to the TypeScript source file
    ".": "./src/index.ts",
    // Allows importing sub-modules directly
    "./*": "./src/*.ts"
  },
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "files": [
    "src"
  ],
  "scripts": {
    "clean": "rimraf node_modules .turbo",
    "format": "prettier --check \"**/*.{ts,tsx,md}\"",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@kit/env-loader": "workspace:*"
  },
  "devDependencies": {
    "@kit/eslint-config": "workspace:*",
    "@kit/prettier-config": "workspace:*",
    "@kit/testing": "workspace:*",
    "@kit/tsconfig": "workspace:*"
  },
  "eslintConfig": {
    "root": true,
    "extends": [
      "@kit/eslint-config/base"
    ]
  },
  "prettier": "@kit/prettier-config"
}
```

### `tsconfig.json` for a Library

Note the absence of `"outDir"` and `"declaration"`. We are not compiling to a separate directory.

```json
{
  "extends": "@kit/tsconfig/node", // or "@kit/tsconfig/react"
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

-----

## 🚀 Root `package.json` & Turbo Pipeline

The root `package.json` contains scripts that run across the entire monorepo using Turborepo. The `turbo.json` file configures the dependency graph and caching for these tasks.

### Root `package.json`

```json
{
  "name": "your-monorepo-name",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "clean": "turbo run clean",
    "format": "turbo run format",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",

    "test": "turbo run test",
    "test:watch": "turbo run test:watch",
    "test:unit": "turbo run test:unit",
    "test:integration": "turbo run test:integration",
    "test:e2e": "turbo run test:e2e",
    "test:storybook": "turbo run test:storybook",
    "test:e2e:browser": "turbo run test:e2e:browser",

    "brain:validate": "turbo run validate",
    "brain:logs": "pnpm --filter=@kit/brain-monitor run logs",
    "brain:typecheck-failures": "pnpm --filter=@kit/brain-monitor run typecheck-failures",
    "brain:test-failures": "pnpm --filter=@kit/brain-monitor run test-failures",
    "brain:lint-failures": "pnpm --filter=@kit/brain-monitor run lint-failures",
    "brain:format-failures": "pnpm --filter=@kit/brain-monitor run format-failures"
  },
  "devDependencies": {
    "turbo": "latest",
    "tsx": "latest",
    "typescript": "latest"
  },
  "packageManager": "pnpm@9.x.x"
}
```

### Root `turbo.json`

This pipeline is configured for our "no-build" library strategy and includes the agentic validation tasks.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "cache": true
    },
    "typecheck": {
      "cache": true
    },
    "test": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "validate": {
      "dependsOn": ["lint", "typecheck", "test"],
      "cache": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

  * **`build`**: Only applies to `apps`. `dist/**` and `.next/**` are specified as outputs for caching. Libraries have no `build` script, so Turbo ignores them for this task.
  * **`dev` / `test:watch`**: Marked as non-cacheable and persistent for long-running processes.
  * **`lint` / `typecheck` / `test`**: These tasks are fully cacheable. If the source files haven't changed, the results are pulled from the cache instantly.
  * **`validate`**: This is the master task for `@kit/brain-monitor`. It depends on all other validation tasks completing first.

-----

## 🧪 Unified Testing – `@kit/testing`

The `@kit/testing` package provides a unified, modern, and highly modular testing framework for the entire monorepo. It uses a lazy-loaded API to improve performance.

### Available Configurations & Modern API

Instead of importing a static config object, you now call an async function that returns a configuration. This is faster and more flexible.

| Legacy Export (v3)            | Modern API (v4)                         | Purpose                               |
| --------------------------------- | --------------------------------------------- | ------------------------------------- |
| `unitConfig`                      | `await configs.vitest.unit()`                 | Unit tests (Vitest + JSDOM)           |
| `integrationConfig`               | `await configs.vitest.integration()`          | Integration tests (Vitest + Node)     |
| `e2eConfig`                       | `await configs.vitest.e2e()`                  | Backend/API E2E tests (Vitest)        |
| `storybookConfig`                 | `await configs.vitest.storybook()`            | Storybook component tests (Vitest)    |
| `playwrightConfig`                | `await configs.playwright.browser()`          | Browser E2E tests (Playwright)        |
| `playwrightBackendConfig`         | `await configs.playwright.api()`              | Backend/API tests (Playwright)        |
| `storybookE2EConfig`              | `await configs.playwright.storybook()`        | Storybook E2E tests (Playwright)      |
| `testRunnerConfig`                | `await configs.storybook.testRunner()`        | For `@storybook/test-runner`          |

### Example `vitest.config.ts` (Modern API)

```typescript
// vitest.config.ts
import { mergeConfig } from 'vitest/config';
import { configs, presets } from '@kit/testing';

// Load the base configuration asynchronously
const baseConfig = await configs.vitest.unit();

// Merge with custom overrides using presets
export default mergeConfig(baseConfig, {
  test: {
    // Use a stricter coverage preset
    coverage: presets.coverage.strict,
    // Use a longer timeout preset
    ...presets.timeouts.medium,
  }
});
```

For the full API, migration steps, and available presets, see the detailed README in `tooling/testing/README.md`.

-----

## 🧠 Agent Coordination – `@kit/brain-monitor`

To prevent multiple AI agents from performing the same time-consuming tasks (like running tests or type-checking) and to provide a centralized place for debugging, we use `@kit/brain-monitor`.

**MANDATORY BEHAVIOR:** Before running any validation or server command, **ALWAYS check the `_errors/` and `_logs/` directories first.**

### Workflow

1.  **Check for Existing Errors:**

    ```bash
    # See if type-checking has already failed
    cat _errors/errors.typecheck-failures.md

    # See if any tests are failing
    cat _errors/errors.test-failures.md
    ```

2.  **Run Validation (Only if Needed):** If the reports are stale or empty, run the validation.

    ```bash
    # Run all validations and generate reports
    pnpm brain:validate

    # Or run just one
    pnpm brain:test-failures
    ```

3.  **Debug Servers:** Check logs before restarting a server.

    ```bash
    # Watch the API server log in real-time
    tail -f _logs/financial-api.log

    # Or start all dev servers with logging enabled
    pnpm dev
    ```

This workflow saves time and compute resources, and provides a clear task list for fixing issues. For full CLI details, see the README in `tooling/brain-monitor/README.md`.

-----

## 🔑 Environment Variables – `@kit/env-loader`

The `@kit/env-loader` package provides a standardized way to load and access environment variables across all applications and packages.

### Installation & Setup

It should be added as a dependency to any package that needs access to environment variables.

```bash
pnpm add @kit/env-loader
```

### Loading Order

The loader searches for `.env` files in a hierarchical order, with earlier locations taking precedence:

1.  **`monorepo-root/.env`**: Global variables shared across all apps.
2.  **`apps/my-app/.env`**: Local variables that override the global ones for a specific app.
3.  `process.env`: System-level environment variables (highest priority).

### Usage Example (Node.js Backend)

At the entry point of your application (`server.ts`, `index.ts`), load the environment.

```typescript
// In apps/backend/src/server.ts
import { loadEnvironment, requireEnv, getIntEnv } from '@kit/env-loader/node';

const result = loadEnvironment({
  appName: 'backend-api',
  required: ['DATABASE_URL', 'API_KEY']
});

if (!result.success) {
  console.error('FATAL: Missing required environment variables:', result.missingRequired);
  process.exit(1);
}

const PORT = getIntEnv('PORT', 8080);
const API_KEY = requireEnv('API_KEY'); // Throws an error if not found
```

### Usage Example (Browser Frontend)

In browser-based apps (e.g., Vite/React), the bundler exposes the variables. You only need the helper functions. **Remember to prefix public variables** (e.g., `VITE_`).

```typescript
// In apps/frontend/src/api/client.ts
import { getEnv, requireEnv } from '@kit/env-loader/browser';

const API_URL = getEnv('VITE_API_URL', 'http://localhost:8080');
const PUBLIC_KEY = requireEnv('VITE_STRIPE_PUBLIC_KEY');
```

This package does not require any `turbo.json` configuration as it runs at runtime within your application code. For more details, see `tooling/env-loader/README.md`.
> include docs/automation/CRITICAL-Error-Task-Lists.md
