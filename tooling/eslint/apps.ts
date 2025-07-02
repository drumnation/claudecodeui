import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import type {Linter} from 'eslint';

const config: Linter.Config[] = [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2019,
      },
      parser: tseslint.parser as any,
      parserOptions: {
        project: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin as any,
      import: importPlugin,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@kit/supabase/database',
              importNames: ['Database'],
              message:
                'Please use the application types from your app "~/lib/database.types" instead',
            },
          ],
        },
      ],
    },
  },
];

export default config;
