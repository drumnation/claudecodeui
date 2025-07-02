import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import storybookPlugin from 'eslint-plugin-storybook';
import globals from 'globals';
import type {Linter} from 'eslint';

const config = tseslint.config(
  {
    ignores: [
      '**/.eslintrc.cjs',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/node_modules',
      '.next',
      'dist',
      'pnpm-lock.yaml',
      'storybook-static/*',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...storybookPlugin.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      storybook: storybookPlugin,
    },
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
  } as Linter.Config,
  {
    files: ['*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
    rules: {
      'storybook/prefer-pascal-case': 'error',
    },
  },
);

export default config;
