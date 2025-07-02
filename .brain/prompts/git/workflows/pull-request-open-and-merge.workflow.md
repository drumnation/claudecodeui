AUTO-EXECUTE-V1

# Prompt Chaining Instructions: Define PR Data & Merge PR

## Agent Preamble (Assumed Context for Invocation):
# The agent needs initial inputs for Step 1: Commit Hashes, PR Branch Name, Target Branch Name, Base Commit Hash (Optional), Context/Goal (Optional).

1.  **FIRST PROMPT:** Process the file at `.brain/prompts/git/pull-request/pull-request-define-and-package.prompt.md`
    * **Inputs:** Use the externally provided inputs (Commit Hashes, Branches, Base Hash, Context). Note: `Code Standards Ref` is likely not needed here.
    * **Action:** Generate the PR context and package it into a JSON file.
    * **Save Output:** Save the JSON output containing `prDataFilePath`. Example: `{ "prDataFilePath": ".brain/git/pr-packages/main-feat-xyz-pr-data.json" }`

2.  **SECOND PROMPT:** Process the file at `.brain/prompts/git/pull-request/pull-request-merge.prompt.md`
    * **Input:**
        * Use the `prDataFilePath` saved from Step 1 as the `PR Data File Path` input for this prompt.
    * **Action:** Read the package file, retrieve commit metadata, analyze commits, determine merge strategy, execute the merge using info from the package file, and output the JSON summary.
    * **Output:** The final JSON merge summary.

## Instructions for the Agent:
* Ensure all necessary initial inputs are provided for Step 1.
* Complete Step 1 fully (including JSON file creation) before proceeding to Step 2.
* Pass the `prDataFilePath` output from Step 1 correctly as the *only* direct input argument for Step 2.
* Report completion status after each step.