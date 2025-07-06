**ACTION REQUIRED:** Execute the following rule documentation generation task immediately. Analyze the provided Rule File Content and generate a concise Markdown snippet suitable for inclusion in a user-facing knowledge base or documentation site. Output ONLY the generated Markdown snippet. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Generate Documentation for Rule File

**Objective:** Generate clear, user-friendly documentation explaining the purpose and usage of a specific `.rules.mdc` file.

**Input:**

1.  **Rule File Content:** [The FULL content of the `.rules.mdc` file to be documented is expected immediately AFTER this prompt text.]
2.  **Rule File Path (Optional):** [The path to the rule file, e.g., `sync-rules/core/quality/my-rule.rules.mdc`, might be provided for context.]

**Generation Process:**

1.  **Analyze Rule Content:** Read the input rule file content. Extract key information:
    * The primary purpose (from the `# Title` and `description` in frontmatter).
    * The trigger conditions (`globs`, `alwaysApply`, or activation context mentioned in the description/body).
    * The core behavior or standard defined by the rule.
    * Any specific inputs the rule implies the agent needs.
    * Any specific outputs or actions the rule causes the agent to perform.
2.  **Synthesize Documentation:** Draft a concise explanation suitable for end-users or developers trying to understand the rule set. Focus on:
    * **What it does:** Briefly explain the rule's goal.
    * **When it applies:** Explain the trigger conditions.
    * **How it works:** Summarize the key instructions or standards defined.
    * **(If applicable) How to use/configure:** Mention if user input is needed or if it references other configurable elements.
3.  **Format Output:** Structure the explanation using Markdown headings and lists for readability.

**Output Format:**

Respond ONLY with a single Markdown snippet documenting the rule. Do not include introductory or concluding text.

```markdown
### Rule: `[Rule Title or Filename]`

**Path:** `[Rule File Path, if provided/inferrable]`

**Description:** [Extracted/Summarized from frontmatter description]

**Activation:** [Explain when this rule applies, based on `alwaysApply`, `globs`, or description. e.g., "Always active.", "Applies to `.ts` and `.tsx` files.", "Activated when Git commit operations are requested."]

**Purpose:**
[Provide a more detailed explanation of what standard this rule enforces or what behavior it controls, based on the rule's main content. Use bullet points for key aspects.]
* Enforces [Standard X]...
* Guides the agent to [Perform Action Y]...
* Requires [Input Z]...

**Usage Notes:**
* [Add any brief notes on how a user might interact with this rule, or configuration points, if applicable.]
```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Expect Rule File Content immediately after this prompt.
* **Focus:** Explain the rule clearly and concisely for human understanding.
* **Output Format:** Strictly output ONLY the Markdown documentation snippet.

---
**(END OF PROMPT FILE CONTENT - Rule File Content input expected immediately after this line)** 