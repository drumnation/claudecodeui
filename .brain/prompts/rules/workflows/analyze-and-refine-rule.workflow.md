AUTO-EXECUTE-V1

# Prompt Chaining Instructions: Analyze Rule Quality & Generate Refinement Instructions

## Agent Preamble (Assumed Context for Invocation):
# The agent needs the content of the specific rule file (.rules.mdc) to be analyzed, provided after this workflow file mention.

1.  **FIRST PROMPT:** Process the file at `@./packages/prompts/src/sync-prompts/rules/analysis/analyze-rule-clarity.prompt.md`
    * **Input:** The content of the rule file to be analyzed (expected after workflow mention).
    * **Action:** Analyze the rule file's clarity, actionability, completeness, etc.
    * **Save Output:** Save the full Markdown Analysis Report output. Let's call it `analysisReport`.

2.  **SECOND PROMPT:** Process the file at `@./packages/prompts/src/sync-prompts/rules/refinement/generate-rule-refinement-instructions.prompt.md`
    * **Input:**
        * Use the `analysisReport` saved from Step 1 as the input content for this prompt.
    * **Action:** Generate specific editing instructions for Cursor based on the analysis report.
    * **Output:** The final Markdown containing editing instructions.

## Instructions for the Agent:
* Ensure the content of the target rule file is provided correctly for Step 1.
* Complete Step 1 fully before proceeding to Step 2.
* Pass the Markdown output (`analysisReport`) of Step 1 correctly as the input content for Step 2.
* Report completion status after each step, and present the final editing instructions. 