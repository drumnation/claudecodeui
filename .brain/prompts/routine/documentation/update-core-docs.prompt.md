**ACTION REQUIRED:** Execute the following post-feature documentation update process immediately. Based on the feature just completed, update all relevant project-level documentation, planning artifacts, README, and Changelog according to the instructions. Report which files were updated.

# Prompt for AI: Post-Feature Project Documentation Update

You have just completed the implementation of a significant feature or milestone: **[Feature Name]**. It is now essential to update project-level documentation to reflect this work accurately.

**Input Context (Assumed Available):**
* Knowledge of the feature `[Feature Name]` just implemented.
* Access to the project file system, including `.brain/` and `docs/`.
* Access to relevant documentation standards rules (e.g., changelog, readme, docs structure).

**Instructions:**

Perform the following project-level updates based on the completed feature `[Feature Name]`:

**1. Update Core Project Planning:**
    * **File:** `@.brain/project-plan.md`
    * **Actions:**
        * `[ ]` Mark the main feature/milestone as complete.
        * `[ ]` Review and potentially reprioritize remaining features based on this completion.
        * `[ ]` Add any newly identified high-level tasks or dependencies stemming from this feature.
    * **Log:** Report changes made to the project plan.

**2. Update Shared Knowledge / Meeting Notes:**
    * **File:** `@.brain/group-meeting-notes.md`
    * **Actions:**
        * `[ ]` Add a summary of the completed feature `[Feature Name]`.
        * `[ ]` Document key architectural decisions, significant technical challenges overcome, or important domain knowledge gained during the feature's implementation that is relevant for broader team awareness.
    * **Log:** Report updates made to meeting notes.

**3. Update Structured Project Documentation (`/docs`):**
    * **Goal:** Ensure the central `/docs` knowledge base reflects the completed feature.
    * **Actions:**
        * `[ ]` **Consult Index:** Review `/docs/docs.index.md` and relevant sub-indexes (e.g., `/docs/architecture/architecture.index.md`, `/docs/concepts/concepts.index.md`).
        * `[ ]` **Update Architecture/Concepts:** If `[Feature Name]` introduced or significantly changed core architectural patterns or fundamental concepts, update or create relevant pages under `/docs/architecture/` or `/docs/concepts/`. Ensure these changes are reflected in the corresponding index files.
        * `[ ]` **Update Structure Doc:** If the feature involved changes tracked by `/docs/architecture/project-structure-overview.md` (or similar), update that document and its index.
        * `[ ]` **Finalize Feature Docs:** Ensure the specific documentation for this feature under `/docs/features/[feature-folder-name]/` (especially `technical-details.md`) is complete and accurate, summarizing the final implementation details and decisions. Verify its index (`[feature-folder-name].index.md`) is up-to-date.
    * **Log:** Report which specific files within `/docs` were checked, created, or updated.

**4. Update Root README.md:**
    * **Rule:** `@.brain/rules/core/documentation/readme-maintenance.rules.mdc`
    * **Action:**
        * `[ ]` Based on the completed feature `[Feature Name]`, assess if the root `README.md` requires updates according to the criteria in the maintenance rule (e.g., new major feature listed, updated usage/build commands, revised project overview).
        * `[ ]` If updates are needed, apply them clearly and concisely.
    * **Log:** Report whether README was checked and if updates were applied.

**5. Update CHANGELOG.md:**
    * **Rule:** `@.brain/rules/core/documentation/changelog-management.rules.mdc`
    * **Action:**
        * `[ ]` Determine the appropriate package(s) affected by `[Feature Name]`.
        * `[ ]` For each relevant package, add concise entries under the `[Unreleased]` section of its `CHANGELOG.md` file. Use the correct categories (Added, Changed, Fixed, etc.) based on the work done for the feature.
    * **Log:** Report which `CHANGELOG.md` file(s) were updated. *(Note: Version bumping happens separately during the release process defined in the changelog rule).*

**Output:**

* Respond with a summary confirming which project-level documentation and planning files were checked and updated following the completion of feature `[Feature Name]`. List the specific files modified. Example: "Post-feature update complete for '[Feature Name]'. Updated: project-plan.md, group-meeting-notes.md, /docs/architecture/overview.md, /docs/features/auth/technical-details.md, features.index.md, root README.md, packages/core/CHANGELOG.md."

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute this checklist NOW based on the feature just completed.
* **Project-Level Focus:** Concentrate on updating documents reflecting the overall project state, architecture, and progress.
* **Use `/docs`:** Prioritize updating the structured documentation in the `/docs` folder for persistent knowledge.
* **Follow Rules:** Adhere to the referenced rules for README and Changelog updates.
* **Update Files:** Directly modify the specified files.
* **Report Clearly:** Summarize actions taken and files modified.