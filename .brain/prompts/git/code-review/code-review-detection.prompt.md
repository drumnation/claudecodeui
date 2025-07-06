AUTO-EXECUTE-V1

**ACTION REQUIRED:** Analyze the provided Pull Request information using the specified factors and rules. Output only the decision and rationale. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Determine Necessity of Full Code Review

You are an expert AI assistant tasked with determining if a full code review is necessary for a given Pull Request (PR). You will analyze high-level information about the PR to make an informed recommendation.

**Input:**

1.  **PR Title:** [Provide the title of the pull request.]
2.  **PR Description:** [Provide the description of the changes in the PR.]
3.  **Changed Files / Stats:** [Provide a list of changed file paths. **Ideally, also include diff stats** if available (e.g., "15 files changed, 250 insertions(+), 80 deletions(-)" or per-file stats). If only the file list is available, state that.]

**Instructions:**

Analyze the provided PR information (`PR Title`, `PR Description`, `Changed Files / Stats`) to determine if a full code review is warranted. You will need to infer some aspects based on the available information. Consider the following factors:

1.  **Scope of Changes:**
    * **Analyze:** How many files were changed? How widespread are the changes across the codebase (based on paths)? If stats are provided, how large is the diff (insertions/deletions)?
    * **Infer:** Is this a small tweak or a significant modification?

2.  **Complexity & Nature of Changes:**
    * **Analyze:** Based on Title, Description, and file paths/types (`.test.`, `.md`, `.config`, `.js`, `.ts`, `.py`, etc.), what kind of changes seem to be included? (e.g., documentation, tests, configuration, core logic, UI, dependencies).
    * **Infer:** Do the changes likely involve simple updates or complex new logic/refactoring? Do they introduce new features or significantly alter existing ones?

3.  **Risk Assessment:**
    * **Analyze:** Do the changed files seem related to critical areas (e.g., `auth`, `payment`, core models, security configurations)? Does the description mention security implications or user-facing impact?
    * **Infer:** What is the potential risk if bugs were introduced? High impact on users or system stability? Low risk (e.g., typo in docs)?

4.  **Decision Rules:** Apply the following logic:
    * **Review Recommended If:**
        * Changes are large (many files / significant line count).
        * Changes appear complex (new features, core logic modification, non-trivial refactoring).
        * Changes affect critical or security-sensitive areas.
        * Changes have high potential risk.
        * There is significant uncertainty about scope, complexity, or risk based on the limited information.
    * **Review MAY Not Be Necessary If:**
        * Changes are very small AND highly localized AND clearly low-risk AND simple (e.g., only documentation typos, minor formatting fixes confined to non-critical files, dependency bumps with clear compatibility).
    * **Basic Check:** Even if skipping a *full* review, a quick scan for obvious major issues is always prudent (though not part of your output decision here).
    * **Err on Caution:** If in doubt, recommend a review.

**Output:**

* Respond ONLY with the decision and rationale, using one of the following formats exactly:

    ```
    Decision: Full code review recommended.
    Rationale: [Provide a brief explanation based on scope, complexity, type, or risk factors. Example: The PR modifies core authentication logic across multiple files, indicating high complexity and risk.]
    ```

    OR

    ```
    Decision: Full code review likely not necessary.
    Rationale: [Provide a brief explanation. Example: The changes appear limited to correcting typos in documentation files, representing minimal scope and risk.]
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Focus:** Determine NEED for review based on high-level info. Do not perform the review itself.
* **Inference:** Acknowledge that you may need to infer complexity/risk from limited data (file list, title, desc).
* **Output Format:** Strictly adhere to the specified "Decision: ... Rationale: ..." format. No extra text.