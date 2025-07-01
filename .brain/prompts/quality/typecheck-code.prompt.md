# 🔍 TypeCheck Code

Run the project's TypeScript type checker and report all type errors without modifying the code.

## Instructions:
- Auto-detect and run the appropriate type checking command
- Report all TypeScript errors with file locations and explanations
- Do NOT fix the errors - only report them
- Group errors by file for better readability
- Provide common error pattern references where applicable

## Auto-Detection Logic:
1. Check for `typecheck` script in the nearest package.json
2. Look for project-wide typecheck commands
3. Fall back to `tsc --noEmit` if no script is found

## Output Format:
- Summary count of errors
- Grouped errors by file with line numbers
- Severity classification (error/warning)
- References to relevant TypeScript documentation where helpful 