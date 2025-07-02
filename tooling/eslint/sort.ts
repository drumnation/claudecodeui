import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import sortKeysFixPlugin from 'eslint-plugin-sort-keys-fix';
import typescriptSortKeysPlugin from 'eslint-plugin-typescript-sort-keys';
import type {Linter} from 'eslint';

const config: Linter.Config[] = [
  {
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
      'sort-keys-fix': sortKeysFixPlugin,
      'typescript-sort-keys': typescriptSortKeysPlugin,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'sort-keys-fix/sort-keys-fix': 'warn',
      'typescript-sort-keys/interface': 'error',
      'typescript-sort-keys/string-enum': 'error',
    },
  },
];

export default config;
