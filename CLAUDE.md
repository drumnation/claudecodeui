# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start development servers (frontend on :8766, backend on :8765, with ngrok)
npm run dev

# Start individual components
npm run server:dev    # Backend only (port 8765)
npm run client:dev    # Frontend only (port 8766)
npm run ngrok         # Ngrok tunnel for remote access

# Production
npm run build         # Build frontend
npm run start         # Build and start production server
npm run prod          # Production mode with PM2

# Utilities
npm run clean:dist    # Clean build artifacts
```

### Environment Setup
- Copy `.env.example` to `.env`
- Default ports: Frontend (8766), Backend API (8765)
- Optional: Set `OPENAI_API_KEY` for session summaries (fallback from Claude CLI)

## Architecture

### System Overview
This is a web UI for Claude Code CLI with three main components:

1. **Frontend (React/Vite)**: Single-page app with routing for sessions
2. **Backend (Express/WebSocket)**: API server handling Claude CLI integration
3. **Claude CLI Integration**: Spawned processes for each chat session

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
1. User input → ChatInterface → WebSocket message
2. Backend spawns Claude CLI with appropriate flags
3. Stream JSON output parsed and forwarded to frontend
4. Frontend renders messages, tool uses, and responses
5. Session protection prevents interruption during active chats

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

## Monorepo Structure and Configuration (v3) — pnpm + Turbo + ESM + @kit/testing

## ⚠️ CRITICAL STRUCTURAL UNDERSTANDING

This rule contains ESSENTIAL information about how the monorepo is structured.
It must be understood for ALL operations in the codebase.

IMPORTANT PRINCIPLES:
- Configuration is SHARED from central packages - DO NOT duplicate or override
- Package naming follows a strict pattern - DO NOT deviate
- Testing, linting, and building use shared tooling - DO NOT reinvent
- TypeScript configuration is ESM-first with optional dual CJS support

## 📂 Folder Purposes

```txt
/apps      Executable apps that consume packages
/packages  Libraries exported to apps
/tooling   Shared tooling (eslint, prettier, testing, tsconfig, etc.)
```

🏷 Naming Patterns

```txt
/apps      @[app-name]/*
/packages  @[app-name]/*
/tooling   @kit/*   ← reserved for shared tooling
```

## 🛠 TypeScript Configuration

### Shared Base Configurations in `@kit/tsconfig`

We provide three base configurations:

1. **base.json** - Core TypeScript settings with strict type checking
2. **node.json** - Node.js specific settings (extends base.json)
3. **react.json** - React-specific settings (extends base.json)

```json
// In package.json of @kit/tsconfig
{
  "exports": {
    "./base": "./base.json",
    "./node": "./node.json",
    "./react": "./react.json",
    ".": "./base.json"
  }
}
```

### Per-Package Configuration

Each package should extend from the appropriate base configuration and add minimal overrides:

```json
// For Node.js packages
{
  "extends": "@kit/tsconfig/node",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}

// For React packages
{
  "extends": "@kit/tsconfig/react",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

### ESM Configuration

For ESM packages with dual ESM/CJS output:

1. Create a base tsconfig.json for ESM output
2. Create a tsconfig.cjs.json for CommonJS output

```json
// tsconfig.cjs.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "outDir": "dist/cjs"
  }
}
```

## 📦 Package Configuration

### ESM-First Approach

```json
{
  "name": "@[app-name]/[package-name]",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.ts",
        "default": "./dist/cjs/index.js"
      }
    }
  },
  "main": "./dist/cjs/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

### Script Configuration

```json
{
  "scripts": {
    "clean": "rimraf dist node_modules/.cache",
    "format": "prettier --check \"**/*.{ts,tsx}\"",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "build": "pnpm build:clean && pnpm build:esm && pnpm build:cjs",
    "build:clean": "rimraf dist",
    "build:esm": "tsc",
    "build:cjs": "tsc --project tsconfig.cjs.json",
    
    /* ---- TEST SCRIPTS ---- */
    "test":              "turbo run test --filter={packageName}",
    "test:unit":         "vitest run --config @kit/testing/unit",
    "test:integration":  "vitest run --config @kit/testing/integration",
    "test:e2e":          "vitest run --config @kit/testing/e2e",
    "test:e2e:browser":  "playwright test --config @kit/testing/playwright"
  }
}
```

### Important ESM Rules

1. In TypeScript files, always use the `.js` extension in import paths, even when importing TypeScript files:

```typescript
// Correct for ESM
import { something } from './utils/something.js';

