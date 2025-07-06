## 🔬 Validate Codebase Before Commit

**Objective:** Validate the codebase before committing changes `[commit_message or commit_hash]`, automatically fixing errors, monitoring context usage, and triggering a context handoff if necessary. Maximize the use of the available context.

**ABSOLUTELY DO NOT INTERACT WITH GIT.**

**1. Initial Validation:**

*   Run the full validation suite: `pnpm run validate`

This command READs the following:

*   `pnpm run test`: Runs the test suite.
*   `pnpm run typecheck`: Checks for type errors.
*   `pnpm run lint:fix`: Lints the code and attempts to automatically fix issues.
*   `pnpm run format:fix`: Automatically formats code using Prettier to ensure consistent code style across the project.

**2. Automatic Remediation of Failures:**

*   If any of the above steps fail, you are required to **automatically fix the issues without asking clarifying questions**.
*   Focus on fixing only the issues related to the failing step. For example:
    *   If `test` fails, address the failing tests in the test report.
    *   If `typecheck` fails, address the type errors reported by the TypeScript compiler.
    *   If `lint:fix` fails, correct the remaining linting errors that couldn't be automatically fixed.
    *   If `format:fix` fails, manually resolve any formatting issues that couldn't be automatically fixed by Prettier.
*   **Iterative Fixes:**
    *   After making changes to address a specific failure, automatically re-run **only** the failing command (e.g., `pnpm run test` if tests failed).
    *   Continue this cycle of automatically fixing and re-running the specific command until it passes successfully. Do not ask for confirmation or input along the way.
    *   **IF TEST FAILURES PERSIST:**
        *   Follow the "Test Failures" Escalation rules in the Troubleshooting Tips section below.

**3. Final Validation:**

*   Once all individual steps (`test`, `typecheck`, `lint:fix`, `format:fix`) have passed individually, run the full validation suite **one more time automatically**: `pnpm run validate`
*   This final run ensures that all changes work together harmoniously and that no new issues have been introduced.

**4. Report Completion:**

*   If the final `pnpm run validate` is successful, state that the validation process is complete and successful.

**🧮 Context Monitoring & Handoff:**

1.  📊 Context Check:
    *   **Action:** After each subtask completion (Prioritization, Planning, Implementation, Validation, etc.), output an approximate context usage level: Low (less than 30%), Medium (30-60%), High (60-90%), or Very High (above 90%). Base your estimate on the amount of information processed so far, including code, text, and previous outputs.
    *   **Output:** `Context Usage: [Low/Medium/High/Very High]`

2.  **🔥 Handoff Trigger:**
    *   **Action:** If Context Usage reaches 90%, READ `@.brain/prompts/routine/context-handoff.md`
    *   **Output:** Context handoff document.
    *   **Action:** **HALT FURTHER VALIDATION PROCESSING.** Await further instructions for the new agent with the handoff document.

**Troubleshooting Tips:**

*   **Test Failures:** Read the test failure messages carefully. They often point to the specific lines of code causing the problem. You may need to debug your tests using a debugger.
    *   **Specific Test Failure Escalation:**
        *   **Create a Task:** If tests fail, create a new task file in the `.brain/1-agent-smith/.testing` directory. The filename should be in the format `[task-number]-[short-description].md` (e.g., `05-test-fixes.md`). This file should document the test failures and your plan to address them.
        *   **2 Failures of the Same Test:** If the same test fails twice in a row, READ `.brain/prompts/knowledge/agent-prompt-improvement.rules.ts` for potential solutions and guidance on improving your approach.
        *   **3 Failures of the Same Test:** If the same test fails three times in a row, READ `.brain/prompts/knowledge/create-knowledge-for-stuck-agent.md` to create a detailed knowledge file for assistance. Then, **HALT FURTHER ACTION** and await instructions.
*   **Typecheck Errors:** The TypeScript compiler will provide specific error messages with file names and line numbers. Use these to locate and fix type issues.
*   **Linting Errors:** Linting errors indicate code style or potential bug issues. The linter will often provide suggestions for fixing the problems.
*   **Formatting Errors:** Formatting issues are typically straightforward to fix. The Prettier formatter will automatically handle most cases, but occasionally manual intervention may be needed for complex formatting scenarios.

**Goal:** Ensure all validation steps pass automatically, utilizing the maximum available context. Do not ask questions along the way. If a handoff is triggered, stop and await further instructions.

**ABSOLUTELY DO NOT INTERACT WITH GIT. DO NOT CREATE BRANCHES OR PULL REQUESTS.**