AUTO-EXECUTE-V1

**ACTION REQUIRED:** Analyze the provided commit hashes and context, retrieve metadata, generate a title and description, gather necessary information, and create a JSON data package file containing all context needed for subsequent PR actions (like review or merge). Output only the required JSON object containing the path to the created data file. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Define and Package Pull Request Data

You are an expert AI assistant specializing in Git and Pull Requests. Your task is to gather all relevant information for a proposed Pull Request based on a list of commit hashes, generate a preliminary title and description, and package all this data into a structured JSON file for later use (e.g., by review or merge prompts).

**Input:**

1.  **Commit Hashes:** [Provide an ordered list of all commit hashes included in the proposed PR, e.g., `["hash1", "hash2"]`]
2.  **PR Branch Name:** [Provide the name of the source branch for the PR]
3.  **Target Branch Name:** [Provide the name of the target branch, e.g., `main`]
4.  **Base Commit Hash (Optional but Recommended):** [Provide the common ancestor commit hash between the PR and Target branches. Needed for accurate diff generation later.]
5.  **Context/Goal (Optional):** [Briefly describe the overall feature or goal this PR accomplishes]
6.  **Code Standards Ref (Optional):** [Provide a reference/path to the relevant Code Standards document, e.g., `.brain/docs/code-standards.md`]

**Instructions:**

1.  **Retrieve Commit Metadata:**
    * For each hash in `Commit Hashes`:
        * Construct path: `.brain/git/commits/[xx]/[hash].json`.
        * Read and parse JSON metadata (`messageSubject`, `messageBody`, `messageFooter`, `files`, `timestamp`, `author`). Store this structured data for all commits.
    * Handle missing/invalid files. Stop if critical info is missing.

2.  **Synthesize PR Information:**
    * **Generate Title:** Based on the commit subjects (especially Conventional Commit types) and the `Context/Goal`, generate a concise, informative PR title.
    * **Generate Description:** Based on the commit subjects/bodies and the `Context/Goal`, generate a preliminary PR description summarizing the purpose and key changes. Include placeholders like `[Testing Done]`, `[Reviewer Focus]` for later refinement if needed.
    * **Aggregate Files:** Create a unique list of all file paths mentioned across all retrieved commit metadata `files` arrays.
    * **Determine Diff References:** Identify the necessary commit references needed to generate the correct diff later (typically `Base Commit Hash`...`Last Commit Hash in PR` or using `Target Branch Name...PR Branch Name` merge-base logic if base is not provided).

3.  **Determine Output Filename & Path:**
    * **Target Directory:** `.brain/git/pr-packages/`
    * **Filename:** Create a descriptive filename, e.g., based on branch names or a sanitized version of the generated title: `[target_branch]-[pr_branch]-pr-data.json` or `[sanitized-title]-pr-data.json`. Ensure uniqueness if necessary (e.g., add timestamp or short hash). Log the chosen filename.

4.  **Construct JSON Data Package Content:**
    * Create the JSON content including all gathered and generated information:
    ```json
    {
      "prTitle": "[Generated Title]",
      "prDescription": "[Generated Description Markdown]",
      "prBranch": "[PR Branch Name from Input]",
      "targetBranch": "[Target Branch Name from Input]",
      "commitHashes": "[List of Commit Hashes from Input]",
      "baseCommitHash": "[Base Commit Hash from Input or Determined]", // Null if not known
      "allChangedFiles": "[Aggregated List of Files from commit metadata]",
      "codeStandardsRef": "[Code Standards Ref from Input or null]",
      "creationTimestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)" // Timestamp when this package was created
      // Consider adding retrieved commit metadata summaries here if needed,
      // but primarily rely on retrieving full commit metadata later using hashes.
    }
    ```

5.  **Create JSON Data Package File:**
    * Use available tools/commands to write the generated JSON content to the fully constructed file path determined in Step 3.
    * Log the command used and report success or failure. Stop if fails.

**Output:**

* Respond ONLY with the JSON object containing the full path to the created JSON data package file: `{ "prDataFilePath": ".brain/git/pr-packages/..." }`
* NO other text, explanation, or analysis is permitted.

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Metadata Retrieval:** MUST read `.brain/git/commits/[xx]/[hash].json` files.
* **Packaging Focus:** The main goal is to gather info and create the JSON package file. Title/Description generation is preliminary.
* **File Creation:** MUST create the JSON file in the specified location.
* **Output Format:** Strictly adhere to the specified JSON output `{ "prDataFilePath": "..." }`.