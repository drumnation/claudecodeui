/**
 * @kit/testing - Unified testing configuration for the monorepo
 *
 * Provides pre-configured test runners, utilities, and presets for:
 * - Unit tests (Vitest with jsdom)
 * - Integration tests (Vitest with Node)
 * - E2E tests (Vitest for backend E2E)
 * - Browser E2E tests (Playwright)
 * - Storybook testing (component, interaction, and E2E)
 *
 * @packageDocumentation
 */

// Configuration loaders
export const configs = {
  vitest: {
    unit: () => import('./configs/vitest/unit.js').then((m) => m.default),
    integration: () =>
      import('./configs/vitest/integration.js').then((m) => m.default),
    e2e: () => import('./configs/vitest/e2e.js').then((m) => m.default),
    storybook: () =>
      import('./configs/vitest/storybook.js').then((m) => m.default),
    base: () => import('./configs/vitest/base.js').then((m) => m.default),
  },
  playwright: {
    browser: () =>
      import('./configs/playwright/browser.js').then((m) => m.default),
    api: () => import('./configs/playwright/api.js').then((m) => m.default),
    storybook: () =>
      import('./configs/playwright/storybook.js').then((m) => m.default),
    base: () => import('./configs/playwright/base.js').then((m) => m.default),
  },
  storybook: {
    testRunner: () =>
      import('./configs/storybook/test-runner.js').then((m) => m.default),
  },
};

// Test runners
export const runners = {
  recursive: () => import('./runners/recursive.js'),
  ci: () => import('./runners/ci.js'),
};

// Utilities
export const utilities = {
  storybook: {
    component: () => import('./utilities/storybook/component.js'),
    interaction: () => import('./utilities/storybook/interaction.js'),
    e2e: () => import('./utilities/storybook/e2e.js'),
  },
};

// Setup files
export const setup = {
  unit: () => import('./setup/unit.js'),
  integration: () => import('./setup/integration.js'),
  e2e: () => import('./setup/e2e.js'),
  storybook: () => import('./setup/storybook.js'),
};

// Presets - directly exported for convenience
export * as presets from './presets/index.js';

// Type exports
export type {InlineConfig as VitestConfig} from 'vitest';
export type {PlaywrightTestConfig} from '@playwright/test';
export type {TestRunnerConfig} from '@storybook/test-runner';
export * from './types/index.js';

// --- BACKWARD COMPATIBILITY EXPORTS ---
// These will be deprecated in a future version

// Legacy Vitest configurations
export {default as baseConfig} from './configs/vitest/base.js';
export {default as unitConfig} from './configs/vitest/unit.js';
export {default as integrationConfig} from './configs/vitest/integration.js';
export {default as e2eConfig} from './configs/vitest/e2e.js';
export {default as storybookConfig} from './configs/vitest/storybook.js';

// Legacy Playwright configurations
export {default as playwrightConfig} from './configs/playwright/browser.js';
export {default as playwrightBackendConfig} from './configs/playwright/api.js';
export {default as storybookE2EConfig} from './configs/playwright/storybook.js';

// Legacy Storybook utilities
export * from './utilities/storybook/component.js';
export {
  interactions,
  createInteractionTest,
  commonScenarios,
  mockUtils,
  // Re-export all except 'expect' to avoid conflict
  waitFor,
  within,
  userEvent,
  fn,
  spyOn,
} from './utilities/storybook/interaction.js';
export * from './utilities/storybook/e2e.js';

// Legacy test runner config
export {default as testRunnerConfig} from './configs/storybook/test-runner.js';

/**
 * Quick Start Examples
 *
 * @example
 * Modern API usage:
 * ```ts
 * // vitest.config.ts
 * import { configs } from '@kit/testing';
 * export default await configs.vitest.unit();
 *
 * // With customization:
 * import { mergeConfig } from 'vitest/config';
 * import { configs, presets } from '@kit/testing';
 *
 * const baseConfig = await configs.vitest.unit();
 * export default mergeConfig(baseConfig, {
 *   test: {
 *     coverage: presets.coverage.strict,
 *   },
 * });
 * ```
 *
 * @example
 * Legacy API (still supported):
 * ```ts
 * import { unitConfig } from '@kit/testing';
 * export default unitConfig;
 * ```
 */
