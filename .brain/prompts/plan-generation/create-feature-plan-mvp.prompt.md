# Feature Task: Architect & Plan Generator

## 1. Core Functionality
What's the simplest implementation that could possibly work?

## 2. Subtasks (Maximum 5)
- [ ] Build the happy path
- [ ] Add basic error handling
- [ ] Create integration test
- [ ] Document how to use it

## 3. Definition of Done
- [ ] Integration test passes
- [ ] Human can use it successfully
- [ ] Ready for feedback

**Purpose:** To equip the Agent with a detailed, actionable plan for the next high-priority feature, ensuring a deep understanding of the codebase, architectural considerations, and a clear path for implementation with a focus on MECE breakdown and prioritized TDD. The agent will track its progress in the plan, marking tasks as complete, in progress, or blocked.

## Instructions to the Agent:

**DO NOT START WRITING THE PLAN YET.**

First, read this entire template and understand your process. Then, execute each step in order. Your goal is to fill in each section of the plan template below using the instructions provided in each step.

---

## Step 1: Determine the Next Feature and Task

1.  **Identify the next high-priority feature:** Consult the main project task list: `@.brain/project-plan.md`.
2.  **Select the next task:** Choose the most important uncompleted task within that feature. Let `[Feature Name]` be the descriptive name of the feature (e.g., "User Authentication") and `[Task Name]` be the specific task. Sanitize `[Feature Name]` to create a folder-friendly version, `[feature-folder-name]` (e.g., "user-authentication").
3.  **Create/Locate Feature Plan Folder:**
    * Scan `@.brain/1-agent-smith/b-features/` for the highest numbered existing feature folder.
    * Determine the next incremented number `NN`.
    * Create the feature plan directory if it doesn't exist: `@.brain/1-agent-smith/b-features/NN-[feature-folder-name]/`. This is where the plan file you generate will live (`NN-[feature-folder-name].md`). Log this path.
4.  **Prepare Feature Documentation Structure in `/docs`:**
    * **Define Paths:**
        * Feature Docs Folder Path: `docs/features/[feature-folder-name]/`
        * Feature Index File Path: `docs/features/[feature-folder-name]/[feature-folder-name].index.md`
        * Feature Details File Path: `docs/features/[feature-folder-name]/technical-details.md` (Primary domain skill-jacks file for this feature)
        * Parent Index File Path: `docs/features/features.index.md`
        * Root Index File Path: `docs/docs.index.md`
    * **Create Feature Docs Folder:** Execute `mkdir -p [Feature Docs Folder Path]` to ensure the directory exists. Log action.
    * **Create/Update Feature Index File:**
        * Check if `[Feature Index File Path]` exists.
        * If not, create it with a basic structure linking to the details file:
          ```markdown
          # Feature: [Feature Name]

          Overview of documentation for the [Feature Name] feature.

          * [Technical Details](./technical-details.md): In-depth implementation notes, decisions, and domain skill-jacks.
          ```
        * If it exists, ensure it accurately reflects the planned documentation structure. Log action (created/verified).
    * **Create Initial Feature Details File:**
        * Create the file at `[Feature Details File Path]`.
        * Populate it with a **template structure** for capturing domain skill-jacks *later*, during/after implementation. Include headers like:
          ```markdown
          # Technical Details: [Feature Name]

          ## Overview
          <TO_FILL: Brief description of the feature's purpose and high-level approach.>

          ## Key Design Decisions & Rationale
          <TO_FILL: Document significant choices made during planning/implementation and why.>
          * Decision 1: ... Rationale: ...
          * Decision 2: ... Rationale: ...

          ## Implementation Notes
          <TO_FILL: Add notes about complex logic, tricky parts, non-obvious dependencies, or setup requirements.>

          ## Usage / API (If Applicable)
          <TO_FILL: How to use this feature or its exposed API.>

          ## Gotchas / Known Issues
          <TO_FILL: Any potential pitfalls, edge cases, or unresolved minor issues.>
          ```
        * Log action: "Created initial template at `[Feature Details File Path]`".
    * **Update Parent Index Files (CRITICAL for discoverability):**
        * **Read:** Load the content of `[Parent Index File Path]` (`docs/features/features.index.md`).
        * **Modify:** Add a new list item linking to the *feature's index file* if it doesn't already exist. Keep the list organized (e.g., alphabetically). Example line to add:
          `* [[Feature Name]](./[feature-folder-name]/[feature-folder-name].index.md): [Brief description of the feature]`
        * **Write:** Save the updated content back to `[Parent Index File Path]`. Log action.
        * **Consider Root Index:** Briefly check `[Root Index File Path]` (`docs/docs.index.md`). If this feature represents a major new section of the project, consider adding a link there to the feature index as well, otherwise, skip updating the root index for minor features. Log action if updated.
