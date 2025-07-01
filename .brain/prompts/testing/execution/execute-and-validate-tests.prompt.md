# 🧪 Execute and Validate Tests

**Purpose:** A master prompt to run any test scenario, from a quick validation to a full-suite execution, and handle results gracefully.

## 1. Determine Intent
First, determine the context for running tests. Choose one primary intent:
- **A) Quick Validation:** Are you running tests after a specific task to ensure no regressions were introduced? (e.g., "did my last change break anything?")
- **B) Focused Run:** Do you need to run a specific type, scope, or pattern of tests for debugging or development? (e.g., "run only the unit tests for the auth package").
- **C) Comprehensive Run:** Do you need to run the entire test suite, similar to a CI check? (e.g., "run all tests").

## 2. Execute Based on Intent

### If Intent is (A) Quick Validation:
- Identify the files/packages affected by the last task.
- Run the most relevant tests (functional, integration) for those changes.
- Use a command like `pnpm test:run --related` or `npx vitest run --changed`.

### If Intent is (B) Focused Run:
- Use the provided scope, patterns, or filters.
- Construct the precise command using the examples below. Always use non-interactive flags (`--run`).

```bash
# By Type: pnpm test:unit:run
# By Scope: pnpm test:run --filter="@package/*"
# By Pattern: pnpm test:run --testNamePattern="AuthFlow"
# Vitest specific: npx vitest run --reporter=verbose
```

### If Intent is (C) Comprehensive Run:
- Execute the broadest test command available (e.g., `pnpm test:run` or `npx vitest run`).
- Consider using parallel execution for speed (`--max-workers=...`) and a structured reporter for clarity (`--reporter=json`).

## 3. Report Results

- If all tests pass: Report ✅ success, state the command used, and conclude.
- If tests fail: Proceed to Step 4.

## 4. 🚨 Failure Triage and Task List Creation (Centralized Logic)

- **Analyze:** Briefly categorize the failure (regression, environment, etc.).
- **Generate Task Files:** This logic is now centralized.
    - For each set of 25 failed tests, create a markdown file.
    - **File Location:** `.brain/[active-agent-name]/.testing/`
    - **File Naming:** `failed-tests.[context].[timestamp]-part-[N].md` (e.g., `failed-tests.validation.20251026-143000-part-1.md`)
    - **File Content:** Use the standard checkbox task list template.
- **Handoff:** Report the creation of the files and instruct the next agent to begin work on them.