// Incorrect for ESM
import { something } from './utils/something';
```

2. Always use bracket notation to access properties from `Record<string, unknown>` or environment variables:

```typescript
// Correct
const value = options['propertyName'];
if (process.env['NODE_ENV'] === 'development') { ... }

// Incorrect - will cause TypeScript errors
const value = options.propertyName;
if (process.env.NODE_ENV === 'development') { ... }
```

## 🛠 Creating (or converting) a Library

1. If the library lives in ./apps/*

package.json

```json
{
  "name": "@[app-name]/[package-name]",
  "scripts": {
    "clean": "git clean -xdf .turbo node_modules",
    "format": "prettier --check \"**/*.{ts,tsx}\"",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",

    /* ---- TEST SCRIPTS ---- */
    "test":              "turbo run test --filter={packageName}",
    "test:unit":         "vitest run --config @kit/testing/unit",
    "test:integration":  "vitest run --config @kit/testing/integration",
    "test:e2e":          "vitest run --config @kit/testing/e2e",
    "test:e2e:browser":  "playwright test --config @kit/testing/playwright"
  },
  "devDependencies": {
    "@kit/tsconfig":        "workspace:*",
    "@kit/eslint-config":   "workspace:*",
    "@kit/prettier-config": "workspace:*",
    "@kit/testing":         "workspace:*"
  },
  "eslintConfig": {
    "root": true,
    "extends": [
      "@kit/eslint-config/base",
      "@kit/eslint-config/react",   // remove if not React
      "@kit/eslint-config/sort"
    ]
  },
  "prettier": "@kit/prettier-config"
}
```

Replace any unused test:* script with a no-op (echo 'n/a' && exit 0) if that scope doesn't apply.

2. If the library lives in ./packages/* (ESM with dual output)

```json
{
  "name": "@[app-name]/[package-name]",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.ts",
        "default": "./dist/cjs/index.js"
      }
    }
  },
  "main": "./dist/cjs/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "clean": "rimraf dist node_modules/.cache",
    "format": "prettier --check \"**/*.{ts,tsx}\"",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "build": "pnpm build:clean && pnpm build:esm && pnpm build:cjs",
    "build:clean": "rimraf dist",
    "build:esm": "tsc",
    "build:cjs": "tsc --project tsconfig.cjs.json"
  }
}
```

🪄 Shared tsconfig.json

```json
{
  "extends": "@kit/tsconfig/node", // or "@kit/tsconfig/react" for React packages
  "compilerOptions": {
    "tsBuildInfoFile": "node_modules/.cache/tsbuildinfo.json",
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

🏗 Root turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "outputs": ["dist/**"] },

    "test":             { "dependsOn": ["^build"], "outputs": [] },
    "test:unit":        { "outputs": [] },
    "test:integration": { "outputs": [] },
    "test:e2e":         { "outputs": [] },
    "test:e2e:browser": { "outputs": [] }
  }
}
```

🧪 @kit/testing Exports

| Export                              | Runner     | Purpose                        |
| ----- | ---- | --- |
| `@kit/testing/unit`                 | Vitest     | Unit tests                     |
| `@kit/testing/integration`          | Vitest     | Multi-module integration tests |
| `@kit/testing/e2e`                  | Vitest     | Backend / API E2E tests        |
| `@kit/testing/playwright`           | Playwright | Browser E2E flows              |
| `@kit/testing/playwright-backend`\* | Playwright | Optional non-UI E2E            |


* Only needed if you prefer Playwright for backend flows; Vitest e2e remains default.

📘 pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

✅ Quick Start

- pnpm install

- Add/convert libraries following the folder rules above.

- Run pnpm turbo run test at the repo root, or individual test:* scripts inside a package.

---

These shared configurations give you:

* **Clear TDD guidance** (agent-requested).  
* **Autonomous file-structure enforcement**.  
* **Universal functional-testing principles**.  
* **Turn-key monorepo setup** with Vitest + Playwright wired in.
* **ESM-first approach** with dual ESM/CJS support for compatibility.

## 🚨 Warning Signs - Stop and Reconsider if:

- You're about to create a duplicate configuration file that exists in a shared package
- You're planning to modify package.json without maintaining workspace dependencies
- You're creating a new package without following the monorepo structure
- You're introducing a new testing or linting approach without using shared configs
- You're using dot notation with dynamic objects or environment variables 