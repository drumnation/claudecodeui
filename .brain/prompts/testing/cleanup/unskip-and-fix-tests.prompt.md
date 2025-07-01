### Prompt 2: Un-skip & Fix a Test

This is the "worker" prompt. An agent will use this prompt repeatedly to chip away at the `skipped-tests-todo.md` file.

📁 **File: `.brain/prompts/testing/cleanup/fix-skipped-tests.prompt.md`**
```md
# 🛠️ Fix Skipped Tests from Backlog

**Purpose:** To systematically work through the `skipped-tests-todo.md` file, un-skipping, running, and fixing one test at a time.

**Required Input:** The path to the task list file.
- **Example:** `brain_cli --prompt fix-skipped-tests --file .brain/.testing/skipped-tests-todo.md`

## Instructions:

You will work in a loop until all tests in the file are processed.

### 1. **Select a Test**
- Read the input markdown file (`.brain/.testing/skipped-tests-todo.md`).
- Find the **first** item that is still unchecked (`- [ ]`). If none are left, your job is complete.

### 2. **Un-skip the Test**
- Navigate to the file and line number specified in the task item.
- Remove the `.skip` modifier (e.g., change `it.skip(...)` to `it(...)`).
- Save the file.

### 3. **Run ONLY That Test**
- Isolate the test run to *only the single test you just un-skipped*. This is critical for focus and speed.
- Use the test runner's filtering capabilities.

**Example commands:**
```bash
# Vitest / Jest: Use the test description to filter
npx vitest run -t "should redirect to the dashboard after successful login with SSO"

# Playwright: Use file and line number
npx playwright test path/to/auth/login.spec.ts:42
4. Analyze the Result & Act
This is the most important step.

➡️ If the test PASSES:

The feature is likely now complete or the environment is fixed. This is the best-case scenario.
Update the markdown file: Mark the line as - [x] Passed.
Commit your change with a clear message: test(auth): Re-enable test for SSO login
➡️ If the test FAILS:

This is now a standard debugging task. The test is revealing a real bug or is outdated.
Analyze the error message and stack trace.
Debug the underlying application code or the test itself until the test passes.
Run the test repeatedly using the command from Step 3 until it is fixed.
Once it passes, update the markdown file: Mark the line as - [x] Fixed.
Commit your fix with a clear message: fix(auth): Resolve issue with SSO redirection logic and un-skip test
➡️ If you CANNOT fix the test:

After a reasonable attempt, if you cannot fix the test, do not leave it failing.
Re-skip the test by adding the .skip modifier back.
Add a comment above the test explaining what you tried and why you failed.
Update the markdown file: Mark the line as - [!] Needs Review and add a note.
Example: - [!] Needs Review - Test fails due to a timeout in the database mock. Unsure how to resolve.
Continue to the next test.
5. Repeat
Return to Step 1 and process the next available test in the list.
6. Conclusion
Once all checkboxes in skipped-tests-todo.md are marked ([x] or [!]), report that the task is complete and summarize the results (e.g., "I have processed all 15 skipped tests: 8 passed immediately, 6 were fixed, and 1 needs human review.").