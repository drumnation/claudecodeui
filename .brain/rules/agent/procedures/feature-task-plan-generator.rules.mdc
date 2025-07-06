---
description: When the user provides a description or title of a new or planned feature and expects a detailed implementation plan or task breakdown.
globs: 
alwaysApply: false
---
# Rule: Feature Task Plan Generator

Purpose:
Transform a high-level feature request or product task into a structured feature plan with MECE task breakdowns, architectural rationale, test strategy, and knowledge integration.

Activation Context:
- The user pastes a prompt or gives a title like “Create a feature plan for X”
- The user includes a description of a new or planned feature
- The agent is expected to create a reusable plan structure that can be tracked, updated, and shared

Behavior:
1. Create a new plan file under `.brain/[N-agentFirstName-agentLastName]/b-features/NN-[feature-name]/NN-[feature-name].md`
2. Populate the file using the full planning template, broken into:
   - Overview
   - Codebase Analysis
   - Architecture/Pattern Exploration
   - Project Task Foresight
   - Testing Strategy
   - MECE Task Breakdown + TDD + Knowledge

3. Scaffold supporting documentation files in `docs/features/[feature-folder-name]/`
4. Cross-link `.brain` plan to `docs` and index it in `docs/features/features.index.md`
5. Structure all subtasks with checkboxes and timestamp updates to allow agent progress tracking

Best Practices:
- Always follow TDD-first breakdown
- Keep subtasks atomic and MECE
- Integrate relevant `.brain/knowledge/*` docs per task

Notes:
- This is ideal for work that should not be attempted as a one-shot execution
- Enables multi-agent collaboration and strong agent-to-agent handoff memory

Finalization:
- When the task plan is fully completed (i.e., all checklist items are marked as done), automatically move the folder:

  From:
  ```
  .brain/[N-agentFirstName-agentLastName]/b-features/NN-[feature-folder-name]/
  ```

  To:
  ```
  .brain/[N-agentFirstName-agentLastName]/b-features/.complete/NN-[feature-folder-name]/
  ```

- Log the move, and if applicable, update any dashboards or index references

Example Input Triggers:
- "I need a full plan for building a notifications system"
- "Break down this invoicing module into subtasks"
