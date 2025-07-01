# Workflow: Consult Project Documentation Before Acting

## Purpose
Ensure the agent consults existing project documentation before beginning feature planning, debugging, architecture decisions, or shared component creation — to reduce duplication, align with past decisions, and avoid introducing regressions.

---

## Step 1: Determine Scope

1. Identify the current objective:
   - Feature task planning
   - Error or bug investigation
   - Component refactor or design
   - Architecture or tooling decision

2. Extract any known identifiers:
   - Affected file paths
   - Package/app name
   - Feature name (if known)
   - Keywords from errors or PR titles

---

## Step 2: Prompt for Documentation Use

📥 **Run Prompt**: `@.brain/prompts/routine/use-project-docs.prompt.md`

**Input:**
- Purpose or context for this workflow (e.g., "Debugging form submission error in `apps/web/login.tsx`")
- Extracted identifiers from Step 1

---

## Step 3: Load Relevant Files

The agent should attempt to **read** and extract insight from relevant docs:
- `docs/features/[feature-name]/`
- `docs/concepts/`
- `docs/architecture/adr/`
- `docs/packages/[workspace]/`
- Root `README.md`, `CONTRIBUTING.md`, `PROJECT_GUIDELINES.md`

✅ If files are missing, the agent should:
- Acknowledge gaps
- Suggest a stub be created (and potentially scaffold it if a ruleset allows)

---

## Step 4: Integrate Knowledge

The agent must **apply** relevant insights:
- Reference prior decisions in plan or strategy
- Align naming, architecture, or file placement
- Avoid duplicating existing helpers or components

✅ Final output should include:
- ✅ “Docs Consulted” section with paths
- ✅ “Key Insights” summarized briefly
