# @kit/brain-monitor

> 🧠 Monorepo validation orchestrator with real-time log monitoring

## Overview

`@kit/brain-monitor` is a development utility that centralizes validation tasks and log monitoring for monorepo projects. It automatically detects available test suites, runs validations in parallel, and generates shared task-list markdown files that multiple AI agents can consume without conflicts.

## Features

- **🔍 Auto-detection**: Discovers test suites across your monorepo
- **📊 Unified reporting**: Generates markdown task lists in `_errors/`
- **📝 Real-time logging**: Streams dev server logs to `_logs/`
- **⚡ Parallel execution**: Runs multiple validations concurrently
- **👁️ Watch mode**: Continuous validation with file watching
- **🤖 AI-friendly**: Designed for multi-agent collaboration
- **🚀 Zero-config**: Works out of the box with standard monorepo patterns
- **🎯 CI/CD Integration**: Generates GitHub Actions workflows with PR comments
- **🧪 Local CI Testing**: Test workflows locally with act before pushing
- **🎨 Cursor IDE support**: Auto-installs validation rules for AI assistants
- **🌐 Browser Console Capture**: Automatically captures browser console logs to files

## Installation

```bash
# Install in your monorepo
pnpm add -D @kit/brain-monitor

# Initialize (adds scripts and documentation)
pnpm brain-monitor init
```

## Usage

### CLI Commands

```bash
# Run all validations (typecheck, lint, format, tests)
brain-monitor validate

# Watch mode for continuous validation
brain-monitor watch         # TypeScript + Lint only (fast)
brain-monitor watch --all   # All validations including tests

# Run specific validations
brain-monitor typecheck      # TypeScript only
brain-monitor lint          # ESLint only
brain-monitor format        # Prettier only
brain-monitor test <type>   # Specific test suite (e.g., unit)

# Monitor dev server logs (requires servers to be running)
brain-monitor logs

# Start dev servers WITH integrated logging (recommended)
brain-monitor dev

# CI/CD commands
brain-monitor ci:init       # Generate GitHub Actions workflows
brain-monitor ci:test       # Test workflows locally with act
brain-monitor ci:update     # Update existing workflows

# Initialize in a new project
brain-monitor init
```

### Package.json Scripts

After running `brain-monitor init`, these scripts are added:

```json
{
  "scripts": {
    "brain:validate": "brain-monitor validate",
    "brain:watch": "brain-monitor watch",
    "brain:typecheck-failures": "brain-monitor typecheck",
    "brain:lint-failures": "brain-monitor lint",
    "brain:format-failures": "brain-monitor format",
    "brain:test-failures-unit": "brain-monitor test unit",
    "brain:test-failures-integration": "brain-monitor test integration",
    "brain:test-failures-e2e": "brain-monitor test e2e",
    "brain:logs": "brain-monitor logs",
    "brain:dev": "brain-monitor dev"
  }
}
```

## Output Structure

### Error Reports (`_errors/`)

```
_errors/
├── validation-summary.md           # Overall status - check this FIRST
├── watch-summary.md               # Live status when watch mode is active
├── reports/                       # Detailed error reports
│   ├── errors.typecheck-failures.md
│   ├── errors.lint-failures.md
│   ├── errors.format-failures.md
│   ├── errors.test-failures-unit.md
│   ├── errors.test-failures-integration.md
│   └── errors.test-failures-e2e.md
└── .counts/                       # Hidden run count tracking
    ├── .typecheck-run-count
    ├── .lint-run-count
    └── .test-*-run-count
```

### Log Files (`_logs/`)

```
_logs/
├── index.md                        # Log file directory with status
├── financial-api.log              # API server logs (auto-discovered)
├── financial-ui.log               # UI dev server logs (auto-discovered)
└── [app-name].log                 # Other app logs (dynamic discovery)
```

Logs are automatically discovered from your `apps/` directory and update every 3 seconds.

## Test Suite Detection

Brain-monitor automatically detects and runs only the test suites that exist in your monorepo:

- `test` - Default test script
- `test:unit` - Unit tests
- `test:integration` - Integration tests
- `test:e2e` - End-to-end tests
- `test:e2e:ui` - UI-specific E2E tests
- `test:e2e:api` - API-specific E2E tests
- `test:e2e:browser` - Browser E2E tests
- `test:storybook` - Storybook tests
- `test:storybook:interaction` - Storybook interaction tests
- `test:storybook:e2e` - Storybook E2E tests

