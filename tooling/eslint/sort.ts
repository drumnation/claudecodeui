import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    rules: {
      // Basic sorting rules without complex plugins for now
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
    },
  },
);