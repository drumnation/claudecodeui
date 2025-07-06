**ACTION REQUIRED:** Execute the following email drafting task immediately. Analyze the context, previous email, and goal to generate a professional email response in Markdown format. Output JSON containing the draft and a suggested filename/path. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Draft Email Response

**Objective:**
Draft a professional email response based on a previous email thread, incorporating necessary information, asking clarifying follow-up questions to achieve a specific goal, and optionally mimicking a specified writing style.

**Input:**

1.  **Previous Email Context:** [Provide the content of the email being replied to, OR provide the path to the processed Markdown file in `/communications/processed/emails/...`]
2.  **Response Goal:** [Clearly state the primary objective of this response email, e.g., "Get clarification on network diagram node X", "Request firewall logs for Y date range", "Confirm understanding of requirement Z".]
3.  **Key Points to Include (Optional):** [User may provide bullet points or specific information to incorporate in the response.]
4.  **Writing Style Guidelines (Optional):** [Reference to learned style parameters OR provide examples like "Maintain a formal tone", "Be concise and direct", "Use empathetic language".]
5.  **Communication Root Path (Variable):** `[COMM_ROOT]` (Defaults to `./communications`)
6.  **Sender Info (Variables):** `[SENDER_NAME]`, `[SENDER_EMAIL]`
7.  **Recipient Info (Variables):** `[RECIPIENT_NAME]`, `[RECIPIENT_EMAIL]`

**Instructions:**

1.  **Analyze Previous Email:** Read the `Previous Email Context` to understand the ongoing conversation, key topics, and any unanswered questions or provided information.
2.  **Determine Necessary Content:** Based on the `Response Goal` and `Key Points to Include`, determine the core message of the reply.
3.  **Formulate Follow-up Questions:** Identify specific, clear questions needed to achieve the `Response Goal`. Ensure questions are directly related to the goal and the previous context.
4.  **Draft Email Body:**
    * Write the email content in Markdown.
    * Start with an appropriate greeting (e.g., `Hi [Recipient Name],`).
    * Reference the previous email clearly (e.g., "Thanks for sending over the details regarding X.", "Following up on your question about Y...").
    * Incorporate `Key Points to Include` naturally.
    * Clearly state the necessary `Follow-up Questions`.
    * Adhere to the specified `Writing Style Guidelines`. Maintain a professional tone suitable for client communication.
    * Add an appropriate closing (e.g., `Best regards,`, `Thanks,`).
5.  **Construct Full Markdown:** Assemble the complete email using the standard template:
    ```markdown
    # Email: [Generated Subject Line]

    **From:** [SENDER_EMAIL]
    **To:** [RECIPIENT_EMAIL]
    **Subject:** [Generate a clear subject, e.g., "Re: [Previous Subject]" or "Follow-up on [Topic]")]
    **Date:** [Current Date YYYY-MM-DD]
    **In response to:** [Link to Previous Email Path if provided, otherwise reference subject/date]

    [Generated Greeting],

    [Generated Body Paragraph 1]

    [Generated Body Paragraph 2+]

    [Generated Follow-up Questions Section]

    [Generated Closing],

    [SENDER_NAME]
    ```
6.  **Determine Suggested Filename/Path:**
    * Use today's date (`date_YYYYMMDD`).
    * Create a `topic_slug` from the generated subject.
    * Find the next available sequence number (`sequence_number`) in the `[COMM_ROOT]/processed/emails/[date_YYYYMMDD]/` directory.
    * Suggest Path: `[COMM_ROOT]/processed/emails/[date_YYYYMMDD]/[sequence_number]-[topic_slug]-OUTGOING.md`

**Output:**

* Respond ONLY with a single JSON object containing the drafted email content and suggested save path.

    ```json
    {
      "status": "Success",
      "suggestedPath": "[Suggested relative path, e.g., communications/processed/emails/YYYY-MM-DD/NN-topic-slug-OUTGOING.md]",
      "markdownContent": "# Email: Re: VPN Access Credentials\n\n**From:** my@email.com\n**To:** recipient@email.com\n**Subject:** Re: VPN Access Credentials\n**Date:** 2025-04-01\n**In response to:** [Previous Email](./01-vpn-access-credentials.md)\n\nHi Jed,\n\nThanks for sending the pfSense credentials...\n\nCould you also provide...\n\nBest regards,\nDavid" // Full drafted Markdown email
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input:** Use provided context, goal, and previous email.
* **Focus:** Draft a clear, professional response achieving the stated goal, including necessary follow-up questions.
* **Style:** Adhere to specified writing style guidelines if provided.
* **Output Format:** Strictly output ONLY the specified JSON object. No extra text. Do not attempt to save the file directly unless explicitly instructed by a separate tool/workflow.

---
**(END OF PROMPT FILE CONTENT - Previous Email Context/Path, Goal, Optional Points/Style expected after this line)** 