5.  **Populate Initial Plan Sections:**
    * Fill in the following in the main plan file (`NN-[feature-folder-name].md`) being generated:
        * `## Feature:` `[Feature Name]`
        * `## Task:` `[Task Name]`
        * `## Status:` ⭕ Planning
        * `## Last Updated:` [Current Date: YYYY-MM-DD]
        * `## Related Documentation:` (Add this new section)
            * `- Feature Index: [Link using relative path from .brain/... to docs/... e.g., ../../../../docs/features/[feature-folder-name]/[feature-folder-name].index.md]`
            * `- Technical Details Doc: [Link using relative path e.g., ../../../../docs/features/[feature-folder-name]/technical-details.md]`

---
## Step 2: Deep Codebase Analysis

1.  **Immerse yourself in the relevant code:**
    *   Start with the feature's entry point (if known).
    *   Trace code execution paths related to the task.
    *   Identify key files, classes, functions, and modules.
2.  **Analyze dependencies:**
    *   Identify internal and external dependencies.
    *   Note library versions and potential compatibility issues.
    *   Refer to `package.json`, `requirements.txt`, or similar for dependency information.
3.  **Populate the following in the plan template:**
    *   `## 2. Codebase Analysis`
    *   `### 2.1. Key Files & Modules`
        *   `[File/Module Path]:` \[Brief description of its role]
    *   `### 2.2. Dependencies`
        *   `[Library/Module Name]:` \[Version, purpose, and any known issues]
    *   `### 2.3. Potential Concerns`
        *   \[Any areas of the code that appear complex, fragile, or require special attention]
        *   \[ ] Mark as addressed

## Step 3: Architectural Exploration and Decision

1.  **Review software architecture paradigms:**
    *   Consider options like MVC, MVP, MVVM, Microservices, Event-Driven, etc.
    *   Refer to skill-jacks resources for guidance: `@.brain/skill-jacks/`

    *   **IF** the feature involves significant UI changes, **THEN** review `@.brain/prompts/style-debug.md` for guidance on UI/UX best practices and debugging strategies.
2.  **Explore relevant design patterns:**
    *   Consider patterns like Singleton, Factory, Observer, Decorator, Strategy, etc.
    *   Refer to skill-jacks resources: `@.brain/skill-jacks/`
3.  **Document and analyze options:**
    *   Document at least 3 different architectural and design pattern combinations that could be used to implement the feature
    *   Analyze the pros and cons of each option, considering factors like:
        *   Scalability
        *   Maintainability
        *   Testability
        *   Complexity
        *   Team expertise
4.  **Engage in a discussion with the user (me) to select the best option:**
    *   Present a summary of your findings, highlighting the recommended option and the rationale behind it.
    *   Answer any questions I have and incorporate feedback.
5.  **Populate the following in the plan template:**
    *   `## 3. Architectural Considerations`
    *   `### 3.1. Selected Paradigm`
        *   \[Paradigm] - \[Brief description and rationale]
        *   \[ ] Confirmed with the user
    *   `### 3.2. Selected Design Patterns`
        *   \[Pattern 1] - \[Brief description and rationale]
        *   \[ ] Confirmed with the user
        *   \[Pattern 2] - \[Brief description and rationale]
        *   \[ ] Confirmed with the user
    *   `### 3.3. Architectural Considerations & Rationale`
        *   \[Detailed explanation of the chosen architecture and design patterns, including pros and cons considered. Address any trade-offs made.]
        *   \[ ] Confirmed with the user

## Step 4: Project Task List Foresight

1.  **Review the entire project task list:** `[Link to the project task list]`
2.  **Identify potential downstream impacts:**
    *   Analyze how decisions made for this task might affect future tasks.
    *   Consider dependencies, data structures, and architectural choices.
3.  **Populate the following in the plan template:**
    *   `## 4. Project Task List Foresight`
    *   `### 4.1. Downstream Impacts`
        *   \[How this task might affect other tasks in the project plan]
        *   \[ ] Reviewed and confirmed no negative impacts
    *   `### 4.2. Future-Proofing Considerations`
        *   \[Recommendations to mitigate negative impacts or leverage synergies]
        *   \[ ] Discussed with the user and incorporated feedback

## Step 5: Determine Available Testing Options

1.  **Analyze the `apps` directory:**
    *   Read `@.brain/directory-structure.md` to understand the project's testing setup.
    *   Examine the `apps` directory to identify available testing libraries and frameworks.
