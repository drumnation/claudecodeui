import tseslint from 'typescript-eslint';

import baseConfig from './base.js';

export default tseslint.config(
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      // App-specific rules
      'no-console': 'warn', // Allow console in apps for debugging
      '@typescript-eslint/no-explicit-any': 'warn', // More lenient in apps
      
      // Environment-specific rules
      'no-process-env': 'off', // Allow process.env in apps
    },
  },
);