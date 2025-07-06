# ✅ Validate with Tests After Task

After finishing a task or plan step, run tests to ensure correctness.

## Instructions:
- Run functional/integration/e2e tests most relevant to the completed task.
- Do not skip this step even if linting or type-checking passes. Tests are the source of truth.
- If no relevant tests exist for the changes made, suggest that the user add one.
- If all relevant tests pass, report success and conclude.

---

### 🚨 If Tests Fail: Halt and Create Task List

1.  **Halt Execution:** Stop the current plan. Do not proceed with other tasks.
2.  **Generate Failure Task File(s):**
    - For each set of 25 failed tests, create a markdown file.
    - **File Location:** `.brain/[active-agent-name]/.testing/`
    - **File Naming:** `failed-tests.validation.[timestamp]-part-[N].md`
    - **File Content:** Use the following template to create a markdown checkbox list for each failed test.

    ```markdown
    # 📝 Validation Failure Triage: Part [N]

    **Agent:** [active-agent-name]
    **Timestamp:** [timestamp]
    **Task Context:** Validation failed after completing task: "[Name or description of the previous task]"

    ---

    ### Instructions for the next agent:
    - The previous task introduced a regression. Your goal is to fix it.
    - Work through each checkbox item to resolve the failures.
    - Mark the checkbox (`- [x]`) upon successful resolution.
    - Once all items are fixed, re-run the validation to ensure the task is now complete and correct.

    ---

    ### Failed Tests:

    - [ ] **Test:** `Name of the failed test block`
          **File:** `path/to/the/test/file.spec.ts`
          **Error:**
          ```
          [Paste concise failure summary or stack trace here]
          ```
    ```
3.  **Report and Handoff:** Announce the failure and the creation of the task list. For example: "Validation failed after my last task. I have created a task list of the regressions at `.brain/[active-agent-name]/.testing/failed-tests.validation...md`. Please assign an agent to fix these failures before we can continue.