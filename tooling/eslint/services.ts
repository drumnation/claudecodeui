import baseConfig from './base.js';
import globals from 'globals';
import type {Linter} from 'eslint';

const config: Linter.Config[] = [
  ...(baseConfig as Linter.Config[]),
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];

export default config;
