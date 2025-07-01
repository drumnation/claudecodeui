# 🧹 Lint Code

Run ESLint to identify and fix automatically resolvable linting issues without changing application logic.

## Instructions:
- Auto-detect and run the appropriate linting command with `--fix` when available
- Apply only safe, automatic fixes
- Report remaining issues with file locations and explanations
- Do NOT modify application logic or make subjective code changes
- Group issues by file and rule for better readability

## Auto-Detection Logic:
1. Check for `lint` or `lint:fix` script in the nearest package.json
2. Look for project-wide lint commands
3. Fall back to `eslint . --fix` if no script is found
4. For monorepos, detect if linting should be scoped to a specific package

## Output Format:
- Summary of fixed vs. remaining issues
- Grouped issues by file with line numbers
- Rule references and severity (error/warning)
- Recommended manual fixes for remaining issues (when clear) 