# 💅 Format Code

Run Prettier or other code formatters to standardize code style across the project, applying consistent formatting without changing functionality.

## Instructions:
- Auto-detect and run the appropriate formatting command
- Apply formatting changes immediately without asking for confirmation
- Report a summary of which files were changed
- Never modify logic or functionality, only format the code

## Auto-Detection Logic:
1. Check for `format` or `prettier` script in the nearest package.json
2. Look for project-wide formatting commands
3. Fall back to `prettier --write .` if no script is found
4. For monorepos, detect if formatting should be scoped to a specific package

## Output Format:
- Summary count of files formatted
- Brief list of affected files (limited to 10, with count if more)
- Confirmation of successful formatting
- Any configuration details used (which config file applied) 