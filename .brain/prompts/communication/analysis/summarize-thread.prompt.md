**ACTION REQUIRED:** Execute the following communication thread summarization task immediately. Analyze the provided thread content, identify key topics, action items, and decisions, and generate a comprehensive summary. Output JSON containing structured summary information. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Summarize Communication Thread

**Objective:**
Analyze a communication thread (email or message) and generate a comprehensive, structured summary highlighting key information, decisions, action items, and unresolved questions.

**Input:**

1.  **Thread Content:** [The communication thread to summarize - can be a single document or multiple related documents. Provide either the full content or paths to the processed files in the communications directory.]
2.  **Communication Type:** [Specify "Email" or "Message", affects analysis approach]
3.  **Summary Storage Path (Variable):** `[SUMMARY_PATH]` (Defaults to `./communications/summaries/`)
4.  **Summary Level:** ["Brief", "Standard", or "Detailed" - determines the length and depth of summary]

**Instructions:**

1.  **Read and Parse Thread:**
    * Process the provided thread content or read the files at the given paths.
    * Identify the chronological order of messages.
    * Understand the context and relationship between messages.
2.  **Identify Key Participants:**
    * Extract names and roles of all participants in the communication.
    * Note who initiated the thread and who contributed key information.
3.  **Extract Core Topics:**
    * Identify 3-5 main topics discussed in the thread.
    * Rank topics by importance/time spent discussing.
    * Create concise labels for each topic.
4.  **Identify Key Information:**
    * Extract critical facts, figures, dates, or details shared.
    * Note any important context for understanding the thread.
    * Identify credentials, access information, or sensitive data (flag but do not include in summary).
5.  **Extract Decisions and Conclusions:**
    * Identify definitive decisions made during the thread.
    * Note any consensus reached or conclusions drawn.
    * Document any rejected alternatives or options.
6.  **Compile Action Items:**
    * Extract explicit tasks assigned to specific individuals.
    * Identify implied tasks that seem necessary but weren't explicitly assigned.
    * Note deadlines mentioned for any tasks.
7.  **Identify Unresolved Questions:**
    * Extract questions raised but not answered in the thread.
    * Note topics needing further clarification.
    * Identify potential blockers or dependencies mentioned.
8.  **Generate Thread Narrative:**
    * Create a chronological summary of how the conversation evolved.
    * Focus on key turning points and information exchanges.
    * Scale length based on the specified Summary Level.
9.  **Create Summary Document:**
    * Compile all extracted information into a structured summary.
    * Format according to the provided template.
    * Adjust detail level based on the Summary Level parameter.
10. **Generate Suggested Filename:**
    * Create filename based on date and primary topic: `summary-YYYYMMDD-topic-slug.md`.
    * Set path to `[SUMMARY_PATH]/[filename]`.

**Output:**

* Respond ONLY with a single JSON object containing the structured summary.

    ```json
    {
      "metadata": {
        "type": "Email|Message",
        "date": "[Thread Date YYYY-MM-DD]",
        "participants": ["Name <email@example.com>", "Name (Role)"],
        "threadTopic": "[Primary Thread Topic]",
        "suggestedSummaryPath": "[SUMMARY_PATH]/summary-YYYYMMDD-topic-slug.md",
        "analyzedDocuments": ["path/to/document1.md", "path/to/document2.md"]
      },
      "coreTopics": [
        {"topic": "Network Security Configuration", "importance": "High"},
        {"topic": "Firewall Access Requirements", "importance": "Medium"},
        {"topic": "Implementation Timeline", "importance": "Medium"}
      ],
      "keyInformation": [
        "Branch office firewall credentials provided for monitoring",
        "VPN access limited to specific maintenance window",
        "Current configuration uses pfSense version 2.6.0"
      ],
      "decisions": [
        "Weekly monitoring schedule approved for Tuesdays at 10 AM",
        "David to collect VPN logs for analysis",
        "Access credentials to be rotated after maintenance period"
      ],
      "actionItems": [
        {
          "task": "Collect VPN logs from Branch Office",
          "assignee": "David",
          "deadline": "2023-04-05",
          "status": "Pending"
        },
        {
          "task": "Provide updated network diagram",
          "assignee": "Jed",
          "deadline": "Not specified",
          "status": "Pending"
        }
      ],
      "unresolvedQuestions": [
        "What specific VPN connection issues are users experiencing?",
        "Is the issue limited to a specific time of day?",
        "Has any recent configuration change been made to the firewall?"
      ],
      "threadNarrative": "The conversation began with Jed reporting VPN connectivity issues at the branch office. David requested more information about when the issues started occurring. Jed provided administrative credentials for the pfSense firewall and shared a screenshot of the error message users were receiving. David committed to investigating the VPN logs and requested users to report any patterns in the disconnections. The thread concluded with an agreement for David to analyze the logs and report findings."
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Analyze thread content provided after this prompt.
* **Output Format:** Strictly output ONLY the specified JSON object with the structured summary.
* **Thoroughness:** Be thorough in identifying topics, action items, and unresolved questions.
* **Objectivity:** Focus on extracting factual information rather than interpreting intentions.
* **Conciseness:** Keep individual summary points brief and to the point, especially for "Brief" summaries.

---
**(END OF PROMPT FILE CONTENT - Thread Content expected immediately after this line)** 