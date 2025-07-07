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
/apps          Executable applications (e.g., servers, web frontends)
/packages      Shared libraries consumed by apps or other packages
/tooling        Shared tooling and configuration (`@kit/*`)
/_errors        Real-time validation failure reports (via @kit/brain-monitor)
/_logs          Real-time server logs (via @kit/brain-monitor)
```

### 🏷 Naming Patterns

Packages must be scoped to align with their location and purpose.

```txt
/apps          @[app-name]
/packages      @[app-name]/[package-name]
/tooling       @kit/*
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

| Legacy Export (v3)                | Modern API (v4)                               | Purpose                               |
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

# AI Agent Rules for @kit/logger

This document provides rules and guidelines for AI agents (like Claude, GitHub Copilot, etc.) when working with code that uses the @kit/logger package.

## 🚫 STRICT RULES - NEVER VIOLATE

### Rule 1: No Console Methods

```typescript
// ❌ NEVER generate or suggest:
console.log('anything');
console.error('anything');
console.warn('anything');
console.info('anything');
console.debug('anything');

// ✅ ALWAYS use:
logger.info('message', {metadata});
logger.error('message', {error, context});
```

### Rule 2: No String Concatenation in Logs

```typescript
// ❌ NEVER:
logger.info('User ' + userId + ' logged in at ' + timestamp);
logger.error(`Failed to process ${orderId} for user ${userId}`);

// ✅ ALWAYS:
logger.info('User logged in', {userId, timestamp});
logger.error('Failed to process order', {orderId, userId});
```

### Rule 3: Security - Never Log Sensitive Data

```typescript
// ❌ NEVER log:
logger.info('User login', {password, token, apiKey, ssn, creditCard});

// ✅ SAFE to log:
logger.info('User login', {userId, email, timestamp});
```

## 📋 CONTEXT-BASED RULES

### When Creating New Files

1. **Import the correct logger based on environment:**

   ```typescript
   // For Node.js files (backend, scripts, tools)
   import {createLogger} from '@kit/logger/node';

   // For browser files (non-React)
   import {createLogger} from '@kit/logger/browser';

   // For React components
   import {useLogger} from '@kit/logger/react';
   ```

2. **Always create a scoped logger:**

   ```typescript
   // Node.js/Browser
   const logger = createLogger({scope: 'meaningful-name'});

   // React
   const logger = useLogger({component: 'ComponentName'});
   ```

### When Modifying Existing Files

1. **Check if logger exists before creating:**

   - Look for existing logger imports
   - Check if logger is passed as parameter
   - Don't create duplicate loggers

2. **Maintain consistent scope naming:**
   - Use the existing scope pattern in the file
   - Match the naming convention (camelCase, kebab-case, etc.)

### When Handling Errors

```typescript
// ALWAYS include full error context
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', {
    error,
    stack: error.stack,
    code: error.code,
    // Include relevant context
    userId,
    operationId,
    timestamp: Date.now(),
  });
  throw error; // Re-throw if needed
}
```

### When Working with High-Frequency Code

```typescript
// For code that runs frequently (loops, intervals, event handlers)
function handleFrequentEvent(data) {
  // ✅ Use level check
  if (logger.isLevelEnabled('debug')) {
    logger.debug('Frequent event', {data});
  }

  // Or use trace level
  logger.trace('Very frequent event', {minimalData});
}
```

## 🎯 SITUATIONAL RULES

### In React Components

```typescript
// ✅ CORRECT React usage
import {useLogger} from '@kit/logger/react';

function MyComponent({userId}) {
  const logger = useLogger({component: 'MyComponent'});

  useEffect(() => {
    logger.info('Component mounted', {userId});
  }, []);

  const handleClick = () => {
    logger.debug('Button clicked', {userId, timestamp: Date.now()});
  };
}
```

### In API Routes/Controllers

```typescript
// ✅ Use request logger from middleware
function handleRequest(req, res) {
  req.log.info('Processing request', {
    body: req.body,
    params: req.params,
  });

  try {
    const result = await process(req.body);
    req.log.info('Request successful', {resultId: result.id});
  } catch (error) {
    req.log.error('Request failed', {error});
  }
}
```

### In WebSocket Handlers

```typescript
// ✅ Create session logger
ws.on('connection', (socket) => {
  const sessionLogger = logger.child({
    sessionId: generateId(),
    clientId: socket.id,
  });

  socket.log = sessionLogger;
  sessionLogger.info('Client connected');
});
```

## 🔍 DETECTION PATTERNS

When you see these patterns, apply the corresponding rule:

| Pattern                         | Action                                 |
| ------------------------------- | -------------------------------------- |
| `console.log/error/warn`        | Replace with appropriate logger method |
| String concatenation in logs    | Convert to structured metadata         |
| Logging in loops without guards | Add `isLevelEnabled` check             |
| Missing error context           | Add error object and stack trace       |
| Hardcoded log messages          | Add meaningful metadata                |
| No logger in error catch        | Add error logging before handling      |

## 📊 LOG LEVEL SELECTION GUIDE

Choose the appropriate level based on the scenario:

```typescript
// ERROR - Something failed that shouldn't have
logger.error('Database connection failed', {error, dbHost});

// WARN - Something unexpected but handled
logger.warn('API rate limit approaching', {remaining: 10, limit: 100});

// INFO - Important business events
logger.info('Order completed', {orderId, amount, userId});

// DEBUG - Development and troubleshooting
logger.debug('Cache miss', {key, reason: 'expired'});

// TRACE - Very detailed debugging
logger.trace('Function entered', {args, callStack});
```

## 🚀 PERFORMANCE RULES

1. **Always check level for expensive operations:**

   ```typescript
   if (logger.isLevelEnabled('debug')) {
     const metrics = calculateExpensiveMetrics();
     logger.debug('Performance metrics', metrics);
   }
   ```

2. **Use child loggers for context:**

   ```typescript
   // ❌ BAD - Adding context to every call
   logger.info('Step 1', {requestId, userId});
   logger.info('Step 2', {requestId, userId});

   // ✅ GOOD - Create child logger once
   const reqLogger = logger.child({requestId, userId});
   reqLogger.info('Step 1');
   reqLogger.info('Step 2');
   ```

3. **Minimize logged data in production:**
   ```typescript
   // Use environment checks
   const logData =
     process.env.NODE_ENV === 'production' ? {id: user.id} : {...user};
   logger.info('User action', logData);
   ```

## 🔧 COMMON FIXES

### Fix 1: Migration from console

```typescript
// Before
console.log('Starting server on port', port);
console.error('Failed to start:', err);

// After
logger.info('Starting server', {port});
logger.error('Failed to start server', {error: err, port});
```

### Fix 2: Adding logger to existing module

```typescript
// Add to function parameters
- export function processData(data) {
+ export function processData(data, logger) {
    logger.info('Processing data', { size: data.length });
}

// Or create at module level
const logger = createLogger({ scope: 'data-processor' });
```

### Fix 3: Async error handling

```typescript
// Ensure errors are logged before propagating
async function riskyOperation() {
  try {
    return await externalAPI.call();
  } catch (error) {
    logger.error('External API call failed', {
      error,
      api: 'externalAPI',
      method: 'call',
    });
    throw error;
  }
}
```

## 📝 METADATA PATTERNS

Always include relevant context as structured data:

```typescript
// User operations
logger.info('User action', {
  userId,
  action: 'login',
  ip: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: Date.now(),
});

// System operations
logger.info('Cache operation', {
  operation: 'set',
  key,
  ttl: 3600,
  size: value.length,
});

// Performance tracking
logger.debug('Operation completed', {
  duration: Date.now() - startTime,
  success: true,
  itemsProcessed: items.length,
});
```

Remember: The goal is structured, searchable, performant logging that provides clear insights into application behavior without compromising security or performance.
