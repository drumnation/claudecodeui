# @kit/testing

> Unified testing configuration for monorepo projects with intelligent test orchestration and coverage enforcement

## Overview

`@kit/testing` provides a comprehensive testing infrastructure with pre-configured test runners, utilities, and presets for modern JavaScript/TypeScript applications. It supports multiple testing paradigms with consistent configuration and automatic coverage enforcement.

## Features

- 🚀 **Pre-configured Test Runners** - Unit, Integration, E2E, and Storybook tests
- 📊 **Intelligent Coverage** - Automatic thresholds with recursive validation
- 🔄 **Self-Healing Tests** - Auto-adjusts timeouts and retries on failure
- 🎯 **Framework Support** - Vitest, Playwright, and Storybook Test Runner
- 📦 **Composable Presets** - Reusable configuration patterns
- 🏗️ **Monorepo Ready** - Designed for large-scale applications
- 🔍 **Type-Safe** - Full TypeScript support

## Installation

```bash
pnpm add -D @kit/testing
```

## Quick Start

### Modern API (Recommended)

```typescript
// vitest.config.ts
import {configs} from '@kit/testing';
export default await configs.vitest.unit();
```

### With Customization

```typescript
import {mergeConfig} from 'vitest/config';
import {configs, presets} from '@kit/testing';

const baseConfig = await configs.vitest.unit();

export default mergeConfig(baseConfig, {
  test: {
    coverage: presets.coverage.strict, // 90% thresholds
    ...presets.timeouts.medium, // 30s timeouts
    ...presets.pools.fast, // No isolation for speed
  },
});
```

## Available Configurations

### Vitest Configurations

| Config                         | Environment | Use Case               | Coverage |
| ------------------------------ | ----------- | ---------------------- | -------- |
| `configs.vitest.unit()`        | jsdom       | Component & unit tests | ✅ 85%   |
| `configs.vitest.integration()` | node        | API & service tests    | ✅ 85%   |
| `configs.vitest.e2e()`         | node        | End-to-end flows       | Optional |
| `configs.vitest.storybook()`   | jsdom       | Story component tests  | ✅ 85%   |

### Playwright Configurations

| Config                           | Use Case          | Browsers                |
| -------------------------------- | ----------------- | ----------------------- |
| `configs.playwright.browser()`   | Web E2E tests     | Chrome, Firefox, Safari |
| `configs.playwright.api()`       | Backend API tests | Headless                |
| `configs.playwright.storybook()` | Visual regression | All + Mobile            |

## Configuration Presets

### Coverage Presets

```typescript
import {presets} from '@kit/testing';

// Available presets
presets.coverage.base; // 85% thresholds (default)
presets.coverage.strict; // 90% thresholds
presets.coverage.relaxed; // 70% thresholds
presets.coverage.disabled; // Coverage off
```

### Timeout Presets

```typescript
presets.timeouts.fast; // 10s (unit tests)
presets.timeouts.medium; // 30s (integration)
presets.timeouts.slow; // 60s (E2E)
presets.timeouts.ci; // CI-optimized
```

### Pool Presets

```typescript
presets.pools.parallel; // Thread pool with isolation
presets.pools.sequential; // Fork pool, one at a time
presets.pools.fast; // No isolation, maximum speed
```

## Test Runners

### Recursive Runner

Automatically retries failed tests with adjusted settings:

```bash
# Runs tests with auto-adjustment on failure
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

Features:

- Increases timeouts on timeout errors
- Enables isolation for better coverage
- Reduces parallel workers if needed
- Maximum 2 retries with adjustments

### CI Orchestrator

```bash
# Runs all test suites with optimal ordering
pnpm test:ci
```

Features:

- Parallel execution for unit/storybook tests
- Sequential execution for integration/E2E
- Merged coverage reports
- Automatic threshold enforcement

## Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "node ./node_modules/@kit/testing/src/runners/recursive.js unit",
    "test:integration": "node ./node_modules/@kit/testing/src/runners/recursive.js integration",
    "test:e2e": "node ./node_modules/@kit/testing/src/runners/recursive.js e2e",
    "test:storybook": "vitest run --config ./node_modules/@kit/testing/src/configs/vitest/storybook.ts",
    "test:storybook:run": "test-storybook --coverage",
    "test:playwright": "playwright test --config ./node_modules/@kit/testing/src/configs/playwright/browser.ts",
    "test:ci": "node ./node_modules/@kit/testing/src/runners/ci.js",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Storybook Testing

### Component Testing

```typescript
// Button.test.ts
import {createComponentTestSuite} from '@kit/testing';
import * as ButtonStories from './Button.stories';

createComponentTestSuite(ButtonStories);
```

### Interaction Testing

```typescript
// Button.stories.ts
import type {Meta, StoryObj} from '@storybook/react';
import {within, userEvent, expect} from '@storybook/test';

export const Clicked: StoryObj = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.click(button);
    await expect(button).toHaveTextContent('Clicked!');
  },
};
```

### E2E Story Testing

```typescript
// button.story.e2e.test.ts
import {createStoryE2ETests} from '@kit/testing';

createStoryE2ETests('Button', [
  {id: 'components-button--primary', name: 'Primary'},
  {id: 'components-button--secondary', name: 'Secondary'},
]);
```

## Directory Structure

Your test files should follow these naming conventions:

```
src/
├── components/
│   ├── Button.tsx
│   ├── Button.test.tsx          # Unit test
│   ├── Button.stories.tsx       # Storybook stories
│   └── Button.integration.test.tsx  # Integration test
├── pages/
│   └── Home.e2e.test.tsx        # E2E test
└── api/
    └── users.api.test.ts        # API test
```

## Advanced Configuration

### Custom Test Suite

```typescript
import {defineConfig} from 'vitest/config';
import {createTestSuiteConfig} from '@kit/testing';

export default defineConfig(
  createTestSuiteConfig('my-suite', {
    environment: 'jsdom',
    timeout: 'medium',
    pool: 'fast',
    coverage: {
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95,
      },
    },
  }),
);
```

### Environment Variables

- `COVERAGE_THRESHOLD` - Override coverage threshold (default: 85)
- `CI` - Enable CI mode with stricter settings
- `E2E_COVERAGE` - Enable coverage for E2E tests
- `TEST_BASE_URL` - Base URL for Playwright tests
- `STORYBOOK_URL` - Storybook instance URL

## Architecture

The library follows a concern-based architecture:

```
@kit/testing/
├── configs/        # Test framework configurations
├── presets/        # Reusable configuration patterns
├── utilities/      # Test helpers and tools
├── runners/        # Test execution orchestration
├── setup/          # Environment setup files
└── types/          # TypeScript definitions
```

## Troubleshooting

### Coverage Below Threshold

The recursive runner will automatically:

1. Increase timeouts if tests are timing out
2. Enable test isolation for better coverage
3. Reduce parallel workers to improve stability

### Import Errors

Use the migration guide if upgrading from an older version:

```bash
cat node_modules/@kit/testing/MIGRATION.md
```

### Memory Issues

For large test suites, adjust Node.js memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" pnpm test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

MIT © Your Organization
