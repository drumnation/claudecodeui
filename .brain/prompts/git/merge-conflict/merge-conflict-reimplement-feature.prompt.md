AUTO-EXECUTE-V1

**ACTION REQUIRED:** Analyze the specified commits on the guide branch using their metadata, generate a detailed reimplementation guide, and propose the changes needed (as a patch or detailed instructions) to apply the feature to the target branch. Output a structured JSON object with the guide and the proposed changes. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Guide Feature Reimplementation and Propose Changes

You are an expert software analyst and guide generator. You will receive information about a feature implemented on a "guide" branch (represented by a list of commit hashes) and a "target" branch where it needs to be reimplemented (often after a merge conflict resolution makes direct merging impossible). Your task is to first create a comprehensive guide explaining the feature based on the guide branch commits, and second, to propose the specific code changes (as a patch or detailed instructions) needed to reimplement the feature on the target branch. **You will propose changes, not execute them directly.**

**Input:**

1.  **Guide Branch Name:** [Provide the name of the source/guide branch]
2.  **Target Branch Name:** [Provide the name of the branch where the feature needs reimplementation]
3.  **Relevant Commit Hashes on Guide Branch:** [Provide an ordered list of commit hashes on the Guide Branch that constitute the feature to be reimplemented]
4.  **Base Commit Hash (Optional but Recommended):** [Provide the common ancestor commit hash between the Guide and Target branches. If omitted, finding it automatically might be needed but could be complex/inaccurate.]

**Instructions:**

1.  **Retrieve Commit Metadata (Guide Branch Context):**
    * For each hash in `Relevant Commit Hashes on Guide Branch`:
        * Construct path: `.brain/git/commits/[xx]/[hash].json`.
        * Read and parse JSON metadata (`messageSubject`, `messageBody`, `files`, etc.).
    * Handle missing/invalid files. Stop if critical info is missing.

2.  **Create Comprehensive Reimplementation Guide (Markdown):**
    * Based *only* on the retrieved metadata for the specified commits on the `Guide Branch Name`:
    * Generate a detailed Markdown guide explaining the feature. Include:
        * **Feature Overview:** What the feature does, its purpose (use commit messages).
        * **Key Components/Files:** List the main files created/modified by the feature commits and their roles.
        * **Architecture/Logic Flow:** Describe how the components interact (based on code structure inferred from file lists and commit messages).
        * **Implementation Details:** Highlight significant logic, algorithms, or data structures introduced (based on commit messages).
        * **Configuration/Setup:** Mention any necessary configuration changes.
        * **Rationale:** Explain design choices if evident from commit messages.

3.  **Propose Reimplementation Changes:**
    * **Goal:** Determine the changes represented by the `Relevant Commit Hashes on Guide Branch` relative to the `Base Commit Hash` (or the point where the guide branch diverged if base is unknown).
    * **Method 1 (Generate Patch - Preferred if Base Commit is reliable):**
        * If `Base Commit Hash` is provided and reliable:
            * Construct and execute a `git diff` command: `git diff [Base Commit Hash] [Last Hash in Relevant Commit Hashes] -- [list of files involved in the feature commits]`
            * Capture the output in standard patch format.
            * Set `changeProposalType` to "patch".
            * Set `changeProposalContent` to the captured patch output.
        * **Log:** Log the command used and whether patch generation was successful.
    * **Method 2 (Generate Detailed Instructions - Fallback):**
        * If a patch cannot be generated (e.g., no reliable Base Commit, `git diff` tool unavailable/fails):
            * Analyze the sequence of changes from the commit metadata (files added/modified/deleted in each commit).
            * Generate a list of instructions for the target branch:
                * Files to be created (with their full proposed content).
                * Files to be modified (showing specific sections/lines to change, based on commit diffs if possible, otherwise based on logic described in the guide).
                * Files to be deleted.
            * Set `changeProposalType` to "instructions".
            * Set `changeProposalContent` to the generated list of instructions (formatted clearly in Markdown or similar).
        * **Log:** Log that detailed instructions are being provided instead of a patch.

**Output:**

* Respond ONLY with a single JSON object containing the guide and the change proposal. Structure it as follows:

    ```json
    {
      "reimplementationGuideMarkdown": "# Feature Reimplementation Guide: [Feature Name]\n\n## Overview\n...\n\n## Key Components\n...\n\n...", // Full generated Markdown guide content
      "changeProposal": {
        "type": "patch" | "instructions", // Indicates the method used in Step 3
        "content": "...", // Either the full patch content (string) or the detailed instructions (string/Markdown)
        "baseCommitUsed": "[Base Commit Hash]" | null // Hash used for patch, or null if instructions generated
      },
      "summary": "Generated reimplementation guide and proposed changes as a patch based on commit X relative to base Y." // Brief summary of what was done
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Metadata Retrieval:** MUST read `.brain/git/commits/[xx]/[hash].json` for context from the guide branch commits.
* **No Direct Execution:** DO NOT attempt to check out branches, apply changes, or run `git commit` on the target branch. Only generate the guide and the *proposal* for changes (patch or instructions).
* **Output Format:** Strictly adhere to the specified JSON output structure. No extra text.
* **Error Handling:** Handle missing metadata. Clearly state if a patch could not be generated and instructions are provided instead.