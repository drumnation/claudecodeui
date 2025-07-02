import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import styledComponentsA11yPlugin from 'eslint-plugin-styled-components-a11y';
import betterStyledComponentsPlugin from 'eslint-plugin-better-styled-components';
import globals from 'globals';
import type {Linter} from 'eslint';

const config: Linter.Config[] = [
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'styled-components-a11y': styledComponentsA11yPlugin,
      'better-styled-components': betterStyledComponentsPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        React: 'writable',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...styledComponentsA11yPlugin.configs.recommended.rules,
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
  },
];

export default config;
