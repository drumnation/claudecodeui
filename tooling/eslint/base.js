/** @type {import("eslint").Linter.Config} */

const config = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:prettier/recommended',
    'turbo',
  ],
  env: {
    es2019: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    ecmaVersion: 2022,
  },
  plugins: ['@typescript-eslint', 'import', 'markdown'],
  settings: {
    'markdown/code-blocks': true,
  },
  overrides: [
    {
      files: ['**/*.md'],
      extends: ['plugin:prettier/recommended'],
      parser: 'markdown-eslint-parser',
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
  ],
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
  ignorePatterns: [
    '**/.eslintrc.cjs',
    '**/*.config.js',
    '**/*.config.cjs',
    '**/node_modules',
    '.next',
    'dist',
    'pnpm-lock.yaml',
  ],
  reportUnusedDisableDirectives: true,
};

module.exports = config;
