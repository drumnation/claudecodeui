/** @type {import('eslint').Linter.Config} */
const config = {
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:styled-components-a11y/recommended',
  ],
  plugins: ['better-styled-components', 'styled-components-a11y'],
  rules: {
    'react/prop-types': 'off',
    'better-styled-components/sort-declarations-alphabetically': 2,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^(React|_)',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
  },
  globals: {
    React: 'writable',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
  },
};

module.exports = config;
