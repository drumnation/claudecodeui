AUTO-EXECUTE-V1

# Prompt Chaining Instructions: Analyze Prompt/Rules Quality & Generate Refinements

## Agent Preamble (Assumed Context for Invocation):
# The agent needs the content of the `create-skill-jack.prompt.md` prompt AND the content of the specific rules file to be analyzed, provided sequentially after this workflow file mention.

1.  **FIRST PROMPT:** Process the file at `@./packages/prompts/src/sync-prompts/skill-jacks/quality/analyze-prompt-quality.prompt.md`
    * **Inputs:**
        * The content of `create-skill-jack-guide.md` (expected first after workflow mention).
        * The content of the rules file being analyzed (expected second after workflow mention).
    * **Action:** Analyze the rules file against the standard guide content.
    * **Save Output:** Save the full Markdown Analysis Report output. Let's call it `analysisReport`.

2.  **SECOND PROMPT:** Process the file at `@./packages/prompts/src/sync-prompts/skill-jacks/quality/generate-prompt-refinement-instructions.prompt.md`
    * **Input:**
        * Use the `analysisReport` saved from Step 1 as the input content for this prompt.
    * **Action:** Generate specific editing instructions for Cursor based on the analysis report.
    * **Output:** The final Markdown containing editing instructions.

## Instructions for the Agent:
* Ensure the content blocks for the guide standard and the rules file are provided correctly in sequence for Step 1.
* Complete Step 1 fully before proceeding to Step 2.
* Pass the Markdown output (`analysisReport`) of Step 1 correctly as the input content for Step 2.
* Report completion status after each step, and present the final editing instructions. 