## Add Bug Report 🔧

Update feature task list with next incremented number: [@.brain/1-agent-smith/c-bugs/xx-bug-report.md]

## Pre-flight:

1.  **Create status file:** 
    * Scan `@.brain/1-agent-smith/c-bugs/*` for the highest numbered plan
    * Filename format: `{incremented-number}-{bug-summary-name}-bug.md`
    * Example: `05-login-form-validation-bug.md`

```markdown
# Bug Reports

Bug: {issue type} - {description}
- Test Info: {path/name}
- Error: {message}
- Steps: {reproduce}
- Expected: {behavior}
- Debug: {artifacts}

Status: Open
```

Tags:  
#bug #{test-type}

Track in session if active.

Focus: Document details needed for future debugging.