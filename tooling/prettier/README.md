# @kit/prettier-config

> Shared Prettier configuration for consistent code formatting across the monorepo

## Overview

`@kit/prettier-config` provides a centralized Prettier configuration to ensure consistent code formatting throughout all packages in the monorepo. It emphasizes readability and git-friendly formatting choices.

## Installation

```bash
pnpm add -D @kit/prettier-config prettier
```

## Usage

### In package.json (Recommended)

The simplest way to use the shared configuration:

```json
{
  "prettier": "@kit/prettier-config"
}
```

### In .prettierrc.json

```json
"@kit/prettier-config"
```

### In prettier.config.js

For extending or overriding the configuration:

```javascript
import prettierConfig from '@kit/prettier-config';

export default {
  ...prettierConfig,
  // Your overrides
  printWidth: 100,
};
```

### In prettier.config.mjs (ESM)

```javascript
import prettierConfig from '@kit/prettier-config';

export default prettierConfig;
```

## Configuration Details

Our Prettier configuration uses these settings:

| Option            | Value    | Rationale                                   |
| ----------------- | -------- | ------------------------------------------- |
| `tabWidth`        | `2`      | Compact indentation, standard for JS/TS     |
| `useTabs`         | `false`  | Spaces for consistent rendering             |
| `semi`            | `true`   | Explicit statement termination              |
| `printWidth`      | `80`     | Fits most screens, encourages readable code |
| `singleQuote`     | `true`   | Cleaner for JS/TS, less visual noise        |
| `arrowParens`     | `always` | Consistent arrow function syntax            |
| `endOfLine`       | `auto`   | Works across different operating systems    |
| `bracketSpacing`  | `false`  | Compact object literals: `{foo: bar}`       |
| `bracketSameLine` | `false`  | JSX closing bracket on new line             |

## Scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "format": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:fix": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:changed": "prettier --check $(git diff --name-only HEAD)",
    "format:staged": "prettier --check $(git diff --cached --name-only)"
  }
}
```

## IDE Integration

### VS Code

1. Install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
2. Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### IntelliJ IDEA / WebStorm

1. Go to Settings → Tools → Prettier
2. Set Prettier package path to `node_modules/prettier`
3. Enable "Run on save" for desired file types
4. Use automatic Prettier configuration detection

## Ignoring Files

Create `.prettierignore` in your project root:

```
# Dependencies
node_modules
pnpm-lock.yaml

# Build outputs
dist
build
coverage
.next
.turbo

# Generated files
*.generated.ts
*.d.ts

# IDE
.vscode
.idea

# Other
*.min.js
*.min.css
```

## ESLint Integration

When using with `@kit/eslint-config`, Prettier handles formatting while ESLint handles code quality. They're configured to work together without conflicts.

1. Install both configs:

   ```bash
   pnpm add -D @kit/prettier-config @kit/eslint-config prettier eslint
   ```

2. Configure both in package.json:

   ```json
   {
     "prettier": "@kit/prettier-config",
     "eslintConfig": {
       "extends": ["@kit/eslint-config/base"]
     }
   }
   ```

3. Run both in your lint script:
   ```json
   {
     "scripts": {
       "lint": "eslint . && prettier --check .",
       "lint:fix": "eslint . --fix && prettier --write ."
     }
   }
   ```

## Git Hooks

Use `husky` and `lint-staged` for automatic formatting:

1. Install dependencies:

   ```bash
   pnpm add -D husky lint-staged
   ```

2. Add to package.json:

   ```json
   {
     "lint-staged": {
       "*.{ts,tsx,js,jsx,json,md}": ["prettier --write", "git add"]
     }
   }
   ```

3. Set up husky:
   ```bash
   npx husky init
   echo "npx lint-staged" > .husky/pre-commit
   ```

## CI Integration

### GitHub Actions

```yaml
name: Format Check

on: [push, pull_request]

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm format
```

## Overriding Configuration

For project-specific needs, you can extend the base configuration:

```javascript
// prettier.config.js
import baseConfig from '@kit/prettier-config';

export default {
  ...baseConfig,
  // Different print width for documentation
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
  ],
};
```

## Philosophy

Our formatting choices prioritize:

1. **Readability** - Code should be easy to scan and understand
2. **Consistency** - Same formatting rules everywhere reduce cognitive load
3. **Git-friendliness** - Minimize diff noise in pull requests
4. **Tool compatibility** - Work well with TypeScript, ESLint, and other tools
5. **Team agreement** - Defaults that most developers are comfortable with

## Troubleshooting

### Prettier not running

- Ensure Prettier is installed: `pnpm list prettier`
- Check configuration is loaded: `npx prettier --print-config .`
- Verify file isn't ignored: `npx prettier --check path/to/file.ts`

### Conflicts with ESLint

- Make sure you're using `@kit/eslint-config` which is pre-configured to work with Prettier
- Run `pnpm lint:fix` to see if issues are auto-fixable
- Check for conflicting rules in local ESLint overrides

### Different formatting in CI vs local

- Ensure same Prettier version: Check `package.json` and lock file
- Verify `.prettierignore` is committed
- Check for local IDE formatting overrides

## License

MIT
