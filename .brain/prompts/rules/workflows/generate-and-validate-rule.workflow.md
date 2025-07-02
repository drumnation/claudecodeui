AUTO-EXECUTE-V1

# Prompt Chaining Instructions: Generate Rule from Description & Validate

## Agent Preamble (Assumed Context for Invocation):
# The agent needs a description of the desired rule behavior, provided after this workflow file mention.

1.  **FIRST PROMPT:** Process the file at `@./packages/prompts/src/sync-prompts/rules/generation/generate-rule-from-description.prompt.md`
    * **Input:** The description of the desired rule behavior (expected after workflow mention).
    * **Action:** Generate a complete `.rules.mdc` file based on the description.
    * **Save Output:** Save the generated rule content. Let's call it `generatedRule`.

2.  **SECOND PROMPT:** Process the file at `@./packages/prompts/src/sync-prompts/rules/analysis/analyze-rule-clarity.prompt.md`
    * **Input:**
        * Use the `generatedRule` saved from Step 1 as the input content for this prompt.
    * **Action:** Analyze the generated rule file's clarity, actionability, completeness, etc.
    * **Save Output:** Save the full Markdown Analysis Report output. Let's call it `analysisReport`.

3.  **THIRD PROMPT (Optional - Based on Analysis):** Process the file at `@./packages/prompts/src/sync-prompts/rules/refinement/generate-rule-refinement-instructions.prompt.md`
    * **Input:**
        * Use the `analysisReport` saved from Step 2 as the input content for this prompt.
    * **Action:** Generate specific editing instructions to improve the rule if analysis scores are below 4/5.
    * **Output:** The refinement instructions (if needed).

## Instructions for the Agent:
* Ensure the description of the desired rule behavior is provided correctly for Step 1.
* Complete each step fully before proceeding to the next.
* Pass outputs between steps correctly.
* After Step 2, check if the analysis scores (Clarity, Actionability, Completeness) are all 4/5 or higher:
  * If all scores are 4/5 or higher, present the `generatedRule` as the final output.
  * If any score is below 4/5, proceed to Step 3 to generate refinement instructions.
* Present both the original generated rule and any refinement instructions in the final output. 