## Multi-Agent Collaboration

Brain-monitor is designed for environments where multiple AI agents work on the same codebase:

1. **Shared State**: All agents read from the same `_errors/` files
2. **No Conflicts**: Only one agent runs validations at a time
3. **Live Updates**: Agents can `tail -f` log files for real-time feedback
4. **Efficiency**: Check existing reports before running new validations

### Server Logs

**Note:** As of the latest update, `pnpm dev` now includes automatic logging!

```bash
# Standard development (includes logging by default)
pnpm dev             # Starts all 4 servers with logging to _logs/

# Alternative commands
pnpm brain:dev       # Same as pnpm dev
pnpm dev:with-logs   # Also same as pnpm dev

# Monitor existing logs (rarely needed)
pnpm brain:logs      # Only for monitoring external log files
```

### Best Practices

```bash
# Before running validations, check if reports are recent
cat _errors/validation-summary.md

# For continuous feedback during development
pnpm brain:watch                    # TypeScript + Lint only
cat _errors/watch-summary.md        # Check live status

# Monitor specific logs while developing
tail -f _logs/financial-api.log

# Only run full validations if reports are stale (>10 minutes)
pnpm brain:validate
```

### Browser Console Capture

Brain-monitor can automatically capture browser console logs from your React/Vue/Angular applications:

```bash
# During initialization, brain-monitor will:
# 1. Auto-inject console capture into your App.tsx/jsx files
# 2. Provide Express middleware setup instructions

# Browser logs appear in:
tail -f _logs/browser-console.log

# Features:
# - Captures console.log, warn, error, info, debug
# - Includes timestamps, URLs, and stack traces
# - Automatic log rotation at 10MB
# - Zero-config after initialization
```

**Backend Setup Required:**

After running `brain-monitor init`, add the middleware to your Express app:

```typescript
import { createBrainMonitorRouter } from '@kit/brain-monitor/server';

// Add this line to your Express setup:
app.use('/_brain-monitor', createBrainMonitorRouter());
```

## Configuration

Brain-monitor works with zero configuration by following common monorepo patterns:

- Detects packages using `pnpm-workspace.yaml` or similar
- Finds test scripts in each package's `package.json`
- Uses standard tools (TypeScript, ESLint, Prettier, Vitest/Jest)
- Auto-discovers dev servers from `apps/` directory
- Supports `.cursor/rules/` for AI assistant integration

### Watch Mode Options

```bash
# Default: TypeScript + Lint only (low resource usage)
brain-monitor watch

# Watch all validations including tests
brain-monitor watch --all

# Custom update interval (default: 5 seconds)
brain-monitor watch --interval 10
```

## API

### Programmatic Usage

```typescript
import { runValidation, init } from '@kit/brain-monitor';

// Run all validations
await runValidation();

// Initialize in a project
await init();
```

### Type Definitions

```typescript
interface ValidationTask {
  name: string;
  command: string;
  emoji: string;
  outputFile: string;
}

interface ValidationResult {
  task: string;
  success: boolean;
  duration: number;
  output?: string;
  error?: Error;
}
```

## Migration Guide

### From v0.0.0 to Latest

The directory structure has been reorganized for better clarity:

```bash
# Old structure
_errors/
├── errors.typecheck-failures.md
├── errors.lint-failures.md
└── validation-summary.md

# New structure
_errors/
├── validation-summary.md          # Now at root level
├── reports/                       # All error reports here
│   ├── errors.typecheck-failures.md
│   └── errors.lint-failures.md
└── .counts/                       # Hidden count tracking

# Update your scripts/documentation:
# Old: cat _errors/errors.typecheck-failures.md
# New: cat _errors/reports/errors.typecheck-failures.md
```

### New Features

1. **Watch Mode**: Use `pnpm brain:watch` for continuous validation
2. **CI/CD**: Run `npx brain-monitor ci:init` to set up GitHub Actions
3. **Cursor Support**: `.cursor/rules/` automatically updated on init

## Requirements

- Node.js 18+
- pnpm (or npm/yarn with adjustments)
- TypeScript project with `tsconfig.json`
- Standard test runners (Vitest, Jest, etc.)
- (Optional) Docker for local CI testing with act

## Contributing

This is an internal tool for the financial monorepo. For issues or improvements, please open a PR in the main repository.

## License

Private - See repository license