AUTO-EXECUTE-V1

# Prompt Chaining Instructions: Identify Knowledge Gap & Create Guide

## Agent Preamble (Assumed Context for Invocation):
# The agent needs the problematic `{TOPIC}` provided (e.g., as a variable or direct text) when this workflow is invoked.

1.  **FIRST PROMPT:** Process the file at `@./packages/prompts/src/sync-prompts/knowledge/creation/find-topic-from-stuck-agent.prompt.md`
    * **Input:** The problematic `{TOPIC}` provided at invocation.
    * **Action:** Analyze the roadblock and output JSON recommending a specific topic for a knowledge file.
    * **Save Output:** Save the full JSON output (containing `recommendedTopic`, `justification`, etc.). Let's call the topic `topicToDocument`.

2.  **SECOND PROMPT:** Process the file at `@./packages/prompts/src/sync-prompts/knowledge/creation/create-knowledge-guide.prompt.md`
    * **Input:**
        * Use the `topicToDocument` saved from Step 1 as the `[Topic to Document]` input for this prompt.
    * **Action:** Generate the structured TypeScript knowledge file content based on the identified topic.
    * **Output:** The final generated TypeScript code block. (Consider modifying `create-knowledge-guide` to also create the file and output the path).

## Instructions for the Agent:
* Ensure the initial `{TOPIC}` is provided for Step 1.
* Complete Step 1 fully before proceeding to Step 2.
* Extract the `recommendedTopic` value from Step 1's JSON output and pass it correctly as the input topic for Step 2.
* Report completion status after each step, and present the final TypeScript code block. 