# @kit/tsconfig

> Shared TypeScript configurations for consistent type checking across the monorepo

## Overview

`@kit/tsconfig` provides base TypeScript configurations optimized for different environments (Node.js, React, libraries) with strict type checking and modern ECMAScript features.

## Installation

```bash
pnpm add -D @kit/tsconfig
```

## Available Configurations

### Base Configuration (`base.json`)

Core TypeScript settings with strict type checking enabled.

```json
{
  "extends": "@kit/tsconfig/base"
}
```

**Features:**

- Strict type checking enabled
- ES2022 target with ESNext module resolution
- Supports `.ts`, `.tsx`, `.mts`, `.cts` extensions
- Path aliases support
- Incremental compilation

### Node.js Configuration (`node.json`)

Optimized for Node.js applications and services.

```json
{
  "extends": "@kit/tsconfig/node",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Features:**

- Extends base configuration
- Node module resolution
- CommonJS interop enabled
- Synthetic default imports

### React Configuration (`react.json`)

Optimized for React applications with JSX support.

```json
{
  "extends": "@kit/tsconfig/react",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

**Features:**

- JSX support with React runtime
- DOM lib included
- Emotion/styled-components support
- React-specific optimizations

## Configuration Details

### Strict Type Checking

All configurations include TypeScript's strict mode flags:

- `strict`: true
- `noImplicitAny`: true
- `strictNullChecks`: true
- `strictFunctionTypes`: true
- `strictBindCallApply`: true
- `strictPropertyInitialization`: true
- `noImplicitThis`: true
- `alwaysStrict`: true

### Additional Checks

- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noImplicitReturns`: true
- `noFallthroughCasesInSwitch`: true
- `noUncheckedIndexedAccess`: true

## Usage Patterns

### Monorepo Package

```json
{
  "extends": "@kit/tsconfig/base",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "tsBuildInfoFile": "node_modules/.cache/tsbuildinfo.json"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

### Dual ESM/CJS Package

Create two config files:

**tsconfig.json** (ESM):

```json
{
  "extends": "@kit/tsconfig/node",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "module": "ESNext"
  }
}
```

**tsconfig.cjs.json** (CommonJS):

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "dist/cjs"
  }
}
```

### Build Scripts

```json
{
  "scripts": {
    "build": "pnpm build:clean && pnpm build:esm && pnpm build:cjs",
    "build:clean": "rimraf dist",
    "build:esm": "tsc",
    "build:cjs": "tsc --project tsconfig.cjs.json",
    "typecheck": "tsc --noEmit"
  }
}
```

## Path Aliases

Configure path aliases for cleaner imports:

```json
{
  "extends": "@kit/tsconfig/base",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

## Project References

For monorepo packages with dependencies:

```json
{
  "extends": "@kit/tsconfig/base",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "references": [{ "path": "../shared" }, { "path": "../utils" }]
}
```

## ESM Considerations

When using ES modules:

1. Always use `.js` extensions in imports:

   ```typescript
   import { something } from "./utils/something.js";
   ```

2. Use bracket notation for dynamic property access:

   ```typescript
   const value = process.env["NODE_ENV"];
   ```

3. Set `"type": "module"` in package.json

## Troubleshooting

### Cannot find module

Ensure your `tsconfig.json` includes the correct file patterns:

```json
{
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"]
}
```

### Path aliases not working

1. Ensure `baseUrl` is set
2. Configure your bundler (Vite, Webpack) to resolve the same aliases
3. For Jest, add `moduleNameMapper` configuration

### Slow compilation

Enable incremental compilation:

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "node_modules/.cache/tsbuildinfo.json"
  }
}
```

## Best Practices

1. **Extend, don't replace** - Always extend from base configurations
2. **Minimal overrides** - Only override what's necessary for your project
3. **Consistent structure** - Use `src` for source, `dist` for output
4. **Cache build info** - Store tsBuildInfo in node_modules/.cache
5. **Exclude tests** - Don't compile test files in production builds

## License

MIT
