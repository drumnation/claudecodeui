# 🏃 Run Test Suite

**Purpose:** Execute comprehensive test suites with smart filtering and reporting.

**Use when:** You need to run specific test types, scopes, or the full test suite with advanced options.

## ⚠️ Agent Execution Note
**For AI agents**: Always use non-interactive test commands to avoid hanging in watch mode:
- Use `test:run`, `test:ci`, or add `--run` flag to avoid interactive/watch modes
- Prefer `--reporter=verbose` or `--reporter=json` for structured output
- Never use bare `test` command which often defaults to watch mode

## Instructions:

### 1. **Auto-Detect Test Environment**
- Scan for test runners (`vitest`, `jest`, `playwright`, `mocha`, etc.)
- Identify monorepo structure and workspace packages
- Detect existing test configuration files
- Check for CI/CD integration requirements

### 2. **Smart Test Filtering**
```bash
# Run by test type (use non-interactive forms)
pnpm test:unit:run          # or pnpm test:unit -- --run
pnpm test:integration:run   # or pnpm test:integration -- --run  
pnpm test:e2e:run          # or pnpm test:e2e -- --run

# Run by scope
pnpm test:run --filter="@package/*"   # Specific package
pnpm test:run changed                 # Only changed files
pnpm test:run --related              # Tests related to changes

# Run by pattern (always add --run for agents)
pnpm test:run --testNamePattern="AuthFlow"
pnpm test:run --testPathPattern="components"

# Vitest specific non-interactive commands
npx vitest run                        # Non-interactive execution
npx vitest run --reporter=verbose     # Detailed output for agents
npx vitest run --reporter=json        # Structured output
```

### 3. **Execution Strategies**
- **Parallel**: Run tests in parallel for speed (`--max-workers=4`)
- **Sequential**: Run tests sequentially for debugging (`--runInBand`)
- **Single Run**: Non-interactive execution (`--run` flag)
- **Coverage**: Include test coverage reporting (`--coverage`)
- **Performance**: Profile test execution times (`--reporter=verbose`)

### 4. **Comprehensive Reporting**
- **Pass/Fail Summary**: Clear overview of test results
- **Failure Details**: Detailed error messages and stack traces
- **Performance Metrics**: Test execution times and bottlenecks
- **Coverage Reports**: Code coverage analysis (when requested)
- **Flaky Test Detection**: Identify intermittent failures

### 5. **Failure Analysis & Task List Creation**
- **Categorize Failures**: Briefly categorize failures (e.g., regression, outdated test, environment issue).
- **Generate Failure Task Files**: If any tests fail, follow this procedure:
    - For each set of 25 failed tests, create a new markdown file.
    - **File Location**: `.brain/[active-agent-name]/.testing/`
    - **File Naming**: `failed-tests.[timestamp]-part-[N].md` (e.g., `failed-tests.20251026-143000-part-1.md`)
    - **File Content Template**:

    ```markdown
    # 📝 Test Failure Triage: Part [N]

    **Agent:** [active-agent-name]
    **Timestamp:** [timestamp]
    **Total Failures in this file:** [count]
    **Commands Used:** `[command that was run to get these failures]`

    ---

    ### Instructions for the next agent:
    - Work through each checkbox item in this file.
    - For each failure, navigate to the file and analyze the code and test.
    - Attempt to fix the test or the underlying code.
    - Mark the checkbox (`- [x]`) upon successful resolution of a test.
    - Once all items are addressed, run the tests again to validate the fixes.

    ---

    ### Failed Tests:

    - [ ] **Test:** `Name of the failed test block`
          **File:** `path/to/the/test/file.spec.ts`
          **Error:**
          ```
          [Paste concise failure summary or stack trace here]
          ```
    ```
- **Handoff & Next Steps**:
    - Conclude your run by reporting the number of task files created.
    - Suggest the next logical step, e.g., "I have logged [X] failures in [Y] files located at `.brain/[active-agent-name]/.testing/`. The next agent should process these files to resolve the issues."
    - Recommend re-run strategies for any identified flaky tests.