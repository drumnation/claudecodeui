import tseslint from "typescript-eslint";
import baseConfig from "@kit/eslint-config/base";

export default tseslint.config(
  ...baseConfig,
  {
    ignores: [
      "dist",
      "node_modules",
      "coverage",
      "bin",
      "**/*.md",
      "*.md",
      ".eslintrc.cjs",
      "*.config.js",
      "*.config.ts",
      "eslint.config.ts",
    ],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./tsconfig.node.json",
          "./tsconfig.browser.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
