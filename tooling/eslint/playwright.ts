import playwrightPlugin from 'eslint-plugin-playwright';
import type {Linter} from 'eslint';

const config: Linter.Config[] = [
  {
    ...playwrightPlugin.configs['flat/recommended'],
    files: ['**/*.spec.ts', '**/*.spec.js', '**/*.test.ts', '**/*.test.js'],
  },
];

export default config;
