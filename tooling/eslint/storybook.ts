import tseslint from 'typescript-eslint';

import baseConfig from './base.js';

export default tseslint.config(
  ...baseConfig,
  {
    files: ['**/*.stories.@(js|jsx|ts|tsx|mdx)'],
    rules: {
      // Allow any and console for stories
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
);