# ▶️ Run Functional Tests

Automatically run the functional test suite and report results.

## Instructions:
- Detect the test runner (`vitest`, `mocha`, `playwright`, etc.).
- Run only affected or tagged tests when possible. Use non-interactive flags like `--run` or `run`.
- Report test results.
- If all pass: log ✅ status and conclude.

---

### 🚨 If Tests Fail: Triage and Create Task List

1.  **Diagnose:** Briefly determine if the failure is a likely regression, an environment issue, or a test that needs updating.
2.  **Log Summary:** Report the total number of failed tests.
3.  **Generate Failure Task Files:**
    - For each set of 25 failed tests, create a markdown file.
    - **File Location:** `.brain/[active-agent-name]/.testing/`
    - **File Naming:** `failed-tests.[timestamp]-part-[N].md` (e.g., `failed-tests.20251026-143000-part-1.md`)
    - **File Content:** Create a markdown checkbox list using the template below for each failed test.

    ```markdown
    # 📝 Test Failure Triage: Part [N]

    **Agent:** [active-agent-name]
    **Timestamp:** [timestamp]
    **Total Failures in this file:** [count]

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

    - [ ] **Test:** `Another failed test name`
          **File:** `path/to/another/test/file.spec.js`
          **Error:**
          ```
          [Paste concise failure summary or stack trace here]
          ```
    ```
4.  **Handoff:** Conclude your run by stating that you have created the failure analysis files and instruct the user or a subsequent agent to begin work on them. For example: "I have identified [X] test failures and created [Y] task files in `.brain/[active-agent-name]/.testing/`. Please assign an agent to resolve these failures by working through the markdown checklists.