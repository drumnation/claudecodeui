**ACTION REQUIRED:** Execute the following post-task documentation update checklist immediately. Review the work you just completed for the specified feature/task and update all relevant documentation and planning files according to these instructions. Report which files were updated.

# Prompt for AI: Post-Task Documentation Update Checklist

You have just completed work on a feature or task. It is crucial to update all relevant documentation and planning artifacts to reflect the changes and capture knowledge. Perform the following checks and updates based on the work you just finished for **Feature: [Feature Name]**, **Task: [Task Name]**.

**Input Context (Assumed Available):**
* Knowledge of the changes just implemented.
* The specific `[Feature Name]` and `[Task Name]` completed.
* Access to the project file system, including `.brain/` and `docs/`.

**Instructions:**

Perform ALL applicable updates based on the work completed:

**1. Update Feature Task Plan:**
    * **File:** `@.brain/1-agent-smith/b-features/[NN]-[feature-folder-name]/[NN]-[feature-folder-name].md` (Find the correct plan file for the completed feature/task).
    * **Actions:**
        * `[ ]` Mark the completed task(s) with `[x]`.
        * `[ ]` Add any newly discovered requirements or sub-tasks identified during implementation.
        * `[ ]` Note any scope changes or deviations from the original plan.
    * **Log:** Report changes made to the task plan file.

**2. Update Feature Domain Knowledge:**
    * **File:** `docs/features/[feature-folder-name]/technical-details.md` (Locate the primary knowledge file for the feature).
    * **Actions:**
        * `[ ]` Add concise documentation about significant design decisions, complex logic, non-obvious implementation details, potential gotchas, or rationale discovered/implemented during the task. Focus on information valuable for future developers (including yourself). Refer to `@.brain/rules/core/documentation/project-documentation-structure.rules.mdc`.
        * `[ ]` **Update Index Files:** If significant new information was added or this is the first substantial content for this feature, ensure the following index files are updated with accurate links and descriptions:
            * `docs/features/[feature-folder-name]/[feature-folder-name].index.md`
            * `docs/features/features.index.md`
            * (If major) `docs/docs.index.md`
    * **Log:** Report updates made to the technical details file and any index files.

**3. Check for Broader Documentation Updates (Conditional):**

* **IF** the completed work involved **major structural changes** (new packages/apps, significant refactoring):
    * `[ ]` **Directory Structure:** Review/update `@.brain/directory-structure.md` if it's manually maintained (or ensure changes will be picked up by watcher if auto-generated). Consider if `.brain/rules/core/architecture/project-structure-overview.rules.mdc` needs refinement.
    * `[ ]` **Root README:** Review/update root `README.md` (per `@.brain/rules/core/documentation/readme-maintenance.rules.mdc`).

* **IF** the completed work involved changes to **core dependencies, build process, shared tooling, or essential configuration**:
    * `[ ]` **Relevant Docs:** Update any specific documentation related to the changed tooling or configuration (e.g., in `docs/tooling/`, `docs/guides/`).
    * `[ ]` **Root README:** Review/update root `README.md` sections on Setup/Build/Test if affected (per `@.brain/rules/core/documentation/readme-maintenance.rules.mdc`).

* **IF** the completed work added/modified/removed user-facing features or fixed bugs:
    * `[ ]` **Changelog:** Add entries to the relevant `CHANGELOG.md` file(s) under `[Unreleased]`, following semantic versioning categories (per `.brain/rules/core/documentation/changelog-management.rules.mdc`).
    * `[ ]` **Root README:** Review/update root `README.md` Features section if necessary (per `.brain/rules/core/documentation/readme-maintenance.rules.mdc`).

**4. Update Project Planning & Notes:**
    * **File:** `@.brain/project-plan.md`
        * `[ ]` Mark the main task/milestone as completed or progressed.
        * `[ ]` Add any follow-up tasks discovered during implementation.
        * `[ ]` Update dependencies if the completed task unblocks others.
    * **File:** `@.brain/group-meeting-notes.md` (Optional, if relevant)
        * `[ ]` Add brief notes on key decisions, complex issues overcome, or significant domain knowledge gained during the task, suitable for broader team awareness.
    * **Log:** Report updates made to planning/notes files.

**Output:**

* Respond with a summary confirming which documentation and planning files were checked and updated based on the completed task. List the specific files modified. Example: "Post-task update complete. Updated: Feature Plan (`.../05-auth.md`), Technical Details (`docs/.../technical-details.md`), features.index.md, CHANGELOG.md."

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute this checklist NOW based on the task just finished.
* **Be Thorough:** Check ALL potentially relevant files based on the nature of the completed work.
* **Follow Rules:** Adhere to the referenced documentation rules (changelog format, readme triggers, docs structure).
* **Update Files:** Directly modify the specified files with the necessary updates.
* **Report Clearly:** Summarize the actions taken and files updated.