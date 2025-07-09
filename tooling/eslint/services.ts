import tseslint from 'typescript-eslint';

import baseConfig from './base.js';

export default tseslint.config(
  ...baseConfig,
  {
    files: ['**/*.{ts,js}'],
    rules: {
      // Service-specific rules
      'no-console': 'error', // Stricter console rules for services
      '@typescript-eslint/no-explicit-any': 'error', // Stricter any rules for services
      
      // Node.js specific rules
      'no-process-exit': 'error',
      'no-sync': 'warn',
    },
  },
);