2.  **Identify applicable testing types:**
    *   Based on your analysis, determine which of the following testing types are relevant and available:
        *   **Unit Tests:** For testing individual functions or modules (business logic, NOT component rendering).
        *   **Integration Tests:** For testing interactions between different parts of the system (e.g., services, databases, APIs).
        *   **End-to-End (E2E) Tests:** For testing the application flow from the user's perspective (UI interactions).
        *   **Visual Regression Tests (Storybook):** For detecting visual changes in UI components using snapshots.
        *   **Storybook Interaction Tests:** For writing test cases within Storybook components.
3.  **Populate the following in the plan template:**
    *   `## 5. Testing Strategy`
    *   `### 5.1. Available Testing Options`
        *   `[ ] Unit Tests`
            *   Location: `[Path to unit test directory]`
            *   Command to run all tests: `[Command]`
            *   Command to run a single test: `[Command]`
            *   Relevant Skill Jacks: `Read @.brain/skill-jacks/unit-testing-guide` (if applicable)
        *   `[ ] Integration Tests`
            *   Location: `[Path to integration test directory]`
            *   Command to run all tests: `[Command]`
            *   Command to run a single test: `[Command]`
            *   Relevant Skill Jacks: `Read @.brain/skill-jacks/integration-testing-guide` (if applicable)
        *   `[ ] End-to-End (E2E) Tests`
            *   Location: `[Path to E2E test directory]`
            *   Command to run all tests: `[Command]`
            *   Command to run a single test: `[Command]`
            *   Relevant Skill Jacks: `Read @.brain/skill-jacks/e2e-testing-guide` (if applicable)
        *   `[ ] Visual Regression Tests (Storybook)`
            *   Location: `[Path to Storybook stories]`
            *   Command to run tests: `[Command]`
            *   Relevant Skill Jacks: `Read @.brain/skill-jacks/storybook-visual-testing-guide` (if applicable)
        *   `[ ] Storybook Interaction Tests`
            *   Location: `[Path to Storybook stories]`
            *   Command to run tests: `[Command]`
            *   Relevant Skill Jacks: `Read @.brain/skill-jacks/storybook-interaction-testing-guide` (if applicable)

    *   `### 5.2. Selected Testing Approach`
        *   \[Clearly state which testing types will be used for this feature and why. Explain how the chosen testing strategy ensures comprehensive coverage.]
        *   \[ ] Confirmed testing approach aligns with project standards.

## Step 6: MECE Task Breakdown & Skill Jacks Integration

1.  **Apply MECE (Mutually Exclusive, Collectively Exhaustive) principles:**
    *   Decompose the task into smaller, distinct subtasks.
    *   Ensure no overlap between subtasks (Mutually Exclusive).
    *   Ensure all subtasks together cover the entire scope of the main task (Collectively Exhaustive).
    *   Determine a logical order of operations that prioritizes writing tests before code, following a TDD approach.
2.  **Integrate skill-jacks resources:**
    *   For each subtask, identify relevant guides, best practices, or documentation from `@.brain/skill-jacks/index.md`.
    *   Provide direct links using the `@` notation: `Read @.brain/skill-jacks/path-to-guide`
3. **Integrate Testing Tasks**
    * For each subtask, integrate the testing strategy determined in Step 5.
    *   Clearly define which type of testing will be applied (unit, integration, E2E, visual, or Storybook interaction).
    *   Write specific test cases for each subtask, following the guidelines from `validate-test-suite.md`
4.  **Populate the following in the plan template:**
    *   `## 6. MECE Task Breakdown & TDD Plan`
        *   `### 6.1. Subtask 1: [Task Description]`
            *   `[ ]` \[ ] Task completed.
            *   `[ ]` \[Specific test cases to be written, referencing the selected testing type from Step 5]
            *   `[ ]` \[ ] Test cases reviewed and approved.
            *   Relevant Skill Jacks: `Read @.brain/skill-jacks/relevant-guide`
            *   Testing Type: \[Unit/Integration/E2E/Visual/Storybook Interaction]
        *   `### 6.2. Subtask 2: [Task Description]`
            *   `[ ]` \[ ] Task completed.
            *   `[ ]` \[Specific test cases to be written, referencing the selected testing type from Step 5]
            *   `[ ]` \[ ] Test cases reviewed and approved.
            *   Relevant Skill Jacks: `Read @.brain/skill-jacks/another-guide`
            *   Testing Type: \[Unit/Integration/E2E/Visual/Storybook Interaction]
        *   `### 6.3. Subtask 3: [Continue adding subtasks in a similar manner]`
            *   `[ ]` \[ ] Task completed
            *   `[ ]` \[Follow the testing, building, and test execution process for the whole task, ensuring tests are written before code]

    *   **IF** a subtask involves updating existing code, **THEN** execute the `code-review.md` process as part of the subtask.
    *   **IF** a subtask involves a handoff to another agent, **THEN** execute the `context-handoff.md` process as part of the subtask.

