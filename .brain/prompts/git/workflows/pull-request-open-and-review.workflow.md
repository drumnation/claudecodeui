AUTO-EXECUTE-V1

# Prompt Chaining Instructions: Define PR Data & Perform Review

## Agent Preamble (Assumed Context for Invocation):
# The agent needs initial inputs for Step 1: Commit Hashes, PR Branch Name, Target Branch Name, Base Commit Hash (Optional), Context/Goal (Optional), Code Standards Ref (Optional).

1.  **FIRST PROMPT:** Process the file at `.brain/prompts/git/pull-request/pull-request-define-and-package.prompt.md`
    * **Inputs:** Use the externally provided inputs (Commit Hashes, Branches, Base Hash, Context, Standards Ref).
    * **Action:** Generate the PR context and package it into a JSON file.
    * **Save Output:** Save the JSON output containing `prDataFilePath`. Example: `{ "prDataFilePath": ".brain/git/pr-packages/main-feat-xyz-pr-data.json" }`

2.  **SECOND PROMPT:** Process the file at `.brain/prompts/git/pull-request/pull-request-review-and-comment.prompt.md`
    * **Input:**
        * Use the `prDataFilePath` saved from Step 1 as the `PR Data File Path` input for this prompt.
    * **Action:** Read the package file, retrieve/generate necessary info (diff, guidelines content from ref, commit metadata), perform the code review based on guidelines, and output the Markdown report.
    * **Output:** The final Markdown review report.

## Instructions for the Agent:
* Ensure all necessary initial inputs are provided for Step 1.
* Complete Step 1 fully (including JSON file creation) before proceeding to Step 2.
* Pass the `prDataFilePath` output from Step 1 correctly as the *only* direct input argument for Step 2.
* Report completion status after each step.