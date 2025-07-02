import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import turboConfig from 'eslint-config-turbo/flat';
import importPlugin from 'eslint-plugin-import';
import markdownPlugin from 'eslint-plugin-markdown';
import prettierPlugin from 'eslint-plugin-prettier';
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
      '*.ts',
      'types.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettierConfig,
  turboConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2019,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      markdown: markdownPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      'markdown/code-blocks': true,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          typescriptBracketSpacing: true,
          bracketSpacing: true,
        },
      ],
      'import/no-cycle': 'error',
      'turbo/no-undeclared-env-vars': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
      ],
      '@typescript-eslint/no-misused-promises': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-i18next',
              importNames: ['Trans'],
              message: 'Please use `@kit/ui/trans` instead',
            },
          ],
        },
      ],
    },
  } as Linter.Config,
  {
    files: ['**/*.md'],
    processor: 'markdown/markdown',
    rules: {
      'prettier/prettier': [
        'error',
        {
          proseWrap: 'always',
          printWidth: 80,
        },
      ],
    },
  },
);

export default config;