---

## Plan Template:

```markdown
# Feature Task Plan

## Feature: [Feature Name]

## Task: [Task Name]

## Status: ⭕ Planning

## Last Updated: [YYYY-MM-DD]

## 1. Overview

[Brief description of the task and its goals]

## 2. Codebase Analysis

### 2.1. Key Files & Modules

*   [File/Module Path]: [Brief description of its role]

### 2.2. Dependencies

*   [Library/Module Name]: [Version, purpose, and any known issues]

### 2.3. Potential Concerns

*   [Any areas of the code that appear complex, fragile, or require special attention]
*   [ ] Mark as addressed

## 3. Architectural Considerations

### 3.1. Selected Paradigm

*   [Paradigm] - [Brief description and rationale]
*   [ ] Confirmed with the user

### 3.2. Selected Design Patterns

*   [Pattern 1] - [Brief description and rationale]
*   [ ] Confirmed with the user
*   [Pattern 2] - [Brief description and rationale]
*   [ ] Confirmed with the user

### 3.3. Architectural Considerations & Rationale

*   [Detailed explanation of the chosen architecture and design patterns, including pros and cons considered. Address any trade-offs made.]
*   [ ] Confirmed with the user

## 4. Project Task List Foresight

### 4.1. Downstream Impacts

*   [How this task might affect other tasks in the project plan]
*   [ ] Reviewed and confirmed no negative impacts

### 4.2. Future-Proofing Considerations

*   [Recommendations to mitigate negative impacts or leverage synergies]
*   [ ] Discussed with the user and incorporated feedback

## 5. Testing Strategy

### 5.1. Available Testing Options

*   `[ ] Unit Tests`
    *   Location: `[Path to unit test directory]`
    *   Command to run all tests: `[Command]`
    *   Command to run a single test: `[Command]`
    *   Relevant Skill Jacks: `Read @.brain/skill-jacks/unit-testing-guide` (if applicable)
*   `[ ] Integration Tests`
    *   Location: `[Path to integration test directory]`
    *   Command to run all tests: `[Command]`
    *   Command to run a single test: `[Command]`
    *   Relevant Skill Jacks: `Read @.brain/skill-jacks/integration-testing-guide` (if applicable)
*   `[ ] End-to-End (E2E) Tests`
    *   Location: `[Path to E2E test directory]`
    *   Command to run all tests: `[Command]`
    *   Command to run a single test: `[Command]`
    *   Relevant Skill Jacks: `Read @.brain/skill-jacks/e2e-testing-guide` (if applicable)
*   `[ ] Visual Regression Tests (Storybook)`
    *   Location: `[Path to Storybook stories]`
    *   Command to run tests: `[Command]`
    *   Relevant Skill Jacks: `Read @.brain/skill-jacks/storybook-visual-testing-guide` (if applicable)
*   `[ ] Storybook Interaction Tests`
    *   Location: `[Path to Storybook stories]`
    *   Command to run tests: `[Command]`
    *   Relevant Skill Jacks: `Read @.brain/skill-jacks/storybook-interaction-testing-guide` (if applicable)

### 5.2. Selected Testing Approach

*   [Clearly state which testing types will be used for this feature and why. Explain how the chosen testing strategy ensures comprehensive coverage.]
*   [ ] Confirmed testing approach aligns with project standards.

## 6. MECE Task Breakdown & TDD Plan

*   ### 6.1. Subtask 1: [Task Description]
    *   `[ ]` \[ ] Task completed.
    *   `[ ]` \[Specific test cases to be written, referencing the selected testing type from Step 5]
    *   `[ ]` \[ ] Test cases reviewed and approved.
    *   Relevant Skill Jacks: `Read @.brain/skill-jacks/relevant-guide`
    *   Testing Type: \[Unit/Integration/E2E/Visual/Storybook Interaction]
*   ### 6.2. Subtask 2: [Task Description]`
    *   `[ ]` \[ ] Task completed.
    *   `[ ]` \[Specific test cases to be written, referencing the selected testing type from Step 5]
    *   `[ ]` \[ ] Test cases reviewed and approved.
    *   Relevant Skill Jacks: `Read @.brain/skill-jacks/another-guide`
    *   Testing Type: \[Unit/Integration/E2E/Visual/Storybook Interaction]
*   ### 6.3. Subtask 3: [Continue adding subtasks in a similar manner]`
    *   `[ ]` \[ ] Task completed
    *   `[ ]` \[Follow the testing, building, and test execution process for the whole task, ensuring tests are written before code]