**ACTION REQUIRED:** Execute the following rule refactoring analysis immediately. Analyze the provided Rule File Content for complexity, redundancy, or poor structure, and suggest specific refactoring actions. Output ONLY the Markdown report with suggestions. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Analyze and Suggest Refactoring for Rule File

**Objective:** Analyze the content of a potentially large or complex `.rules.mdc` file and suggest specific refactoring actions to improve its clarity, maintainability, and modularity.

**Input:**

1.  **Rule File Content:** [The FULL content of the `.rules.mdc` file to be refactored is expected immediately AFTER this prompt text.]
2.  **Refactoring Goals (Optional):** [User may specify goals, e.g., "Split this into smaller files", "Clarify section X", "Reduce redundancy".]

**Analysis Process:**

1.  **Assess Current State:** Read the input rule content. Evaluate its:
    * **Size & Scope:** Is the file overly long? Does it cover too many distinct concerns?
    * **Complexity:** Are there deeply nested sections, complex logic descriptions, or confusing instructions?
    * **Redundancy:** Are similar rules or directives repeated unnecessarily?
    * **Modularity:** Could logically distinct parts be separated into independent rules or files?
    * **Clarity:** Is the overall structure and language easy to follow? (Leverage findings similar to `analyze-rule-clarity`).
2.  **Identify Refactoring Opportunities:** Based on the assessment and optional user goals, identify specific opportunities for improvement. Examples:
    * Splitting a large rule file into multiple smaller, focused files (e.g., by sub-category or specific trigger).
    * Extracting reusable patterns or definitions into a shared rule or section.
    * Rewriting ambiguous or complex instructions for clarity.
    * Restructuring sections for better logical flow.
    * Removing redundant rules or consolidating overlapping ones.
3.  **Formulate Suggestions:** For each opportunity, propose a concrete refactoring action. Explain the *reasoning* behind the suggestion and the *benefit* expected (e.g., improved maintainability, clarity). If suggesting splitting, propose names and scopes for the new files.

**Output Format:**

Respond ONLY with a single Markdown document containing the refactoring suggestions.

```markdown
## Rule File Refactoring Report

**File Analyzed:** [Filename if available, otherwise 'Provided Content']

**Overall Assessment:** [Brief summary of the rule's current state regarding size, complexity, clarity, and potential for refactoring.]

**Refactoring Suggestions:**

* **Suggestion 1: [Brief Title, e.g., Split Rule into Categories]**
    * **Issue:** [Describe the problem, e.g., "The current file covers Commit, PR, and Review tools, making it very long."]
    * **Proposal:** [Describe the change, e.g., "Split the content into three separate files: `commit.rules.mdc`, `pull-request.rules.mdc`, and `code-review.rules.mdc` within the `sync-rules/tools/git/` directory."]
    * **Rationale:** [Explain the benefit, e.g., "Improves modularity, readability, and makes it easier to manage rules for each category independently."]

* **Suggestion 2: [Brief Title, e.g., Clarify Section 3 Logic]**
    * **Issue:** [e.g., "The instructions in Section 3 regarding 'Contextual Analysis' are ambiguous."]
    * **Proposal:** [e.g., "Rewrite Section 3 to use a clear checklist format and define specific actions for the agent based on identified context types."]
    * **Rationale:** [e.g., "Increases actionability and reduces potential for misinterpretation."]

* **Suggestion 3: [Brief Title, e.g., Extract Shared Directive]**
    * **Issue:** [e.g., "The directive about 'Confirming destructive actions' is repeated in rules A, B, and C."]
    * **Proposal:** [e.g., "Move this directive to a general section (like in `assistant.rules.mdc`) and remove it from the individual rules."]
    * **Rationale:** [e.g., "Reduces redundancy and ensures consistency."]

* **(List all relevant suggestions)**

```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Expect Rule File Content immediately after this prompt.
* **Focus:** Identify and suggest *structural* and *clarity* improvements, including potential file splitting. Do not execute the refactoring.
* **Output Format:** Strictly output ONLY the Markdown report with suggestions. No extra text.

---
**(END OF PROMPT FILE CONTENT - Rule File Content input expected immediately after this line)** 