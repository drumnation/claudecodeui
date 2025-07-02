**ACTION REQUIRED:** Execute the following rule conflict detection task immediately. Analyze the content of the provided rule files to identify potential overlaps, contradictions, or ambiguities between them. Output ONLY the structured Markdown conflict report. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Detect Conflicts Between Rule Files

**Objective:** Analyze two or more provided `.rules.mdc` files to identify potential conflicts, significant overlaps, or ambiguities in the rules they define for an AI agent.

**Input:**

1.  **Rule File Contents:** [The FULL content of ALL `.rules.mdc` files to be compared is expected immediately AFTER this prompt text. Clearly separate each file's content, perhaps using `--- FILE: [filename] ---` markers.]

**Analysis Process:**

1.  **Parse Rules:** For each provided rule file content block, identify the main rules, directives, triggers (`globs`, `alwaysApply`, activation context in description), and defined actions.
2.  **Compare Triggers/Context:** Check if multiple rules have overlapping `globs` or `Activation Context` descriptions that might cause them to trigger simultaneously in potentially conflicting ways.
3.  **Compare Directives:** Examine the specific instructions given to the agent within each rule. Identify instances where:
    * Rule A tells the agent to do X, while Rule B tells the agent to do Y (contradiction) in the same situation.
    * Rule A and Rule B both define how to handle the exact same task or scenario (redundancy/overlap).
    * The combined effect of multiple rules applying simultaneously is unclear or ambiguous.
    * Priorities are not defined (e.g., if both a general rule and a specific rule apply, which takes precedence?).
4.  **Identify Potential Conflicts:** Based on the comparisons, list specific pairs or groups of rules (referencing their source file and relevant sections) that exhibit potential conflicts, overlaps, or ambiguities.

**Output Format:**

Respond ONLY with a single Markdown document structured as follows.

```markdown
## Rule Conflict Analysis Report

**Files Analyzed:**
* [Filename 1 (if provided)]
* [Filename 2 (if provided)]
* ...

**Potential Conflicts/Overlaps Found:**

* **Conflict/Overlap 1:**
    * **Rules Involved:** [`[Filename A]`: [Section/Rule Title/Description], [`[Filename B]`: [Section/Rule Title/Description]]
    * **Nature:** [Contradiction | Redundancy | Ambiguity | Trigger Overlap]
    * **Description:** [Explain the specific conflict or overlap. E.g., "Rule A mandates using spaces, Rule B mandates using tabs for indentation in Python files (*.py glob overlap)." or "Both Rule C and Rule D define how to handle 'commit all changes' request."]
    * **Suggestion:** [Brief suggestion for resolution, e.g., "Clarify precedence", "Merge rules", "Refine trigger conditions".]

* **Conflict/Overlap 2:**
    * **Rules Involved:** [...]
    * **Nature:** [...]
    * **Description:** [...]
    * **Suggestion:** [...]

* **(List all identified issues)**

**Overall Assessment:** [Brief summary - e.g., "No major conflicts found.", "Significant overlap detected between X and Y.", "Ambiguity exists regarding Z."]
```
*If no conflicts are found, state that clearly.*

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Expect the content of multiple rule files sequentially after this prompt. Use markers like `--- FILE: ---` if present to distinguish them.
* **Focus:** Identify potential *negative interactions* between rules.
* **Output Format:** Strictly output ONLY the Markdown conflict report. No extra text.

---
**(END OF PROMPT FILE CONTENT - Content of Rule File 1, then Rule File 2, etc. expected after this line)** 