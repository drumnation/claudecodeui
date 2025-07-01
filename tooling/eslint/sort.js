/** @type {import("eslint").Linter.Config} */
const config = {
  plugins: ['simple-import-sort', 'sort-keys-fix', 'typescript-sort-keys'],
  rules: {
    'simple-import-sort/imports': 'error',
    'sort-keys-fix/sort-keys-fix': 'warn',
    'typescript-sort-keys/interface': 'error',
    'typescript-sort-keys/string-enum': 'error',
  },
};

module.exports = config;
