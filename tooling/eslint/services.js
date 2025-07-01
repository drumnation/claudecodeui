/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ['./base'],
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
  env: {
    node: true,
  },
};

module.exports = config;
