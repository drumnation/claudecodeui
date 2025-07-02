# 🚀 Validate Code Quality

⚠️⚠️⚠️ EXECUTE_IMMEDIATELY: TRUE ⚠️⚠️⚠️
❗❗❗ IMMEDIATE AUTO-TRIGGER

A multi-step workflow that runs type checking, linting, and formatting in sequence to validate and improve code quality.

## Workflow Overview:
1. Run TypeScript type checking to identify type errors
2. Run ESLint to identify and fix linting issues
3. Run Prettier to format code consistently
4. Provide a comprehensive quality report

## Execution Steps:
1. **Type Checking**
   - Run the `../typecheck-code.prompt.md` to identify type errors
   - If critical errors exist, flag them for immediate attention
   - Continue to the next step even if errors are found (to provide complete report)

2. **Linting**  
   - Run the `../lint-code.prompt.md` to identify and fix linting issues
   - Apply automatic fixes where safe
   - Report on remaining issues that need manual attention

3. **Formatting**
   - Run the `../format-code.prompt.md` to standardize code style
   - Apply formatting changes immediately
   - Report on which files were affected

4. **Results Summary**
   - Provide an overall quality assessment
   - List critical issues that need attention
   - Suggest next steps based on findings

## Output Format:
```json
{
  "typecheck": {
    "status": "success|failure",
    "errorCount": 0,
    "criticalErrors": []
  },
  "lint": {
    "status": "success|failure|partial_success",
    "fixedIssues": 0,
    "remainingIssues": 0
  },
  "format": {
    "status": "success|failure",
    "filesFormatted": 0
  },
  "summary": {
    "overallStatus": "pass|fail",
    "nextSteps": "string with recommendations"
  }
}
``` 