AUTO-EXECUTE-V1

**ACTION REQUIRED:** Analyze the git diff provided after this text (or use fallback), generate ONE comprehensive commit message summarizing all changes, stage ALL changes, execute the commit, and create the JSON metadata file. Output only the required JSON object containing the commit hash and metadata file path upon completion. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Generate Single Commit & Log Metadata

**Objective:**
Analyze the provided or retrieved `git diff` output for the branch "[Provide Branch Name Here]". Generate **one single, comprehensive commit message** summarizing all changes. Stage **all detected changes**, execute the commit, and create a JSON metadata file for the resulting commit in `.brain/git/commits/`.

**Your Task:**
1.  Analyze all changes (provided after this prompt or retrieved via fallback).
2.  Generate **one** set of commit message components (Subject, Body, Footer) summarizing the overall changes.
3.  Determine the list of all changed/new/deleted files.
4.  Stage **all** these files using `git add`.
5.  Execute the commit using the generated message.
6.  **On success:** Get hash, create `.brain/git/commits/[xx]/[hash].json` metadata file.
7.  Output the commit hash and metadata file path.

**Process Overview:**
1.  **You (AI):** Analyze diff, generate ONE message (Subject/Body/Footer), `git add` all files, `git commit`, get hash, create metadata JSON file.
2.  **Output:** Return `{ "commitHash": "...", "metadataPath": "..." }`.

**Required Information from User (Needed before analysis):**
1.  **Current Git Branch Name:** [Enter Branch Name Here]
2.  **Context (Optional but Highly Recommended):** [Describe the overall goal or theme of ALL the changes being committed]

**Execution Steps:**
1.  **Analyze Git Changes & Get File List:**
    * **Check for Diff Input:** Look for `git diff` content immediately following this text. Use if found.
    * **If Diff NOT Found (Fallback):**
        * Notify: "Fallback: Retrieving status..."
        * Execute: `git status --porcelain -uall && git ls-files --others --exclude-standard`. Log output.
        * Parse the output to get the list of all modified, added, deleted, and untracked files (`changedFilesList`). Determine actual count `[count]`. Handle errors.
        * If `count < 20` AND diff wasn't provided, Execute: `git diff`. Use its content for analysis if successful.
        * If `count >= 20` or `git diff` fails/wasn't run, analyze based primarily on the `changedFilesList` and user context. Note limitations.
    * **If Diff WAS Found:** Parse the diff to confirm/generate the `changedFilesList`. Determine `[count]`.
    * Log the determined `[count]` and the list of files (`changedFilesList`) being considered.
2.  **Generate Single Commit Message Components:**
    * Based on the analysis of all changes (diff content or file list) and the user's `Context`, generate **one** set of commit message components:
        * **`commitSubject`:** Concise summary (<50 chars, Conventional Commit type recommended) reflecting the overall theme of the changes.
        * **`commitBody`:** Descriptive summary of the key changes included. Can be multi-line, wrapped (~72 chars). May list significant changes if needed. Can be empty.
        * **`commitFooter`:** Optional. Any relevant `Closes #...`, `Refs: #...`, `BREAKING CHANGE: ...`. Can be empty.
    * Log the generated Subject, Body, and Footer.
3.  **Stage All Changes:**
    * **Command:** `git add -- ${changedFilesList.join(' ')}` (Use the explicit list of files identified in Step 1).
    * Execute. Log command. Check status. If fails, report error, attempt `git reset`, STOP execution.
    * Log success: "`git add` successful for all changes."
4.  **Commit Changes:**
    * **Reconstruct Full Message:** Combine the generated parts:
      ```
      fullMessage = commitSubject
      if (commitBody.trim()) { fullMessage += "\n\n" + commitBody.trim() }
      if (commitFooter.trim()) { fullMessage += "\n\n" + commitFooter.trim() }
      ```
    * **Command:** `echo "${fullMessage}" | git commit -F -`
    * Execute. Log command. Check status. If fails, report error, attempt `git reset HEAD~1`, STOP execution.
    * Log success: "`git commit` successful."
5.  **Create Commit Metadata (On Successful Commit):**
    * **Step 5a: Get Commit Hash:** Execute `git rev-parse HEAD`. Store `hash`. Handle errors.
    * **Step 5b: Prepare Paths:** Extract `xx`, construct `metadataDir = ".brain/git/commits/${xx}/"`, `metadataFile = "${metadataDir}${hash}.json"`.
    * **Step 5c: Create Directory:** Check/create `metadataDir` using `mkdir -p`. Log. Handle errors.
    * **Step 5d: Construct JSON Content:** Create the JSON string:
        ```json
        {
          "hash": "${hash}",
          "messageSubject": ${JSON.stringify(commitSubject)},
          "messageBody": ${JSON.stringify(commitBody)},
          "messageFooter": ${JSON.stringify(commitFooter)},
          "files": ${JSON.stringify(changedFilesList)}, // List of all files in this commit
          "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)", // Or env equivalent
          "branch": "${branchName}" // Store the branch this was committed on
          // No 'planFile' or 'planCommitId' as this wasn't from a multi-step plan
        }
        ```
    * **Step 5e: Create JSON Metadata File:** Write JSON content to `metadataFile`. Log. Handle errors. Log success: "Metadata file created: `metadataFile`".
6.  **Final Output:**
    * Respond ONLY with the JSON object containing the commit hash and the path to the created metadata file: `{ "commitHash": "${hash}", "metadataPath": "${metadataFile}" }`
    * NO other text, explanation, or analysis is permitted.

**Crucial Instructions for AI (Apply During Execution):**
* **ACTION REQUIRED:** Execute NOW.
* **Single Commit Focus:** Generate ONE message summarizing ALL changes. Stage ALL changes identified.
* **Structured Message:** Generate distinct Subject, Body, Footer components.
* **Commit Command:** Reconstruct full message, use `git commit -F -`.
* **Metadata Creation:** Follow explicit steps. Create JSON with separate message keys.
* **Error Handling:** STOP on critical `git add`/`commit`/parsing errors.
* **Command Execution:** Requires reliable tool access.
* **Clarity:** Log actions, commands, outcomes.
* **Output:** Final output MUST BE ONLY the specified JSON object.

---
**(END OF PROMPT FILE CONTENT - Diff input expected immediately after this line)**