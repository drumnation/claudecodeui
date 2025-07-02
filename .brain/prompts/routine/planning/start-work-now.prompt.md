AUTO-RUN-V1

## 🚀 Initiate Work Sequence! 🚀

**🎯 Objective:** Autonomously develop the project according to the provided prioritized features and established coding standards, while also being mindful of context limitations.

**🗂️ Context:**
*   **Project Goals & Overview:** [This would be provided in your initial project setup or a separate context file loaded beforehand.]
*   **Coding Standards & Conventions:** [This would also be provided as part of your initial context.]
*   **Prioritized Feature List:** [This comes from your initial project setup. It will be used only to select the next feature after the one pointed to by `@feature-task-list-link` is completed]

**🧩 Current Feature Details:**

[INSERT CONTENT FROM @feature-task-list-link HERE]

**➡️ Current Task:**

1.  **🔍 Prioritization & Selection:**
    *   **Action:** Acknowledge the feature defined in "Current Feature Details" above. This is your current highest priority.
    *   **Action:** If the Current Feature is marked as complete, analyze the prioritized feature list from the Context. Then select the highest priority, incomplete feature.
    *   **Output:** `Feature Selection: [Feature Name] - Priority: [Priority Level]`
        *   **✅ Validation:**
            *   If the current feature is incomplete, proceed.
            *   If a new feature was selected, verify that the selected feature is indeed the highest priority *and* marked as incomplete.
            *   If not, repeat the Prioritization & Selection process.

2.  **🧠 Understanding & Planning:**
    *   **Action:** Thoroughly understand the selected feature's requirements, dependencies, as outlined in the "Current Feature Details".
    *   **Action:** Identify any potential roadblocks or challenges, especially those not already mentioned in the "Current Feature Details."
    *   **Output:** `Understanding & Planning Report:`
        *   `📑 Feature Summary: [Brief description of the feature, you may refer to the provided details]`
        *   `🔗 Dependencies: [Confirm or update the list of dependencies, if any]`
        *   `🚧 Potential Roadblocks: [Confirm or expand upon any potential problems and proposed solutions]`
        *   `🗺️ Implementation Approach: [High-level outline of how you will implement the feature, referencing relevant rules and patterns from the Context and the "Current Feature Details"]`

3.  **💻 Implementation:**
    *   **Action:** Begin implementing the feature according to the Implementation Approach.
    *   **Action:** Write modular, well-documented code.
    *   **Action:** Run unit tests *incrementally* during development.
    *   **Action:** Adhere to the coding standards defined in the Context.
    *   **Action:** After each significant chunk of implementation, RUN `AUTO-VALIDATE`
    *   **Output:** `Implementation Update: [Status: In Progress/Completed]`
        *   `⌨️ Code Snippets: [Relevant code implemented so far]`
        *   `🧪 Test Results: [Summary of test execution results]`
        *   `🚩 Challenges Faced: [Any new challenges encountered during implementation]`

**🏁 Task Completion Protocol:**

1.  **🔬 Validation:**
    *   **Action:** RUN `AUTO-VALIDATE`
    *   **Output:** `Validation Result: [Pass/Fail] - [Reason]`

2.  **📝 Completion Report (ONLY if Validation Passes):**
    *   **Output:**
        ```markdown
        "Completion Report: Task [X.Y] - [Task Name] completed. Implementation involved [brief summary of the code changes and logic]. Key decisions included [mention any significant design or implementation choices]."
        ```

3.  **🔄 Task Update (ONLY if Validation Passes):**
    *   **Action:** UPDATE task list using the information in `@.brain/prompts/routine/update-feature-tasks.md`
    *   **Output:** Updated task list in the Context.

4.  **📚 Feature Documentation (ONLY if Validation Passes and current task completes the feature):**
    *   **Action:** UPDATE project documentation using the information in `@.brain/prompts/routine/update-core-docs.md`
    *   **Output:** Updated project documentation.

5.  **⏭️ Next Task Initiation (ONLY if Validation Passes):**
    *   **Action:** Proceed to the next task.
        *   If the current feature is complete, go back to step 1: Prioritization & Selection, to choose the next feature.
        *   If the current feature is not complete, continue with the next task within the current feature.
    *   **DO NOT ASK FOR CONFIRMATION. THIS IS A MANDATORY STEP.**
    *   **Output:** Begin the process again with the new task or feature.

**🧮 Context Monitoring & Handoff:**

1.  📊 **Context Check:**
    *   **Action:** After each subtask completion (Prioritization, Planning, Implementation, Validation, etc.), output an approximate context usage level: Low (less than 30%), Medium (30-60%), High (60-90%), or Very High (above 90%). Base your estimate on the amount of information processed so far, including code, text, and previous outputs.
    *   **Output:** `Context Usage: [Low/Medium/High/Very High]`

2.  **🔥 Handoff Trigger (if Context Usage >= 90%):**
    *   **Action:**  FOLLOW INSTRUCTIONS in `@.brain/prompts/routine/context-handoff.md` to create a handoff document
    *   **Output:** Context handoff document.
    *   **Action:** **HALT FURTHER PROCESSING.** Await further instructions for the new agent with the handoff document.

**🚨 Error Handling & Resolution:**

1.  **⚠️ Error Detection:**
    *   **Trigger:** Any step fails, including `AUTO-VALIDATE`, compilation, or test execution.
    *   **Action:** Immediately halt the current operation. **DO NOT PROCEED TO THE NEXT TASK OR DOCUMENTATION UPDATES.**

2.  **❗ Error Reporting:**
    *   **Output:** `Error Report:`
        *   `Error Type: [e.g., Validation Error, Compilation Error, Test Failure]`
        *   `Error Details: [Specific error message, stack trace, or relevant details]`
        *   `Context: [Code snippet or relevant context leading to the error]`

3.  **🛠️ Resolution Attempts:**
    *   **Action:** Attempt to resolve the error using project guidelines and standard debugging practices.
    *   **Action:** Log each resolution attempt.
    *   **Output:** `Resolution Attempt Log:`
        *   `Attempt # [Number]: [Description of the attempted solution]`
        *   `Result: [Success/Failure - Details]`

4.  **🆘 Escalation Protocol (if error persists):**
    *   **Trigger:** Two failed resolution attempts.
    *   **Action:** READ `@.brain/knowledge/scenarios/debugging/agent-stuck-strategies.md`
    *   **Output:** Revised resolution attempt based on the guidance.
    *   **Trigger:** Three failed resolution attempts
    *   **Action:** READ `@.brain/prompts/knowledge/create-knowledge-for-stuck-agent.md` to create a knowledge file.
    *   **Output:** A new knowledge file detailing the issue, attempts, and request for assistance.
    *   **Action:** Await further instructions. **DO NOT PROCEED UNTIL THE ERROR IS RESOLVED OR EXPLICITLY INSTRUCTED TO DO SO.**

5.  **✅ Resolution Documentation (if error is resolved):**
    *   **Action:** Document the successful resolution strategy.
    *   **Action:** Update relevant knowledge base files if necessary.
    *   **Output:** `Resolution Summary: [Detailed explanation of the solution that worked]`