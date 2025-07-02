/**
 * Storybook test configuration
 * - Uses jsdom for component testing
 * - Coverage enabled for story tests
 * - Includes special handling for CSS modules
 * - Integrates with Storybook test utilities
 */

import {mergeConfig} from 'vitest/config';
import baseConfig, {createTestSuiteConfig, includePatterns} from './base';

export default mergeConfig(baseConfig, {
  test: {
    ...createTestSuiteConfig('storybook', {
      environment: 'jsdom',
      timeout: 'fast',
      pool: 'parallel',
      // setupFiles should be configured per-package if needed
      include: includePatterns.storybook,
      exclude: [
        '**/*.unit.test.{ts,tsx}',
        '**/*.integration.test.{ts,tsx}',
        '**/*.e2e.test.{ts,tsx}',
      ],
      coverage: {
        include: [
          'src/**/*.{ts,tsx}',
          'src/**/*.stories.{ts,tsx}', // Include story files in coverage
          'src/**/*.story.{ts,tsx}',
        ],
        exclude: [
          'src/**/*.stories.{ts,tsx}',
          'src/**/*.story.{ts,tsx}',
          'src/**/*.test.{ts,tsx}',
          'src/**/*.spec.{ts,tsx}',
        ],
      },
    }).test,
    // CSS handling for components
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    // Deps optimization for Storybook
    deps: {
      optimizer: {
        web: {
          include: ['@storybook/test', '@testing-library/react'],
        },
      },
    },
  },
});
