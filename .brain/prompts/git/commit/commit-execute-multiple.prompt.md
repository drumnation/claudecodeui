AUTO-EXECUTE-V1

**ACTION REQUIRED:** Use the information and instructions below to parse the Markdown plan file, extract structured commit message components, execute the commits, create metadata JSON files, and update the plan checklist. Output logs and a final summary. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Execute Git Commit Sequence from Markdown Plan & Log Metadata

**Objective:**
Execute a sequence of git commits based on a provided **Markdown plan file**. For each successful commit, create JSON metadata using **structured message components** and **update the plan file's checklist**.

**Your Task:**
1.  Read and parse the Markdown plan file to extract tasks (ID, Subject, Body, Footer, Files).
2.  Iterate through commit tasks **sequentially**.
3.  For each task: Stage files, reconstruct & create commit using the message components from the plan.
4.  **On success:** Get hash, create metadata JSON (with separate message fields), **update the Markdown checklist**.
5.  Report outcomes clearly.

**Input:**
1.  **Markdown Plan File Path:** [Provide the full path to the `.md` plan file]

**Execution Steps:**
1.  **Read Markdown File:** Load content from `[Markdown Plan File Path]`. Handle errors (STOP if file not found).
2.  **Parse Markdown Plan:**
    * Log: "Parsing Markdown plan file: `[Markdown Plan File Path]`"
    * Initialize an empty list `parsedTasks`.
    * Iterate through the Markdown content to find commit task blocks. For each block starting with `- [ ] Commit N:`:
        * Extract the ID (`N`).
        * Extract the subject line from the `` comment. Store as `taskSubject`.
        * Extract the text within the ` ```commit-subject ``` ` block (should match `taskSubject`).
        * Extract the text within the ` ```commit-body ``` ` block (preserving newlines). Store as `taskBody`. Can be empty.
        * Extract the text within the ` ```commit-footer ``` ` block (preserving newlines). Store as `taskFooter`. Can be empty.
        * **Validate:** Ensure required components (ID, Subject, Files) were found. If format is incorrect, log error and STOP.
        * Extract the list of files under `Files:`. Store as `taskFiles`.
        * Append `{id: N, messageSubject: taskSubject, messageBody: taskBody, messageFooter: taskFooter, files: taskFiles}` to `parsedTasks`.
    * Log: "Found `parsedTasks.length` commit tasks in the plan." If `parsedTasks.length` is 0 or parsing failed, STOP.
3.  **Iterate Commit Tasks:** Loop through the `parsedTasks` list **in order** (using index `i`). Let `task = parsedTasks[i]`.
4.  **For Each Parsed Task (`task`):**
    * **Log Intent:** "Attempting Task #`task.id` (`i + 1` / `parsedTasks.length`): Commit subject '`task.messageSubject`'"
    * **Stage Files:**
        * **Command:** `git add -- ${task.files.join(' ')}`
        * Execute. Log. Check status. Handle errors (reset, STOP). Log success.
    * **Commit Changes:**
        * **Reconstruct Full Message:** Combine the parts following Git convention:
          ```
          fullMessage = task.messageSubject
          if (task.messageBody.trim()) {
              fullMessage += "\n\n" + task.messageBody.trim()
          }
          if (task.messageFooter.trim()) {
              fullMessage += "\n\n" + task.messageFooter.trim()
          }
          ```
        * **Command:** `echo "${fullMessage}" | git commit -F -`
        * Execute. Log command. Check status. Handle errors (reset, STOP). Log success.
    * **Create Commit Metadata (On Successful Commit):**
        * **Step 4a: Get Commit Hash:** `git rev-parse HEAD`. Store `hash`. Handle errors.
        * **Step 4b: Prepare Paths:** Extract `xx`, construct `metadataDir`, `metadataFile`. Convert input plan path to `relativePlanFilePath`.
        * **Step 4c: Create Directory:** Check/create `metadataDir` using `mkdir -p`. Log. Handle errors.
        * **Step 4d: Construct JSON Content:** Create the JSON string with separate message fields:
            ```json
            {
              "hash": "${hash}",
              "messageSubject": ${JSON.stringify(task.messageSubject)},
              "messageBody": ${JSON.stringify(task.messageBody)},
              "messageFooter": ${JSON.stringify(task.messageFooter)},
              "files": ${JSON.stringify(task.files)},
              "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
              "planFile": "${relativePlanFilePath}",
              "planCommitId": ${task.id}
              // Add optional "author", "parents", "rationale" here if parsed/retrieved
            }
            ```
        * **Step 4e: Create JSON Metadata File:** Write JSON content to `metadataFile`. Log. Handle errors. Log success.
    * **Step 4f: Update Markdown Plan File (Mandatory on Success):**
        * **Log Action:** "Attempting checklist update for Task #`task.id`..."
        * **Goal:** Change `- [ ] Commit ${task.id}:` to `- [x] Commit ${task.id}:` in `[Markdown Plan File Path]`.
        * **Method:** Use reliable tool/script (`replaceInFile` or Read-Modify-Write).
        * **Log Outcome:** Report success/failure of the update attempt. (Do not stop process if only this fails).
5.  **Final Report:** "Commit sequence execution finished. Successfully executed, logged metadata, and attempted checklist update for X out of Y planned commits." (Summarize errors).

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Markdown Parsing:** Reliably parse ID, Subject (comment + block), Body, Footer, Files using the specified structure. Stop if parsing fails.
* **Commit Command:** Reconstruct full message from parts, use `git commit -F -`.
* **Metadata Creation:** Create JSON with **separate message keys** (`messageSubject`, `messageBody`, `messageFooter`). Store **relative** `planFile` path. Include `planCommitId`.
* **Checklist Update:** MUST attempt update after each success. Report outcome.
* **Error Handling:** STOP on critical errors. Report non-critical errors.
* **Command Execution:** Requires reliable tool access.
* **Clarity:** Log extensively.
* **File Paths:** Convert input plan path to relative for JSON storage.