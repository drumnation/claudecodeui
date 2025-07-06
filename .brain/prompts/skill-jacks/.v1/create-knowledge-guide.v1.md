🤖 I need your help to create a comprehensive knowledge rule file on the topic of: **[User inserts the topic/skill here]**.

This knowledge rule file will serve as a foundational resource to instantly equip a Cursor AI agent with deep understanding and practical application capabilities for this concept within our software development ecosystem. The agent will leverage this knowledge as part of a multi-agent system that decomposes software projects using the MECE (Mutually Exclusive, Collectively Exhaustive) principle.

---

**🧠 Step 0: File Organization and Structure:**

1.  **Directory Analysis:**
    *   **🔍 Analyze the `.brain/knowledge` directory hierarchy** to identify the most appropriate location for this knowledge file
    *   **📊 Consider existing categorizations and relationships** between knowledge domains
2.  **Location Decision:**
    *   **✅ Existing Category:** Place in the most relevant existing folder
    *   **🆕 New Category:** Create a new directory using kebab-case (e.g., `domain-specific/`) if the topic represents a distinct knowledge domain
3.  **File Creation:**
    *   **📝 Naming Convention:** `topic-name.guide.ts` in kebab-case
    *   **🔗 File Type:** TypeScript module with exported constant
    *   **📚 Documentation:** Include JSDoc comments for better IDE integration

---

**🎯 Core Requirements:**

*   **Type Safety:**
    *   Must export a strongly-typed TypeScript object
    *   Include comprehensive type definitions for all structures
    *   Leverage TypeScript's discriminated unions where appropriate

*   **Knowledge Quality:**
    *   **Temporal Context:** 
        *   Include explicit version information and dates
        *   Flag potentially volatile information
        *   Provide update frequency recommendations
    *   **Verification:**
        *   Cross-reference multiple authoritative sources
        *   Include direct links to official documentation
        *   Note any conflicting information or debates in the field

*   **Content Depth:**
    *   Provide exhaustive coverage of the topic
    *   Include advanced concepts and edge cases
    *   Connect concepts to practical applications
    *   Address common misconceptions

*   **Agent Optimization:**
    *   Structure content for efficient parsing
    *   Include explicit action items and decision points
    *   Provide clear success criteria for implementations

---

**🚀 Knowledge Rule Template (TypeScript Object):**

