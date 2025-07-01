AUTO-EXECUTE-V1

# Prompt Chaining Instructions: Generate Guidelines & Comments

## Agent Preamble (Assumed Context for Invocation):
# The agent needs the Code Standards Document content and the PR Diff content provided after this workflow file is processed.

1.  **FIRST PROMPT:** Process the file at `.brain/prompts/git/code-review/code-review-guidelines.prompt.md`
    * **Input:** The Code Standards Document content (expected after this workflow file).
    * **Action:** Generate the tailored Markdown Code Review Guidelines.
    * Save the full Markdown output from this prompt (let's call it `generatedGuidelines`).

2.  **SECOND PROMPT:** Process the file at `.brain/prompts/git/code-review/code-review-commenting.prompt.md`
    * **Inputs:**
        * Use the `generatedGuidelines` saved from Step 1 as the `Code Review Guidelines` input for this prompt.
        * Use the PR Diff content (expected after this workflow file and after the Standards Doc).
    * **Action:** Generate Markdown code review comments based on the guidelines and diff.
    * Output the final list of comments.

## Instructions for the Agent:
* Ensure the Code Standards Document content is provided as input to Step 1.
* Ensure the PR Diff content is provided as input to Step 2 (after the guidelines from Step 1).
* Complete Step 1 fully before proceeding to Step 2.
* Pass the Markdown output of Step 1 (`generatedGuidelines`) correctly as the first input block for Step 2.
* Report completion status after each step.