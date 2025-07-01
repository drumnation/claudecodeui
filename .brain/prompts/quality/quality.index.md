# 🏆 Code Quality Prompts Index

A collection of prompts aligned with the **Safe, Modular Code Quality Philosophy**:  
Quality validation should be non-destructive, modular, and focused on gradually improving code without disrupting development flow.

---

## 🔧 Prompt List

### 1. [`typecheck-code.prompt.md`](./typecheck-code.prompt.md)
**Use when:** You want to identify TypeScript type errors without making changes.

**Behavior:**  
- Runs TypeScript type checking  
- Reports errors with file locations
- Provides actionable context for each error
- Never modifies code

---

### 2. [`lint-code.prompt.md`](./lint-code.prompt.md)
**Use when:** You want to identify and safely fix linting issues.

**Behavior:**  
- Runs ESLint with `--fix` when safe  
- Applies only automatic fixes
- Reports remaining issues needing manual attention
- Never changes application logic

---

### 3. [`format-code.prompt.md`](./format-code.prompt.md)
**Use when:** You want to standardize code formatting across the project.

**Behavior:**  
- Runs Prettier or other formatters  
- Applies formatting changes immediately
- Reports which files were affected
- Never asks user questions - formatting is safe

---

### 4. [`validate-code-quality.workflow.md`](./validate-code-quality.workflow.md)
**Use when:** You want to run a complete quality validation pass.

**Behavior:**  
- Runs all three prompts in sequence  
- Provides a comprehensive quality report
- Suggests next steps based on findings
- Can be integrated into CI workflows

---

## 🧠 Quality Philosophy

**Safe:** Quality tools should never break working code. Each prompt applies only safe, reversible changes or reports issues without modifying code.

**Modular:** Each aspect of code quality (types, linting, formatting) is isolated into its own prompt, allowing selective application.

**Continuous:** Quality validation should be frequent and lightweight, integrated into development workflow rather than a blocking formality.

**Actionable:** Reports should provide clear guidance on what needs to be fixed and how, not just error lists.

**CI-Ready:** All prompts are designed to work in both interactive and CI environments, with structured output formats.

---

## 🧩 Usage in Monorepos

For monorepo projects, each prompt will:
1. Auto-detect if it should run in a specific package/app
2. Use the appropriate scoped commands
3. Fall back to prompting for scope if ambiguous 