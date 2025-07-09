import tseslint from 'typescript-eslint';

import baseConfig from './base.js';

export default tseslint.config(
  ...baseConfig,
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/e2e/**/*.ts', '**/tests/**/*.ts'],
    rules: {
      // Allow any and console for tests
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
);