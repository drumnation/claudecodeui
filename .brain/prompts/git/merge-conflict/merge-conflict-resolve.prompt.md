AUTO-EXECUTE-V1

**ACTION REQUIRED:** Analyze the conflicting file content, using the provided commit/PR context and retrieved commit metadata. Propose resolved code, explain the strategy, and indicate confidence. Output a structured JSON object with the results. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Resolve Git Merge Conflict

You are an expert Git merge conflict resolver. You will receive the content of a file with Git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), along with context about the conflicting branches (relevant commit hashes, optional PR descriptions). Your task is to analyze the conflict, leverage the context to understand intent, propose the best resolution prioritizing functionality and robustness, and explain your strategy.

**Input:**

1.  **Conflicted File Path:** [Provide the relative path to the file containing conflicts, e.g., `src/utils/helpers.ts`]
2.  **Branch A Commit Hashes:** [Provide ordered list of relevant commit hashes from Branch A (e.g., "ours" or the branch being merged into) since the common ancestor, e.g., `["hashA1", "hashA2"]`]
3.  **Branch B Commit Hashes:** [Provide ordered list of relevant commit hashes from Branch B (e.g., "theirs" or the branch being merged) since the common ancestor, e.g., `["hashB1", "hashB2", "hashB3"]`]
4.  **Branch A PR Description (Optional):** [Provide PR description content for Branch A, if applicable]
5.  **Branch B PR Description (Optional):** [Provide PR description content for Branch B, if applicable]
6.  **Conflicting File Content:** [The FULL content of the specified file, including the `<<<<<<<`, `=======`, `>>>>>>>` markers, is expected immediately following this prompt text]

**Instructions:**

1.  **Retrieve Commit Metadata (Context):**
    * For each hash in `Branch A Commit Hashes` and `Branch B Commit Hashes`:
        * Construct path: `.brain/git/commits/[xx]/[hash].json`.
        * Read and parse JSON metadata (`messageSubject`, `messageBody`, `files`, etc.).
    * Use this metadata, along with PR descriptions, to understand the *intent* and changes made on each branch leading to the conflict. Handle missing/invalid files gracefully.

2.  **Analyze Conflict Blocks:**
    * Identify all conflict blocks within the `Conflicting File Content` marked by `<<<<<<< HEAD`, `=======`, and `>>>>>>> [branch-name]`.
    * For each block, carefully compare the code changes introduced by Branch A (between `<<<<<<<` and `=======`) and Branch B (between `=======` and `>>>>>>>`).

3.  **Determine Resolution Strategy (Per Block):**
    * **Understand Intent:** Based on the code and the context from commit metadata/PR descriptions, determine what each branch was trying to achieve.
    * **Prioritize:** Favor changes that preserve essential functionality, enhance robustness (e.g., better error handling, validation), improve performance, or align better with the overall project goals.
    * **Decide Action:** For each conflict block, choose one:
        * **Keep Branch A's version.**
        * **Keep Branch B's version.**
        * **Combine Intelligently:** Merge logic or content from both sides, potentially modifying code to work correctly together. This requires careful synthesis.
        * **Flag as Unresolvable:** If the conflict is too complex, ambiguous, or requires domain knowledge you lack, mark it as needing manual review.

4.  **Generate Resolved Content:**
    * Create the full content for the specified `Conflicted File Path`.
    * Replace each conflict block (`<<<<<<<` to `>>>>>>>`) with the code determined by the resolution strategy in Step 3.
    * If any blocks were flagged as unresolvable, leave standard conflict markers in place for those specific blocks OR clearly comment them as needing manual review within the resolved content.

5.  **Summarize Strategy & Confidence:**
    * Briefly explain the reasoning behind the resolution choices made for each significant conflict block.
    * Assess the overall confidence in the proposed resolution (High, Medium, Low). Recommend manual review if confidence is not High.

**Output:**

* Respond ONLY with a single JSON object containing the resolution details. Structure it as follows:

    ```json
    {
      "resolvedFilePath": "[Conflicted File Path from Input]",
      "resolvedContent": "...", // Full file content with conflicts resolved (or marked for manual review)
      "resolutionStrategySummary": "Resolved conflict in function `X` by keeping Branch B's updated logic and integrating Branch A's error handling. Conflict in configuration section Y requires manual review due to ambiguity.", // Overall summary of choices
      "confidence": "High" | "Medium" | "Low - Manual Review Recommended",
      "unresolvedBlocks": [ // List details if any blocks were flagged in Step 3d
        { "startLine": 105, "endLine": 120, "reason": "Ambiguous intent regarding variable Z." }
      ]
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Metadata Retrieval:** MUST attempt to read `.brain/git/commits/[xx]/[hash].json` for context.
* **Input Source:** Expect the `Conflicting File Content` immediately after this prompt text.
* **Focus:** Resolve conflicts based on functionality, robustness, and inferred intent from context.
* **Output Format:** Strictly adhere to the specified JSON output structure. No extra text.
* **Confidence:** Be honest about resolution confidence. Flag complex/ambiguous conflicts for manual review.
* **Safety:** Do not execute any `git` commands to apply the resolution; only propose the resolved content.

---
**(END OF PROMPT FILE CONTENT - Conflicting File Content input expected immediately after this line)**