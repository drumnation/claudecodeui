**ACTION REQUIRED:** Execute the following message ingestion process immediately. Analyze the provided message content, extract metadata, save content and assets to the structured `/communications` directory, update logs/indexes, extract action items, and output a JSON summary. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Ingest New Message Communication

**Objective:**
Process and integrate a new message/chat communication into the project's structured communication logs and knowledge system.

**Input:**

1.  **Message Content:** [The FULL content of the message thread, including timestamps and names, is expected immediately AFTER this prompt text.]
2.  **Project Name (Contextual):** [e.g., "Client Networking Support"]
3.  **Communication Root Path (Variable):** `[COMM_ROOT]` (Defaults to `./communications`)
4.  **Asset Root Path (Variable):** `[ASSET_ROOT]` (Defaults to `[COMM_ROOT]/assets`)
5.  **Communication Platform:** [e.g., "Teams", "Slack", "SMS"]

**Instructions:**

1.  **Extract Metadata:**
    * Parse Date (`YYYY-MM-DD` format), Primary Sender Name from content.
    * Determine Primary Topic from content or initial message. Generate `topic_slug` (lowercase, kebab-case).
    * Determine Priority (Low/Medium/High - based on keywords or ask user).
    * Let `date_YYYYMMDD` be the date in that format.
2.  **Determine File Paths:**
    * Daily Folder: `[COMM_ROOT]/processed/messages/[date_YYYYMMDD]/`
    * Sequence Number: Check existing files in `Daily Folder`, find highest `NN` prefix, use `NN+1` (padded e.g., `01`, `02`). Let this be `sequence_number`.
    * Content File Path: `[Daily Folder]/[sequence_number]-[topic_slug].md`
3.  **Save Formatted Content:**
    * Execute `mkdir -p [Daily Folder]` to ensure directory exists.
    * Create/Write content to `[Content File Path]` using Markdown, preserving original formatting, code blocks, etc. Include headers at the top:
        ```markdown
        ---
        Date: [Parsed Date]
        Primary Sender: [Primary Sender Name]
        Platform: [Communication Platform]
        Topic: [Determined Topic]
        Priority: [Determined Priority]
        ---

        [Original Message Thread Content in Markdown, with timestamps preserved]
        ```
    * Log success/failure of file write.
4.  **Process Attachments/Images:**
    * Identify any screenshots/images mentioned or included.
    * For each item `i`:
        * Determine asset filename: `[date_YYYYMMDD]-[topic_slug]-[i].[original_extension]`
        * Asset Daily Folder: `[ASSET_ROOT]/[date_YYYYMMDD]/`
        * Asset Path: `[Asset Daily Folder]/[asset filename]`
        * Execute `mkdir -p [Asset Daily Folder]`.
        * **Action:** Save the asset content to `[Asset Path]`. (Requires tool capability).
        * **Action:** Add reference link within `[Content File Path]`: `![[asset filename]](../assets/[date_YYYYMMDD]/[asset filename])` or similar relative link.
        * **Action:** Update asset index `[COMM_ROOT]/index/asset.index.md`.
    * Log asset processing results.
5.  **Update Logs & Indexes:**
    * Generate 1-2 sentence `brief_summary`.
    * **Action:** Append entry to `[COMM_ROOT]/index/master-log.md` (use relative path to content file).
    * **Action:** Append entry to `[COMM_ROOT]/index/message.index.md`.
    * Log success/failure of index updates.
6.  **Extract Action Items:**
    * Scan message content for explicit tasks, requests, questions needing answers, or deadlines.
    * Format as checklist items: `- [ ] Action description [Due: YYYY-MM-DD] [Assignee?]`. Store in `extractedActionItems` list.
7.  **Generate Output JSON:**

**Output:**

* Respond ONLY with a single JSON object summarizing the ingestion results.

    ```json
    {
      "status": "Success" | "Partial Success" | "Failure",
      "type": "Message",
      "platform": "[Communication Platform]",
      "processedFile": "[Relative path to Content File Path]",
      "assetsSaved": [ // List of relative paths to saved assets
        "[Relative path to Asset Path 1]",
        "[Relative path to Asset Path 2]"
      ],
      "summary": "[Generated brief_summary]",
      "actionItems": [ // List of extracted action item strings
        "- [ ] Action description [Due: YYYY-MM-DD] [Assignee?]",
        "..."
      ],
      "errors": "[List any errors encountered during processing]" // Empty if status is Success
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Expect Message Content immediately after this prompt.
* **File I/O:** MUST use tools to create directories, write content file, save assets, append to log/index files. Handle errors.
* **Path Variables:** Use `[COMM_ROOT]` and `[ASSET_ROOT]` correctly.
* **Output Format:** Strictly output ONLY the specified JSON summary.

---
**(END OF PROMPT FILE CONTENT - Message Content input expected immediately after this line)** 