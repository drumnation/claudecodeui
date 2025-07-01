**ACTION REQUIRED:** Execute the following rule templating task immediately. Analyze the provided specific `.rules.mdc` file content and generalize it into a template format (`.template.mdc`) with placeholders and guidance notes. Output ONLY the generated template content. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Generate Rule Template from Specific Rule

**Objective:** Convert an existing, project-specific `.rules.mdc` file into a generic template (`.template.mdc`) suitable for inclusion in a distributable library (like Braingarden core). The template should use placeholders for specific details and include guidance for users on how to customize it.

**Input:**

1.  **Specific Rule File Content:** [The FULL content of the `.rules.mdc` file to be templated is expected immediately AFTER this prompt text.]
2.  **Proposed Template Filename (Optional):** [User may suggest a name, e.g., `my-rule.template.mdc`]

**Templating Process:**

1.  **Analyze Specific Rule:** Read the input rule content. Identify parts that are highly specific to the original project (e.g., specific file paths like `.brain/...`, project names, specific tool names like `@kit/...`, unique procedural steps, hardcoded values).
2.  **Generalize & Add Placeholders:** Replace the identified specific details with clear, descriptive placeholders (e.g., `[Your Project's Task File Path]`, `[Your Tooling Namespace]`, `[Describe Condition X]`, `[Placeholder Value]`). Use a consistent placeholder format like `[THIS_FORMAT]`.
3.  **Add Guidance Notes:** For each placeholder or complex section, add comments or instructions (using Markdown comments `` or distinct text blocks) explaining *what* kind of information the user needs to provide or customize. Explain the *purpose* of different sections.
4.  **Preserve Structure:** Maintain the overall structure, frontmatter (adjust `description` to mention it's a template), title, timestamp line (maybe replace specific date with `[YYYY-MM-DD]`), and general formatting of the original rule.
5.  **Format Output:** Assemble the generalized content into the complete `.template.mdc` format.

**Output:**

* Respond ONLY with the full, valid Markdown content for the generated `.template.mdc` file, including the modified frontmatter and guidance notes. Start the response directly with `---`.

**Example Output Structure:**

```mdc
---
description: "[Template] Provides a structure for defining [Original Rule Purpose]. Customize placeholders for your project."
globs: "[Usually '*' or specific patterns relevant to the template's purpose]"
alwaysApply: [true/false - Set appropriate default]
---
# [Template] [Original Rule Title]
# Last Updated: [YYYY-MM-DD - Or keep original date as reference]

## Section 1: [Original Section Title]

This rule applies when [CONDITION_PLACEHOLDER].

**Agent Actions:**
* Read file: `[PATH_TO_YOUR_PROJECT_FILE]` * Use tool: `[YOUR_TOOL_NAMESPACE]/[tool_name]` * ...

## Section 2: ...
```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Expect Specific Rule File Content immediately after this prompt.
* **Focus:** Generalize the input rule, replace specifics with placeholders `[LIKE_THIS]`, and add guidance comments for end-users.
* **Output Format:** Strictly output ONLY the full `.template.mdc` content including frontmatter. No extra text.

---
**(END OF PROMPT FILE CONTENT - Specific Rule File Content input expected immediately after this line)** 