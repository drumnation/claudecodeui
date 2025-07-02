**ACTION REQUIRED:** Execute the following knowledge extraction task immediately. Analyze the provided communication content, extract valuable domain knowledge, and structure it into a reusable knowledge snippet. Output JSON containing the extracted knowledge. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Extract Knowledge Snippet

**Objective:**
Analyze communication content to identify and extract valuable domain knowledge, technical information, or contextual details, then structure it into a reusable knowledge snippet for the project knowledge base.

**Input:**

1.  **Source Content:** [The communication content to analyze - can be email, message thread, or notes. Provide either the full content or path to the processed file.]
2.  **Primary Topic:** [The main topic this knowledge relates to, e.g., "Network Configuration", "Client Infrastructure", "Authentication Methods"]
3.  **Knowledge Base Path (Variable):** `[KB_PATH]` (Defaults to `./communications/knowledge-base/`)
4.  **Extraction Focus (Optional):** [Specific aspect to focus on, e.g., "Technical Specifications", "Process Steps", "Configuration Details"]

**Instructions:**

1.  **Analyze Source Content:**
    * Read and understand the provided communication content.
    * Identify sections containing valuable domain knowledge or technical information.
    * Look for explanations, procedures, configurations, requirements, or domain-specific insights.
2.  **Assess Knowledge Value:**
    * Determine if the content contains genuinely useful information worth preserving.
    * Identify information that would be valuable for future reference or project work.
    * Focus on knowledge that's:
      * Technical and specific rather than general
      * Directly related to the project domain
      * Not easily found in standard documentation
      * Contextual to this specific client/project
3.  **Extract Core Knowledge:**
    * Isolate the precise technical information or domain knowledge.
    * Remove conversational elements, pleasantries, or irrelevant details.
    * Maintain technical accuracy in the extraction process.
4.  **Organize into Logical Structure:**
    * Format the knowledge in a clear, structured manner.
    * Use appropriate headings, bullet points, or numbered steps.
    * Organize details from general to specific when appropriate.
    * Ensure the structure is logical and easy to follow.
5.  **Add Context and Metadata:**
    * Include relevant context needed to understand the knowledge.
    * Add appropriate cross-references to related systems or concepts.
    * Record the source of the information (which communication it came from).
    * Note the date the information was provided.
6.  **Generate Suggested Filename:**
    * Create a kebab-case filename based on the primary topic: `[topic-slug].md`.
    * If file likely exists already, use `[topic-slug]-[subtopic-slug].md`.
    * Set path to `[KB_PATH]/[filename]`.

**Output:**

* Respond ONLY with a single JSON object containing the extracted knowledge.

    ```json
    {
      "metadata": {
        "topic": "[Primary Topic]",
        "subtopic": "[Specific Subtopic]",
        "extractionDate": "[Current Date YYYY-MM-DD]",
        "sourceType": "Email|Message|Notes",
        "sourceReference": "[Path or identifier of source communication]",
        "informationDate": "[Date the information was originally provided YYYY-MM-DD]",
        "confidence": "High|Medium|Low",
        "suggestedPath": "[KB_PATH]/[topic-slug].md"
      },
      "knowledgeSnippet": {
        "title": "[Concise descriptive title for this knowledge]",
        "summary": "[1-2 sentence summary of the extracted knowledge]",
        "content": "# [Title]\n\n[Full formatted content of the extracted knowledge]\n\n## Technical Details\n\n[Technical specifications, configurations, etc.]\n\n## Context\n\n[Important contextual information]\n\n## Source\n\nExtracted from communication with [Source Name] on [Date].",
        "tags": ["tag1", "tag2", "tag3"],
        "relatedTopics": ["Related Topic 1", "Related Topic 2"]
      },
      "applicationContext": {
        "whenToUse": ["Scenario 1", "Scenario 2"],
        "limitations": ["Limitation 1", "Limitation 2"],
        "expirationConcerns": "Information may become outdated if [condition]"
      },
      "actionRecommendations": [
        "Consider updating project documentation with this information",
        "Verify these details during the next client meeting",
        "Share this knowledge with the development team"
      ]
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Analyze content provided after this prompt.
* **Output Format:** Strictly output ONLY the specified JSON object with the extracted knowledge.
* **Knowledge Quality:** Focus on extracting truly valuable, specific, technical information - not general comments.
* **Technical Accuracy:** Maintain exact technical details, parameters, versions, etc. Do not generalize technical specifics.
* **Contextual Completeness:** Ensure extracted knowledge includes sufficient context to be understood when read independently.

---
**(END OF PROMPT FILE CONTENT - Source Content expected immediately after this line)** 