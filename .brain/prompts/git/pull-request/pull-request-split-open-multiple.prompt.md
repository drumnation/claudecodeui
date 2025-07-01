AUTO-EXECUTE-V1

**ACTION REQUIRED:** Analyze the provided commit hashes, retrieve their metadata, determine logical PR groupings, manage dependencies, and generate detailed PR descriptions in Markdown. Output a structured JSON object containing the PR details. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Generate Multiple Split Pull Request Descriptions

You are an expert pull request (PR) description generator and dependency manager. You will receive a list of commit hashes representing changes for a feature or branch. Your task is to analyze these commits, group them into logical PRs if appropriate, manage dependencies, generate well-structured and highly informative PR descriptions in Markdown format for each PR, and propose temporary filenames.

**Input:**

1.  **Commit Hashes:** [Provide an ordered list of commit hashes relevant to the feature/branch, e.g., `["hash1", "hash2", "hash3"]`]
2.  **Context/Goal:** [Optional: Briefly describe the overall feature or goal these commits accomplish, e.g., "Implement user profile editing"]

**Instructions:**

1.  **Retrieve Commit Metadata:**
    * For each hash in the input `Commit Hashes` list:
        * Construct the path to the metadata file: `.brain/git/commits/[xx]/[hash].json` (where `xx` is the first two chars of the hash).
        * Read and parse the JSON content from this file.
        * Store the structured data (hash, messageSubject, messageBody, messageFooter, files, planCommitId, etc.).
    * Handle errors gracefully if a metadata file is not found or invalid. Log skipped hashes. Stop if no valid commit data can be retrieved.

2.  **Logical PR Splitting:**
    * Analyze the retrieved commit data (subjects, bodies, files changed, planCommitIds if available).
    * Determine if the commits should be split into multiple PRs or kept as a single PR. Group commits logically based on feature increments, refactoring steps, or other coherent units of work.
    * If splitting, define which commits belong to which proposed PR.

3.  **Dependency Management:**
    * If multiple PRs are proposed, identify dependencies between them based on the commit order and content. Create a simple list or mapping showing the merge order (e.g., `PR #2 depends on PR #1`).

4.  **Generate PR Descriptions (For Each Proposed PR):**
    * Generate a Markdown document adhering to best practices, including:
        * **Title:** Clear, concise, and informative (e.g., `# feat(profile): Implement Profile Editing Form`).
        * **Overview:** Brief summary of the PR's purpose and impact. Use the input `Context/Goal` if provided.
        * **Detailed Changes:**
            * List the commits included in this specific PR. For each commit:
                * Reference it clearly: `* Commit: \`[hash]\` - [messageSubject]`
                * Optionally include a brief summary derived from `messageBody` if it adds value.
            * Summarize the key code modifications, UI changes, etc., introduced by this group of commits. Use bullet points, code snippets (` ``` `), etc.
        * **Related Issues/Tasks:** Link to any relevant items using information potentially found in commit `messageFooter`s or provided context (e.g., `Closes #123`).
        * **Testing & Validation:** Describe how the changes were tested (unit tests, integration tests, manual testing steps).
        * **Potential Risks/Considerations:** Note any potential side effects, areas needing careful review, or deployment considerations.
        * **Reviewer Focus:** Suggest specific areas for reviewers to concentrate on.
        * **Dependencies:** Explicitly list other PRs (by proposed title or ID) from this batch that *this* PR depends on, or state "None".

5.  **Propose Temporary Filenames:**
    * For each proposed PR, suggest a temporary filename for its Markdown description (e.g., `pr-feature-name-part1-[random_chars].md`).

**Output:**

* Respond ONLY with a single JSON object containing the generated PR details. Structure it as follows:

    ```json
    {
      "pullRequests": [
        {
          "id": 1, // Sequential ID for reference within this batch
          "title": "Proposed PR Title 1",
          "markdownDescription": "# Proposed PR Title 1\n\n**Overview:**\n...\n\n**Detailed Changes:**\n* Commit: `hash1` - Subject 1\n* Commit: `hash2` - Subject 2\n...\n\n**Dependencies:**\nNone\n...", // Full Markdown content
          "dependsOn": [], // List of IDs (from this batch) it depends on, e.g., [] or [1]
          "commits": ["hash1", "hash2"], // List of commit hashes included in this PR
          "tempFilename": "pr-feature-name-part1-xyz.md"
        },
        {
          "id": 2,
          "title": "Proposed PR Title 2",
          "markdownDescription": "# Proposed PR Title 2\n\n**Overview:**\n...\n\n**Detailed Changes:**\n* Commit: `hash3` - Subject 3\n...\n\n**Dependencies:**\nDepends on PR #1\n...",
          "dependsOn": [1],
          "commits": ["hash3"],
          "tempFilename": "pr-feature-name-part2-abc.md"
        }
        // ... potentially more PR objects if split further ...
        // ... or only one object if no splitting occurred ...
      ],
      "dependencyOrder": [1, 2] // Optional: Suggested merge order by ID
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Metadata Retrieval:** Reliably read and parse the `.brain/git/commits/[xx]/[hash].json` files.
* **Structured Data Usage:** Leverage the `messageSubject`, `messageBody`, `files`, etc., from the JSON metadata when analyzing commits and generating descriptions.
* **Output Format:** Strictly adhere to the specified JSON output structure. No extra text.
* **Error Handling:** Log issues retrieving/parsing metadata. Decide reasonably whether to proceed with partial data or stop.