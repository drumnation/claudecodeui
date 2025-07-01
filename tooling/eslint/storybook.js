/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:storybook/recommended',
  ],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: true,
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh', 'storybook'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': [
      'warn',
      {allowConstantExport: true},
    ],
    'storybook/hierarchy-separator': 'error',
    'storybook/default-exports': 'error',
  },
  ignorePatterns: [
    '**/.eslintrc.cjs',
    '**/*.config.js',
    '**/*.config.cjs',
    '**/node_modules',
    '.next',
    'dist',
    'pnpm-lock.yaml',
    'storybook-static/*',
  ],
  overrides: [
    {
      files: ['*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
      rules: {
        'storybook/prefer-pascal-case': 'error',
      },
    },
  ],
};

module.exports = config;
