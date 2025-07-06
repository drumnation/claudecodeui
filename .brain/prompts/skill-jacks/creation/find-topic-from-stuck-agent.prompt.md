**ACTION REQUIRED:** Execute the following knowledge gap identification task immediately. Analyze the provided roadblock topic `{TOPIC}` and recommend a specific, actionable topic for a new knowledge file, outputting the result as a JSON object. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Identify Knowledge Gap Topic for Stuck Agent

**Context:**
We are currently experiencing a development roadblock related to **{TOPIC}**. We seem stuck and need to identify a critical knowledge gap.

**Objective:**
Analyze the situation related to `{TOPIC}` and propose a **single, focused, actionable topic** for a new knowledge file, suitable for the `create-skill-jack.prompt.md` format. Include a potential solution approach.

**Specific Questions to Consider:**
* Root Cause: Why are we stuck on {TOPIC}? (Incomplete understanding, wrong pattern, tool misuse?)
* Information Gaps: What specific info about {TOPIC} are we missing or is outdated?
* Alternatives: Are there different libraries, patterns, or methods for {TOPIC} we haven't tried?
* Debugging: Are there specific diagnostic tools/techniques for {TOPIC} we're overlooking?
* Specific Solution: Is there a common library/pattern used to solve similar {TOPIC} challenges?

**Output:**
Respond ONLY with a single JSON object in the following format:

```json
{
  "recommendedTopic": "Precise topic suitable for the knowledge file creation prompt",
  "justification": "A concise explanation of why this topic is crucial and how it addresses the issues related to {TOPIC}.",
  "expectedOutcome": "A description of the specific benefits and insights expected from a knowledge file on this topic.",
  "suggestedApproach": "A specific suggestion for moving forward (e.g., using a library/pattern) and why it might work for {TOPIC}."
}
```

**Important:** Replace `{TOPIC}` in your analysis and the output context description with the actual topic provided when this prompt is invoked. 