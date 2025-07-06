# @kit/eslint-config

> Shared ESLint configurations for consistent code quality across the monorepo

## Overview

`@kit/eslint-config` provides modular ESLint configurations for different types of projects, with TypeScript support, import sorting, and framework-specific rules.

## Installation

```bash
pnpm add -D @kit/eslint-config eslint
```

## Available Configurations

### Base Configuration

Core ESLint rules for all JavaScript/TypeScript projects.

```javascript
// eslint.config.js
export default {
  extends: ['@kit/eslint-config/base'],
};
```

Or in package.json:

```json
{
  "eslintConfig": {
    "extends": ["@kit/eslint-config/base"]
  }
}
```

### React Configuration

Includes React-specific rules and hooks validation.

```javascript
export default {
  extends: ['@kit/eslint-config/base', '@kit/eslint-config/react'],
};
```

### Storybook Configuration

For Storybook story files and documentation.

```javascript
export default {
  extends: [
    '@kit/eslint-config/base',
    '@kit/eslint-config/react',
    '@kit/eslint-config/storybook',
  ],
};
```

### Import Sorting

Automatic import organization and sorting.

```javascript
export default {
  extends: ['@kit/eslint-config/base', '@kit/eslint-config/sort'],
};
```

## Configuration Modules

| Module       | Purpose              | Key Rules                                    |
| ------------ | -------------------- | -------------------------------------------- |
| `base`       | Core JS/TS rules     | TypeScript, best practices, error prevention |
| `react`      | React & JSX          | Hooks, props validation, JSX best practices  |
| `apps`       | Application-specific | Stricter rules for apps vs libraries         |
| `services`   | Backend services     | Node.js specific, security                   |
| `playwright` | E2E tests            | Playwright testing patterns                  |
| `storybook`  | Story files          | Story naming, structure                      |
| `sort`       | Import sorting       | Consistent import organization               |

## Complete Setup Example

### Frontend Application

```javascript
// eslint.config.js
export default {
  root: true,
  extends: [
    '@kit/eslint-config/base',
    '@kit/eslint-config/react',
    '@kit/eslint-config/sort',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: ['dist', 'coverage', '*.config.js'],
};
```

### Backend Service

```javascript
export default {
  root: true,
  extends: [
    '@kit/eslint-config/base',
    '@kit/eslint-config/services',
    '@kit/eslint-config/sort',
  ],
};
```

### Component Library

```javascript
export default {
  root: true,
  extends: [
    '@kit/eslint-config/base',
    '@kit/eslint-config/react',
    '@kit/eslint-config/storybook',
    '@kit/eslint-config/sort',
  ],
};
```

## Import Sorting Configuration

The sort configuration organizes imports into groups:

1. **Built-in modules** - Node.js core modules
2. **External modules** - npm packages
3. **Internal modules** - Workspace packages
4. **Parent imports** - `../` imports
5. **Sibling imports** - `./` imports
6. **Index imports** - `./index` imports
7. **Type imports** - TypeScript type imports

Example result:

```typescript
// Built-in modules
import fs from 'fs';
import path from 'path';

// External modules
import React, {useState} from 'react';
import {render} from '@testing-library/react';

// Internal modules
import {Button} from '@company/ui';
import {useAuth} from '@company/auth';

// Parent imports
import {config} from '../config';

// Sibling imports
import {utils} from './utils';

// Type imports
import type {User} from '@company/types';
```

## Scripts

Add to your package.json:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "lint:strict": "eslint . --max-warnings 0"
  }
}
```

## IDE Integration

### VS Code

Install the ESLint extension and add to `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Customizing Rules

Override specific rules in your project:

```javascript
export default {
  extends: ['@kit/eslint-config/base'],
  rules: {
    // Override specific rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // Disable a rule
    'no-console': 'off',
  },
};
```

## Ignoring Files

Create `.eslintignore`:

```
# Dependencies
node_modules

# Build outputs
dist
build
coverage
.next
.turbo

# Generated files
*.generated.ts
*.d.ts

# Config files
*.config.js
*.config.ts
```

## Common Issues

### Parsing Error

Ensure TypeScript parser is configured:

```javascript
{
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  }
}
```

### Import Resolution

For custom path aliases:

```javascript
{
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json'
      }
    }
  }
}
```

### Performance

For large codebases, use `.eslintcache`:

```json
{
  "scripts": {
    "lint": "eslint . --cache --cache-location node_modules/.cache/eslint"
  }
}
```

## Philosophy

Our ESLint configurations follow these principles:

1. **Prevent bugs** - Catch common mistakes before runtime
2. **Consistent style** - Automated formatting via Prettier
3. **Best practices** - Encourage modern patterns
4. **Framework-specific** - Tailored rules per environment
5. **Gradual adoption** - Start with base, add modules as needed

## Migration from v1.x

If upgrading from v1.x (JavaScript configs) to v2.x (TypeScript configs):

1. Rename `.js` files to `.ts`
2. Update imports to use `.js` extensions
3. Apply new sorting rules: `pnpm lint:fix`
4. Address any new TypeScript-specific warnings

## License

MIT
