# Prompt: Use Project Documentation

## Goal
Before beginning a feature, task, or debugging effort, load and integrate relevant documentation to guide your plan and reduce unnecessary rework.

---

## Instructions:

1. **Identify what you're working on**:
   - Feature name or file path
   - Package or app involved
   - Known issues, if debugging

2. **Read related documentation** from:
   - `docs/features/[feature-name]/`
   - `docs/concepts/`
   - `docs/packages/[workspace]/`
   - `docs/architecture/adr/`
   - `README.md`, `ONBOARDING.md`, `CONTRIBUTING.md`

3. **Extract relevant context**, such as:
   - Prior decisions
   - Component usage patterns
   - Known issues, pitfalls, or TODOs
   - Existing architectural rationale

4. **Apply what you’ve learned**:
   - Update your feature plan, test plan, or fix strategy to align
   - Reuse any established patterns, names, or helpers
   - Reference documentation sources inline in your task if appropriate

5. **Log Usage (Optional)**:
   - In your output, list the documents you consulted and summarize the insights that influenced your choices.

---

## Trigger Context:
Use this before:
- Feature task planning
- Debugging complex issues
- Writing shared utilities or components
- Reviewing architecture
