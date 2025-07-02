**ACTION REQUIRED:** Execute the following rule clarity analysis immediately. Analyze the provided Rule File Content based on general best practices for writing clear and actionable agent rules. Output ONLY the structured Markdown analysis report. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Analyze Rule File Clarity and Actionability

**Objective:** Analyze the content of a `.rules.mdc` file (provided as input) for clarity, ambiguity, actionability, completeness, and overall quality based on best practices for agent instructions.

**Input:**

1.  **Rule File Content:** [The FULL content of the `.rules.mdc` file being analyzed is expected immediately AFTER this prompt text.]

**Analysis Process:**

1.  **Readability & Structure:** Assess the overall organization, use of Markdown formatting (headings, lists, code blocks), and ease of reading. Check for valid frontmatter (`description`, `globs`, `alwaysApply`).
2.  **Clarity & Ambiguity:** Examine each instruction, definition, or rule within the content. Identify any vague terms, jargon, or statements open to multiple interpretations by an AI agent. Are triggers and conditions clear?
3.  **Actionability:** Are the instructions given to the agent specific and executable? Do they use imperative verbs? Is it clear *what* the agent should *do*?
4.  **Completeness:** Does the rule seem to cover the scope defined in its `description`? Are there obvious scenarios or edge cases missing? (This is a high-level check, not as deep as domain-specific validation).
5.  **Examples:** Does the rule benefit from examples? Are existing examples clear and relevant?
6.  **Consistency:** Are terms and formatting used consistently throughout the rule file?

**Output Format:**

Respond ONLY with a single Markdown document structured as follows.

```markdown
## Rule File Clarity Analysis Report

**File Analyzed:** [Filename can be inferred if available in context, otherwise state 'Provided Content']

**1. Frontmatter & Structure Assessment:**
* Frontmatter Valid (`description`, `globs`, `alwaysApply` present): [Yes/No/Partial - Detail issues]
* Markdown Structure & Readability: [Good/Fair/Poor - Comments on formatting, headings, etc.]

**2. Clarity & Ambiguity Assessment:**
* [List specific phrases, sentences, or sections identified as potentially unclear or ambiguous, with explanation.]
* [Example: "Section 3.1 directive 'Handle appropriately' is too vague."]

**3. Actionability Assessment:**
* [Assess whether instructions are specific enough for an agent to execute. List any instructions that are too high-level or lack concrete steps.]
* [Example: "Step 4 'Ensure quality' needs specific checks defined."]

**4. Completeness Assessment (High-Level):**
* [Note any obvious gaps in scope based on the rule's description. E.g., "Rule describes error handling but doesn't mention logging."]

**5. Examples Assessment:**
* [Comment on the presence, relevance, and clarity of examples. Suggest areas where examples would improve understanding.]

**6. Consistency Assessment:**
* [Note any inconsistencies in terminology or formatting.]

**7. Overall Score (Subjective):**
* Clarity: [1-5] (1=Very Unclear, 5=Very Clear)
* Actionability: [1-5] (1=Not Actionable, 5=Very Actionable)
* Completeness: [1-5] (1=Very Incomplete, 5=Very Complete)

**8. Key Recommendations for Improvement:**
* [Bulleted list summarizing the most important changes needed to improve the rule, based on the findings above.]
```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Expect Rule File Content immediately after this prompt.
* **Focus:** Evaluate the rule's quality *as instructions for an agent*.
* **Output Format:** Strictly output ONLY the Markdown analysis report. No extra text.

---
**(END OF PROMPT FILE CONTENT - Rule File Content input expected immediately after this line)** 