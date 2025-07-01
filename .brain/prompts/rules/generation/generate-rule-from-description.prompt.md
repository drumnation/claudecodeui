**ACTION REQUIRED:** Execute the following rule generation task immediately. Use the user's description of desired agent behavior or project standard to generate the full content for a new `.rules.mdc` file. Output ONLY the generated `.rules.mdc` content. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Generate Rule File from Description

**Objective:** Generate the complete content for a new `.rules.mdc` file based on a natural language description of the desired rule or standard provided by the user.

**Input:**

1.  **Rule Description:** [A natural language description of the rule's purpose, triggers, desired agent behavior, or standard to enforce.]
2.  **Target Path/Category (Optional):** [User may specify the intended category, e.g., `agent/pattern`, `core/quality`, `tools/git`. Use this to inform the rule's context.]
3.  **Desired Filename (Optional):** [User may suggest a filename, e.g., `my-new-rule.rules.mdc`.]

**Generation Process:**

1.  **Analyze Description:** Understand the core requirement from the user's description. Identify the trigger conditions, the desired agent action/behavior, or the standard being defined.
2.  **Determine Frontmatter:**
    * `description:` Create a concise summary based on the input description.
    * `globs:` Determine appropriate file patterns if the rule is file-specific, otherwise use `"*"` or leave empty.
    * `alwaysApply:` Decide if this rule should always be active (`true`) or only contextually (`false` - usually requires more complex trigger logic not defined here, so default to `true` or base on description).
3.  **Create Title & Timestamp:** Generate a suitable `# Rule Title` and add the `# Last Updated:` line.
4.  **Draft Rule Content:** Write the main body of the rule in Markdown. Translate the user's description into clear, actionable instructions or definitions for the agent. Use headings, lists, and code blocks as appropriate. Ensure the content aligns with the typical structure and purpose of rules within the Braingarden system.
5.  **Format Output:** Assemble the frontmatter, title, timestamp, and rule content into the complete `.rules.mdc` format.

**Output:**

* Respond ONLY with the full, valid Markdown content for the generated `.rules.mdc` file, including the YAML frontmatter. Start the response directly with `---`.

**Example Output Structure:**

```mdc
---
description: [Generated description]
globs: [Generated glob pattern or "*"]
alwaysApply: [Generated boolean]
---
# [Generated Rule Title]
# Last Updated: 2025-04-01 07:10:38 PM EDT

[Generated rule content based on user description...]
```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input:** Expect user's description, optional path/filename.
* **Focus:** Translate the description into a well-structured `.rules.mdc` file.
* **Output Format:** Strictly output ONLY the full `.rules.mdc` content. No extra text.

---
**(END OF PROMPT FILE CONTENT - User description, optional path/filename expected after this line)** 