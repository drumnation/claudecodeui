AUTO-EXECUTE-V1

**ACTION REQUIRED:** Execute the following Single Pull Request description generation task immediately. Analyze the provided commit hashes, retrieve their metadata, and generate a single, detailed PR description in Markdown format. Output a structured JSON object containing the description and a proposed temporary filename. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Generate Single Pull Request Description

You are an expert pull request (PR) description generator. You will receive a list of commit hashes representing all changes for a single PR. Your task is to retrieve the structured metadata for these commits and generate one comprehensive, well-structured, and highly informative PR description in Markdown format.

**Input:**

1.  **Commit Hashes:** [Provide an ordered list of all commit hashes included in this PR, e.g., `["hash1", "hash2", "hash3"]`]
2.  **Context/Goal:** [Optional: Briefly describe the overall feature or goal this PR accomplishes, e.g., "Implement user profile editing"]

**Instructions:**

1.  **Retrieve Commit Metadata:**
    * For each hash in the input `Commit Hashes` list:
        * Construct the path to the metadata file: `.brain/git/commits/[xx]/[hash].json` (where `xx` is the first two chars of the hash).
        * Read and parse the JSON content from this file.
        * Store the structured data (hash, messageSubject, messageBody, messageFooter, files, planCommitId, etc.).
    * Handle errors gracefully if a metadata file is not found or invalid. Log skipped hashes. Stop if no valid commit data can be retrieved.

2.  **Generate Comprehensive PR Description (Markdown):**
    * Synthesize information from all retrieved commit metadata and the optional `Context/Goal`.
    * Create a single Markdown document adhering to best practices, including the following sections:
        * **Title:** Generate a clear, concise, and informative title (e.g., `# feat(profile): Implement Profile Editing Feature`). Use Conventional Commit format if applicable based on the primary commits.
        * **Overview:** Write a brief summary of the PR's overall purpose, key changes, and impact. Leverage the input `Context/Goal`.
        * **Detailed Changes:**
            * Provide a bulleted list or narrative summarizing the significant changes introduced across all commits.
            * Reference specific commits where appropriate for key pieces of functionality: `(Related to commit: \`[hash]\` - [messageSubject])`. Use the retrieved `messageSubject` and `messageBody` for context.
            * Use visuals like sub-bullets, icons (✨, 🐛, 💡, etc.), and potentially brief code snippets (` ``` `) to enhance clarity.
        * **Related Issues/Tasks:** List any associated issue tracker IDs (e.g., `Closes #123`, `Fixes #456`), potentially extracted from commit `messageFooter` fields.
        * **Testing & Validation:** Describe the testing performed (unit, integration, manual steps) and the outcome. Mention changes to test files listed in commit metadata.
        * **Potential Risks/Considerations:** Highlight any areas reviewers should pay special attention to, potential impacts, or deployment notes.
        * **Reviewer Focus (Optional):** Suggest specific areas or questions for reviewers.

3.  **Propose Temporary Filename:**
    * Suggest a temporary filename for the Markdown description (e.g., `pr-profile-editing-[random_chars].md`).

**Output:**

* Respond ONLY with a single JSON object containing the generated Markdown description and the proposed filename. Structure it as follows:

    ```json
    {
      "markdownDescription": "# feat(profile): Implement Profile Editing Feature\n\n**Overview:**\nThis PR introduces the ability for users to edit their profiles...\n\n**Detailed Changes:**\n* Implemented the profile form UI (Related to commit: `hash1` - feat: Add profile form UI).\n* Added API endpoint for updating profile data (Related to commit: `hash2` - feat: Create profile update endpoint).\n* Included input validation (Related to commit: `hash3` - fix: Add validation to profile update).\n\n**Related Issues:**\nCloses #42\n\n**Testing:**\n...\n\n...", // Full generated Markdown content
      "tempFilename": "pr-profile-editing-abc.md"
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Metadata Retrieval:** Reliably read and parse the `.brain/git/commits/[xx]/[hash].json` files for ALL provided hashes.
* **Structured Data Usage:** Synthesize information from ALL retrieved commit metadata fields (`messageSubject`, `messageBody`, `files`, etc.) to create ONE cohesive PR description.
* **Output Format:** Strictly adhere to the specified JSON output structure. No extra text.
* **Error Handling:** Log issues retrieving/parsing metadata. Decide reasonably whether to proceed with partial data or stop if critical information is missing.