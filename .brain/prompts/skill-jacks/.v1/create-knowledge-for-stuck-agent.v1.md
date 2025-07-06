## Agent Task: Identify a Critical Knowledge Gap and Create a Corresponding Knowledge File

**Context:**

We are currently experiencing a development roadblock in our software project, specifically related to **{TOPIC}**. Our team seems to be stuck in a loop, making no significant progress despite repeated attempts. We need to identify a critical knowledge gap that, if addressed, could potentially break us out of this loop. We need you to pinpoint a specific, actionable topic for a new knowledge file to solve this, **and then automatically generate that knowledge file using the provided creation prompt.**

**Objective:**

Your task is to analyze the current situation, propose a **single, focused topic** for a new knowledge file, **and then directly generate the knowledge file itself based on that topic.** This topic should:

1.  **Directly address the core issue:** It must be relevant to the current problem of being stuck in a loop regarding {TOPIC}.
2.  **Offer new insights:** The topic should go beyond our current understanding and potentially uncover hidden assumptions, overlooked patterns, or missing information.
3.  **Be actionable:** The knowledge gained from this file should lead to concrete steps we can take to move forward.
4.  **Suggest a specific solution.** It would be helpful if you could suggest a specific library, pattern, or approach we are not currently using to solve the problem.
5.  **Be specific and detailed.** It will be used to automatically generate a guide on the topic, so the more specific, the better.

**Specific Questions to Consider:**

*   **Root Cause Analysis:** What are the potential underlying reasons for our lack of progress related to {TOPIC}? Consider factors like incomplete understanding of core concepts, incorrect implementation of patterns, or misuse of tools.
*   **Information Gaps:** What specific information are we missing that could shed light on the issue? Are there any areas within {TOPIC} where our knowledge is outdated or incomplete?
*   **Alternative Approaches:** Are there alternative libraries, design patterns, or methodologies related to {TOPIC} that we haven't explored? Could a different perspective or technique be the key to breaking the loop?
*   **Debugging and Diagnostics:** Are there specific debugging tools or diagnostic techniques relevant to {TOPIC} that we might be overlooking? Could a better understanding of error messages or performance bottlenecks point us in the right direction?
*   **Specific Library or Pattern:** Is there a specific library, framework, or design pattern that is commonly used to address challenges similar to ours in the context of {TOPIC}?

**Step 1: Topic Identification and Justification**
First, provide a topic identification and justification in the following format:

```json
{
  "recommendedTopic": "Precise topic suitable for the knowledge file creation prompt",
  "justification": "A concise explanation of why this topic is crucial and how it addresses the identified issues.",
  "expectedOutcome": "A description of the specific benefits and insights we expect to gain from creating a knowledge file on this topic.",
  "suggestedApproach": "A specific suggestion for how to move forward, such as using a new library or pattern. Explain why this might work."
}
```

**Step 2: Knowledge File Generation**

After providing the topic and justification, execute the following steps:

1. **Load Knowledge Guide Template:**
```typescript
import { executePrompt } from '@brain-garden/core';
import { KnowledgeGuideTemplate } from '@.brain/prompts/knowledge/.v1/create-knowledge-guide.v1.md';

await executePrompt(KnowledgeGuideTemplate, {
  topic: recommendedTopic,
  context: {
    originalIssue: "{TOPIC}",
    justification: /* justification from Step 1 */,
    expectedOutcome: /* expectedOutcome from Step 1 */,
    suggestedApproach: /* suggestedApproach from Step 1 */
  }
});
```

**Important Notes:**

*   **Replace {TOPIC}** with the actual topic where you're experiencing the loop.
*   **Paste your entire knowledge file creation prompt** into the designated area above.
*   **Ensure Seamless Transition:** The agent should smoothly transition from identifying the topic to generating the knowledge file without requiring any further instructions. You may want to add an explicit instruction like, "Now, using the 'recommendedTopic' as the input, generate the knowledge file according to the prompt provided." at the end of Step 1.
*   **Error Handling:** Consider adding instructions for the agent to handle potential issues, such as being unable to identify a suitable topic or encountering errors during knowledge file generation. For instance, you could instruct the agent to provide an explanation if it cannot proceed to Step 2.

By incorporating these changes, you'll have a powerful prompt that not only identifies critical knowledge gaps but also automatically generates the necessary documentation to address them, significantly enhancing your development workflow.
