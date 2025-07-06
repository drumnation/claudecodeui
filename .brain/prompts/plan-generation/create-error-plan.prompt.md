# 🧩 Error Task Plan Generator

**Purpose:**  
Convert TypeScript, linting, formatting, or test errors into a structured `.brain/errors/` task plan. Break errors into MECE subtasks with clear, resolvable actions. Track and update progress as errors are fixed.

---

## 🛠 Instructions to the Agent:

**DO NOT START WRITING THE PLAN YET.**  
First, read the entire template and understand the steps. Then execute each step in order.

---

## Step 1: Determine Task Name and Folder Path

1. Use the error category or user input to derive `[Error Plan Name]` (e.g. `fix-ts-errors`, `test-failures-june`).
2. Sanitize to kebab-case: `[error-folder-name]`
3. Determine next number `NN` from `@.brain/errors/`
4. Create plan file:  
   `@.brain/errors/NN-[error-folder-name]/NN-[error-folder-name].md`

---

## Step 2: Analyze and Categorize the Errors

1. Group errors by type:
   - TypeScript
   - ESLint
   - Prettier/Format
   - Test Failures (unit, integration, e2e, Storybook)
2. Within each group:
   - Sort by file/module
   - Summarize error causes in plain language
   - Use collapsed sections for long output

---

## Step 3: Populate Task Plan Header

At the top of the plan file, write:

```md
# Error Remediation Plan

## Title: [Error Plan Name]
## Created: [YYYY-MM-DD]
## Status: ⭕ Planning
```

---

## Step 4: Generate Task List

Create a checklist in this format:

```md
## Tasks

- [ ] Fix type mismatch in `src/utils/time.ts`
  - Summary: Argument of type `Date` not assignable to parameter of type `string`.
  - Error: `TS2345`
  - Reference: `Read @.brain/knowledge/ts-narrowing-guide`

- [ ] Fix ESLint no-unused-vars in `src/pages/home.tsx`
  - Rule: `no-unused-vars`
  - Suggestion: Remove or use declared variable `debug`
  - Reference: `Read @.brain/knowledge/eslint-fix-guide`

- [ ] Resolve test failure in `LoginForm.test.tsx`
  - Assertion failed: “should show error on empty email”
  - Command: `pnpm run test -- LoginForm.test.tsx`
```

✅ Each task must:
- Target one issue or logically related group
- Be implementation-ready
- Link to reference if applicable

---

## Step 5: Track Progress

1. Use standard `[ ]` task format.
2. Agent should update task statuses:
   - `[x]` when complete
   - Add inline status (e.g., “Blocked by schema mismatch”)
3. When all are ✅:
   - Move entire folder to `.brain/errors/.complete/`
   - Report move location

---

## Step 6: Output Format

The result is a Markdown file like:

```md
# Error Remediation Plan

## Title: fix-ts-lint-errors
## Created: 2025-04-04
## Status: ⭕ In Progress

## Tasks

- [x] Fix type error in `AuthProvider.tsx`
  - TS error TS2769: No overload matches this call
- [ ] Update test in `ResetPassword.test.ts`
  - Assertion mismatch on expected toast message
- [ ] Remove unused import in `LoginModal.tsx`
  - ESLint rule: no-unused-vars
```

---

## 🔁 Reuse Rules

- Do not bundle feature planning and error resolution in one file.
- Keep plans scoped to one dominant error type if possible.
- Future agents will treat `.brain/errors/*.md` as actionable backlogs.