```typescript
{
  topic: "Topic Name", // String
  description: "Concise definition and summary of the topic/skill. Aim for a comprehensive overview, providing a thorough introduction to the topic.", // String
  relevance: "Explain its relevance to software development and why it's important for an agent to understand. Provide a detailed explanation, highlighting the benefits and potential impact.", // String
  notes: [ // Array of Strings (Optional)
    "* Note: This information is based on best practices as of [Date]. Please refer to official documentation for updates.",
    "* Note: If any specific tool is mentioned, be sure it is the most current method."
  ],
  corePrinciples: [
    {
      name: "Principle Name", // String
      description: "Explain the principle clearly and concisely, with detailed explanations and examples. Illustrate how the principle applies in different scenarios." // String
    },
    // ... more principles as needed (aim for 3-5 principles, potentially more if the topic demands it) (Array of Objects with 'name' and 'description')
  ],
  applicationProcess: { // Object
    description: "Outline a step-by-step process for applying this concept in practice. Break down each step into granular sub-steps with specific actions for the agent. Use the 'Agent Actions' label to highlight what the agent should do. Strive for a MECE (Mutually Exclusive, Collectively Exhaustive) breakdown of actions where possible. Provide detailed instructions and explanations for each step and sub-step, including potential challenges and decision points.", // String
    steps: [
      {
        stepName: "Step Name", // String
        stepDescription: "Describe what needs to be done in this step. Include detailed explanations, context, and potential challenges. Provide in-depth guidance on each sub-step.", // String
        agentActions: [ // Array of Strings
          "Action 1: Describe the specific action the agent should take (use imperative verbs). Provide very detailed instructions.",
          "Action 2: Describe another action.",
          "..."
        ]
      },
      // ... more steps as needed (aim for a thorough breakdown of the process, with as many steps as necessary to cover the topic comprehensively) (Array of Objects with 'stepName', 'stepDescription', and 'agentActions')
    ]
  },
  examples: { // Object
    description: "Provide at least three detailed and practical examples of this concept being used in a real-world software development scenario. Include variations, edge cases, and contextual explanations for each example. Clearly explain the purpose and usage of any special functions or tools (e.g., the 'play' function in Storybook testing). Each example should be comprehensive and stand on its own.", // String
    useCases: [
      {
        name: "Use Case Name", // String
        scenario: "Describe the context and why this approach is suitable. Provide a detailed explanation for the scenario.", // String
        example: "Describe the scenario, the code involved (using `inline code formatting` or `typescript\n  \"code\": \"...\"\n` for code blocks), and how the topic/skill was applied to achieve a specific outcome. Explain any special functions or tools used. Include detailed, well-commented code examples." // String
      },
      // ... more use cases as needed (aim for 3-5 diverse use cases, potentially more if the topic demands it) (Array of Objects with 'name', 'scenario', and 'example')
    ]
  },
  codeExamples: [ // Moved after 'examples'
    {
      description: "Well-commented code examples related to the topic/skill. Use this section to demonstrate specific techniques or configurations not fully covered in the 'examples' section. Provide comprehensive explanations for each code example, including alternative implementations and best practices.", // String
      example: {
        language: "typescript", // String, e.g., "typescript", "javascript", "python"
        code: "`typescript\n// Code block formatting with detailed inline comments\nfunction exampleFunction() {\n  console.log(\"Hello, world!\"); // Example comment\n}\n`" // String
      }
    },
    // ... more code examples as needed (aim for 3-5 detailed examples, potentially more if the topic demands it) (Array of Objects with 'description', 'language', and 'code')
  ],
  commonPitfalls: [
    {
      name: "Pitfall Name", // String
      description: "Explain the common mistake, why it's a problem, and how to avoid it. Provide a detailed explanation, including potential consequences and alternative approaches.", // String
      solution: "Provide a clear solution or workaround for the pitfall.", // String
      preventativeMeasures: [ // Array of Strings
        "Measure 1: Describe a proactive step to prevent this pitfall.",
        "Measure 2: Describe another preventative measure."
      ]
    },
    // ... more pitfalls as needed (aim for 3-5 common pitfalls, potentially more if the topic demands it) (Array of Objects with 'name', 'description', 'solution', and 'preventativeMeasures')
  ],
  improvementGuidelines: [
    {
      guideline: "Guideline Text", // String
      detail: "Explain how this guideline helps reinforce the concept and improve skills. Suggest quantifiable metrics where possible to track progress or effectiveness. Provide detailed explanations and examples." // String
    },
    // ... more guidelines as needed (aim for 3-5 detailed guidelines, potentially more if the topic demands it) (Array of Objects with 'guideline' and 'detail')
  ],
  resources: [ // Section for external links
    {
        name: "Resource Name", // String, e.g., "Storybook Documentation"
        url: "Valid URL" // String, e.g., "[https://storybook.js.org/docs/](https://storybook.js.org/docs/)"
    }
    // ... more resources as needed (Array of Objects with 'name' and 'url')
  ],
  conclusion: "Summarize the key takeaways and reiterate the importance of this topic/skill in software development. Highlight how mastering this will enhance the agent's capabilities. Provide a comprehensive summary, reinforcing the main points and their implications." // String
}
```

**❗ Important Considerations:**

*   **Prioritize Accuracy:** Emphasize the importance of providing up-to-date information, referencing official documentation, and cross-referencing multiple sources. The AI should add notes about potential outdated information and include the current date.
*   **Maximize Depth and Breadth:**  **Explicitly instruct the AI to cover a wide range of subtopics, best practices, and advanced techniques. Remind the AI to provide extensive explanations and details in each section, aiming for a comprehensive and in-depth treatment of the topic.**
*   **Encourage Detailed Examples:** **Instruct the AI to provide numerous, detailed, and practical examples, including variations, edge cases, and well-commented code snippets.**
*   **Consistency:** While allowing flexibility, encourage the AI to maintain a generally consistent structure across rule files for easier processing.
*   **Code Examples:** Use `inline code formatting` for short snippets within descriptions, or use the dedicated `"codeExamples"` array with `language` and `code` properties for larger, multi-line code blocks. Add detailed inline comments to code examples.
*   **MECE Structure:** Remind the AI to strive for a MECE (Mutually Exclusive, Collectively Exhaustive) organization of concepts where appropriate, especially when breaking down steps and actions.
*   **Error Handling:** Encourage the AI to include examples or guidance on error handling when applicable.
*   **Validation:** You might want to implement some basic validation checks after the AI generates a rule file to ensure that the essential elements are present and that the structure is generally sound.

---

**💯 By following this template, you will create a knowledge file that effectively equips a Cursor AI agent with a new skill, ready for immediate application in its tasks.**

**👉 Please provide the best possible content for each section of the template, ensuring the output is a valid JavaScript object. Be sure to add as many principles, steps, use cases, pitfalls, recommendations, code examples, and resources as you see fit. The AI is encouraged to add additional helpful data or slightly modify the structure if it deems it beneficial. Prioritize accuracy and consult official documentation to ensure the information provided is up-to-date and reliable. Aim for a comprehensive and in-depth treatment of the topic, providing extensive explanations and details in each section. Do not hesitate to provide a lengthy and detailed response, covering all relevant aspects of the topic.**

**❗ Enhanced Guidelines:**

*   **Version Control:**
    *   Include last verified date for all information
    *   Document known compatibility issues
    *   Specify minimum version requirements for tools/frameworks

*   **Knowledge Integration:**
    *   Reference related knowledge files
    *   Define prerequisites and dependencies
    *   Establish clear learning progression paths

*   **Implementation Focus:**
    *   Provide concrete success metrics
    *   Include performance considerations
    *   Address scalability concerns
    *   Document known limitations

*   **Maintenance:**
    *   Define update triggers (new releases, major changes)
    *   Include validation criteria
    *   Specify review frequency recommendations

*   **Quality Assurance:**
    *   Include test scenarios
    *   Provide verification steps
    *   Document expected outcomes
    *   Include troubleshooting guides

---

**💡 The goal is to create a living document that evolves with the technology while maintaining accuracy and practical utility for the agent system.**

**🔄 Remember to validate the generated content against:**
- Current industry best practices
- Official documentation
- Community consensus
- Real-world implementation patterns
- Performance implications
- Security considerations