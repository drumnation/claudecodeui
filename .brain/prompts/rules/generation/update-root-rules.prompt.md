**ACTION REQUIRED:** Execute the following root-level rules file configuration task immediately. Create and configure the `.cursorrules`, `.clinerules`, and `.windsurfrules` files at the project root based on the requirements outlined below. Output ONLY the specified JSON confirmation object upon successful completion. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Implement Root-Level Rules Configuration

**Objective:**
Create and configure the essential root-level rules files (`.cursorrules`, `.clinerules`, `.windsurfrules`) for the editor ecosystem within the current project root directory.

**Context:**
* These configuration files reside at the **root** of the project.
* `.cursorrules`: Used by the Cursor editor. Intended to be **lightweight**, potentially bootstrapping or complementing project-specific rules found elsewhere (e.g., in `.brain/rules` or `sync-rules`).
* `.clinerules`: Used *exclusively* by the client editor (root client editor). Does **not** use project-specific rules. Requires **comprehensive** configuration.
* `.windsurfrules`: Used *exclusively* by the windsurf component. Does **not** use project-specific rules. Requires **comprehensive** configuration tailored to its needs.

**Instructions:**

1.  **Verify Location:** Confirm you are operating at the project's root directory before creating files.
2.  **Consult Knowledge (Conceptual):** Access your internal knowledge about typical configuration options for editor rules files (like linting toggles, formatting settings, behavior flags) to inform the content you generate.
3.  **Create/Update `.cursorrules`:**
    * **Action:** Create or overwrite the file named `.cursorrules` in the root directory. Use appropriate file writing tools.
    * **Content:** Generate lightweight configuration. Focus on global settings essential for Cursor itself or settings needed to *load/activate* the more detailed project-specific rules stored elsewhere (e.g., `.brain/rules/` or `sync-rules/`). Include comments explaining the purpose and the lightweight approach.
        *Example (Conceptual - Adapt based on actual Cursor capabilities):*
        ```plaintext
        # .cursorrules - Root Configuration (Lightweight)
        # Last Updated: 2025-04-01 07:28:35 PM EDT

        # Prioritize loading project-specific rules if available
        UseProjectRules: true
        # Specify path if needed, e.g., ProjectRulesPath: .brain/rules

        # Essential global overrides or settings needed before project rules load
        Editor.Encoding: utf-8
        Editor.DefaultLanguageMode: auto

        # Fallback settings if project rules fail to load
        Formatting.IndentSize: 2
        Formatting.UseTabs: false
        ```
    * **Log:** Report successful creation/update.

4.  **Create/Update `.clinerules`:**
    * **Action:** Create or overwrite the file named `.clinerules` in the root directory. Use appropriate file writing tools.
    * **Content:** Generate **comprehensive** configuration covering all necessary editor behaviors, formatting standards (indentation, spacing, line endings, etc.), linting integrations/preferences, language-specific settings, and any features specific to the client editor. Add detailed comments.
        *Example (Conceptual - Needs actual valid settings):*
        ```plaintext
        # .clinerules - Comprehensive Configuration for Client Editor
        # Last Updated: 2025-04-01 07:28:35 PM EDT

        # Behavior
        Editor.AutoSave: onWindowChange
        Editor.HighlightCurrentLine: true
        Editor.WordWrap: on
        # ... many more behavior settings

        # Formatting
        Formatting.DefaultIndent: 4 spaces
        Formatting.TrimTrailingWhitespace: true
        Formatting.InsertFinalNewline: true
        # ... language-specific formatting overrides ...

        # Linting
        Linting.EnableESLint: true
        Linting.ESLintConfigPath: ./.eslintrc.json # Example path
        # ... other linter settings ...

        # Client-Specific Features
        ClientFeatureX.Enable: true
        ClientFeatureY.Mode: "advanced"
        # ...
        ```
    * **Log:** Report successful creation/update.

5.  **Create/Update `.windsurfrules`:**
    * **Action:** Create or overwrite the file named `.windsurfrules` in the root directory. Use appropriate file writing tools.
    * **Content:** Generate **complete** configuration specifically for the windsurf component. Address its unique requirements, data handling, rendering modes, or other specific behaviors. Add detailed comments.
        *Example (Conceptual - Needs actual valid settings):*
        ```plaintext
        # .windsurfrules - Comprehensive Configuration for Windsurf Component
        # Last Updated: 2025-04-01 07:28:35 PM EDT

        # Windsurf Core Settings
        Windsurf.RenderEngine: v2
        Windsurf.DataPrefetching: true
        Windsurf.CacheDurationMinutes: 60
        # ... more component-specific settings

        # Interaction with Editor/Environment (if applicable)
        Integration.UpdateOnSave: false
        # ...
        ```
    * **Log:** Report successful creation/update.

6.  **Final Verification Note:** Conclude by noting that while the files have been created, manual testing within each respective editor environment (Cursor, Client Editor, Windsurf) is recommended to fully verify the effects of the configurations.

**Output:**

* Respond ONLY with a single JSON object confirming the successful creation or update of the files.

    ```json
    {
      "status": "Success",
      "files_configured": [
        ".cursorrules",
        ".clinerules",
        ".windsurfrules"
      ],
      "notes": "Root-level rule files created/updated in the project root. Manual testing in each respective editor (Cursor, Client, Windsurf) is recommended to verify configuration effects."
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **File Location:** ALL files MUST be created/updated in the project's root directory.
* **Content Differentiation:** Ensure `.cursorrules` is lightweight/complementary, while `.clinerules` and `.windsurfrules` are comprehensive and standalone based on their respective needs.
* **File I/O:** Use appropriate tools/commands to create or overwrite these files with the generated content. Report errors if file writing fails.
* **Output Format:** Strictly output ONLY the specified JSON confirmation object. No extra text or explanation.

---
**(END OF PROMPT FILE CONTENT - No further input expected after this line)**