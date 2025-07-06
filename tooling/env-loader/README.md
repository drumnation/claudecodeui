# @kit/env-loader

Centralized environment variable loader for monorepo applications. Provides consistent environment variable loading across all packages with separate implementations for Node.js and browser environments.

## Features

- 🏗️ **Monorepo-aware** - Automatically detects monorepo root via `pnpm-workspace.yaml`
- 📦 **Hierarchical loading** - Root `.env` → Local `.env` → Defaults
- 🌐 **Universal** - Separate exports for Node.js and browser environments
- 🔒 **Type-safe** - Full TypeScript support with proper types
- 🚀 **Hot-reload friendly** - Direct TypeScript imports for development
- 🎯 **Framework agnostic** - Works with Vite, webpack, Next.js, etc.

## Installation

```bash
pnpm add @kit/env-loader
```

## Usage

### Node.js Applications (Backend, CLI tools)

```typescript
import {loadEnvironment, getEnv, requireEnv} from '@kit/env-loader/node';

// Load environment variables at app startup
const result = loadEnvironment({
  appName: 'backend-api',
  debug: true,
  required: ['DATABASE_URL', 'API_KEY'],
});

if (!result.success) {
  console.error(
    'Missing required environment variables:',
    result.missingRequired,
  );
  process.exit(1);
}

// Use environment variables
const port = getEnv('PORT', '3000');
const apiKey = requireEnv('API_KEY'); // Throws if not found
const debugMode = getBoolEnv('DEBUG', false);
const maxConnections = getIntEnv('MAX_CONNECTIONS', 10);
```

### Browser Applications (Frontend)

```typescript
import {getEnv, requireEnv, getBoolEnv} from '@kit/env-loader/browser';

// Get environment variables (works with Vite, webpack, etc.)
const apiUrl = getEnv('VITE_API_URL', 'http://localhost:3000');
const publicKey = requireEnv('VITE_PUBLIC_KEY');
const enableAnalytics = getBoolEnv('VITE_ENABLE_ANALYTICS', false);

// Get all public environment variables
import {getFilteredEnv} from '@kit/env-loader/browser';
const publicEnv = getFilteredEnv({prefix: 'VITE_'});
```

## Environment Variable Loading Order

1. **Root `.env`** - Located at monorepo root (highest priority)
2. **Local `.env`** - Located in current package directory
3. **Default `.env`** - Fallback location

Variables defined in earlier locations take precedence over later ones.

## API Reference

### Node.js API (`@kit/env-loader/node`)

#### `loadEnvironment(options)`

Loads environment variables from `.env` files.

```typescript
interface EnvLoaderOptions {
  appName?: string; // For logging (default: 'Unknown App')
  debug?: boolean; // Enable debug logging (default: false)
  required?: string[]; // Required variable names
  rootDir?: string; // Monorepo root (auto-detected if not provided)
  envPrefix?: string; // Filter prefix for getFilteredEnv
}

interface EnvLoadResult {
  loadedPaths: string[]; // Paths of loaded .env files
  missingRequired: string[]; // Names of missing required variables
  rootEnvFound: boolean; // Whether root .env was found
  success: boolean; // All required variables present
}
```

#### Helper Functions

- `getEnv(name: string, defaultValue?: string): string | undefined`
- `requireEnv(name: string): string` - Throws if not found
- `getIntEnv(name: string, defaultValue?: number): number | undefined`
- `getBoolEnv(name: string, defaultValue?: boolean): boolean | undefined`
- `getFilteredEnv(prefix?: string): Record<string, string | undefined>`

### Browser API (`@kit/env-loader/browser`)

#### Helper Functions

Same as Node.js API but without `loadEnvironment` (bundlers handle loading).

#### `getFilteredEnv(options)`

Get all environment variables with optional prefix filter.

```typescript
interface BrowserEnvOptions {
  prefix?: string; // Filter prefix (default: 'VITE_')
  debug?: boolean; // Enable debug logging
}
```

#### `initBrowserEnv(env)`

Initialize browser environment from runtime config.

```typescript
// Inject environment at runtime (e.g., from server config)
initBrowserEnv({
  VITE_API_URL: 'https://api.production.com',
  VITE_FEATURE_FLAG: 'true',
});
```

## Best Practices

### 1. Environment File Location

```txt
monorepo-root/
├── .env                 # Shared variables
├── apps/
│   ├── frontend/
│   │   └── .env        # Frontend-specific overrides
│   └── backend/
│       └── .env        # Backend-specific overrides
```

### 2. Variable Naming Conventions

- **Public/Frontend**: Prefix with `VITE_`, `NEXT_PUBLIC_`, etc.
- **Private/Backend**: No special prefix, e.g., `DATABASE_URL`, `API_SECRET`
- **Shared**: Use clear names, e.g., `NODE_ENV`, `LOG_LEVEL`

### 3. Security

- Never commit `.env` files to version control
- Use `.env.example` files to document required variables
- Frontend variables are exposed to browsers - never include secrets
- Use `required` option to validate critical variables at startup

### 4. TypeScript

Create a type declaration file for your environment variables:

```typescript
// types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    DATABASE_URL: string;
    API_KEY: string;
  }
}

// For Vite projects
interface ImportMetaEnv {
  VITE_API_URL: string;
  VITE_PUBLIC_KEY: string;
  VITE_ENABLE_ANALYTICS?: string;
}
```

## Framework Integration

### Vite

```typescript
// vite.config.ts
import {loadEnvironment} from '@kit/env-loader/node';

export default defineConfig(() => {
  // Load env vars for Vite config
  loadEnvironment({debug: true});

  return {
    server: {
      port: parseInt(process.env['PORT'] || '5173'),
    },
  };
});
```

### Next.js

```typescript
// next.config.js
import {loadEnvironment} from '@kit/env-loader/node';

loadEnvironment({required: ['DATABASE_URL']});

export default {
  env: {
    apiUrl: process.env['API_URL'],
  },
};
```

### Express/Node.js

```typescript
// server.ts
import {loadEnvironment} from '@kit/env-loader/node';

const env = loadEnvironment({
  appName: 'api-server',
  required: ['DATABASE_URL', 'JWT_SECRET'],
  debug: process.env['NODE_ENV'] === 'development',
});

if (!env.success) {
  console.error('Failed to load environment:', env.missingRequired);
  process.exit(1);
}
```

## Troubleshooting

### Variables not loading

1. Check debug output: `loadEnvironment({ debug: true })`
2. Verify `.env` file location and syntax
3. Ensure variables aren't already set in shell

### Browser variables undefined

1. Ensure using correct prefix (e.g., `VITE_`)
2. Restart dev server after changing `.env`
3. Check bundler configuration

### Monorepo root not detected

Explicitly provide root directory:

```typescript
loadEnvironment({
  rootDir: path.resolve(__dirname, '../../..'),
});
```
