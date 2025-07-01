AUTO-EXECUTE-V1

# Prompt Chaining Instructions: Generate Guidelines & Perform Full Review

## Agent Preamble (Assumed Context for Invocation):
# The agent needs the Code Standards Document content, PR Title, PR Description, Commit Hashes list, and the PR Diff content provided after this workflow file.

1.  **FIRST PROMPT:** Process the file at `.brain/prompts/git/code-review/code-review-guidelines.prompt.md`
    * **Input:** The Code Standards Document content (expected after this workflow file).
    * **Action:** Generate the tailored Markdown Code Review Guidelines.
    * Save the full Markdown output from this prompt (let's call it `generatedGuidelines`).

2.  **SECOND PROMPT:** Process the file at `.brain/prompts/git/pull-request/pull-request-review-and-comment.prompt.md`
    * **Inputs:**
        * `PR Title`: [Provided externally or from context]
        * `PR Description`: [Provided externally or from context]
        * `Commit Hashes`: [Provided externally or from context]
        * `Code Standards`: Use the `generatedGuidelines` saved from Step 1.
        * `Diff`: Use the PR Diff content (expected after this workflow file and after the Standards Doc).
    * **Action:** Generate the full Markdown code review report.
    * Output the final Markdown report.

## Instructions for the Agent:
* Ensure the Code Standards Document content is provided as input to Step 1.
* Ensure the PR Title, Description, Commit Hashes list, and PR Diff content are provided as inputs to Step 2 (with the guidelines from Step 1 inserted correctly).
* Complete Step 1 fully before proceeding to Step 2.
* Pass the Markdown output of Step 1 (`generatedGuidelines`) correctly as the `Code Standards` input block for Step 2.
* Report completion status after each step.