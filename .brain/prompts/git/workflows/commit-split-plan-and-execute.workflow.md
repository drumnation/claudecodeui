AUTO-EXECUTE-V1

# Prompt Chaining Instructions

1. FIRST PROMPT: Process the file at `.brain/prompts/git/commit/commit-split-multiple-plan.prompt.md`
   - Save all outputs from this prompt

2. SECOND PROMPT: Process the file at `.brain/prompts/git/commit/commit-execute-multiple.prompt.md`
   - Use the outputs from the first prompt as inputs here
   - Specifically, pass the `markdownPlanPath` from step 1 to the `Markdown Plan File Path` input in step 2

## Instructions for the Agent:
- Complete step 1 fully before proceeding to step 2
- Maintain all context between steps
- Report completion after each step