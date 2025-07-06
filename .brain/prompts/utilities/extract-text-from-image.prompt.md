**ACTION REQUIRED:** Execute the following image analysis task immediately. Analyze the provided image, extract ALL relevant text and structured data, and format it as detailed Markdown. Output ONLY the generated Markdown content. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Extract Detailed Text and Structure from Image

**Objective:**
Analyze the provided image (screenshot of UI, terminal output, configuration screen, table, diagram, etc.) and extract all textual and structural information, formatting it accurately as Markdown. The goal is to create a machine-readable text representation suitable for a knowledge base or further processing.

**Input:**

1.  **Image:** [The image file content is expected immediately AFTER this prompt text. Assume multi-modal input.]
2.  **Context (Optional):** [User may provide brief context, e.g., "Firewall rule table", "ifconfig output", "UI settings screen for user profiles".]

**Instructions:**

1.  **Analyze Image Content:** Carefully examine the entire image. Identify distinct elements like:
    * Paragraphs or blocks of text.
    * Code snippets or terminal output.
    * Tables (with headers and rows).
    * Lists (bulleted or numbered).
    * UI elements (buttons, input fields, labels, values, checkboxes, dropdowns with selected values).
    * Diagram elements with text labels.
    * Handwritten notes (if legible).
2.  **Extract Text Accurately:** Transcribe ALL visible text meticulously. Pay close attention to spelling, punctuation, capitalization, symbols, IP addresses, configuration values, commands, file paths, error messages, etc. Do not summarize unless text is clearly repetitive boilerplate or unreadable.
3.  **Preserve & Format Structure:** Recreate the structure of the information using Markdown:
    * **Tables:** Use Markdown table format (`| Header | Header |\n|---|---|\n| Cell | Cell |`). Ensure columns align correctly with the image.
    * **Code/Terminal Output:** Use appropriate Markdown code fences, ideally specifying the language if identifiable (e.g., ```bash ... ```, ```json ... ```, ```plaintext ... ```). Preserve indentation.
    * **Lists:** Use Markdown lists (`* `, `- `, `1. `). Maintain hierarchy if nested lists are present.
    * **UI Elements:** Represent UI elements logically. Use key-value pairs or nested lists. Clearly indicate states (checked/unchecked, selected value, enabled/disabled). Example:
        ```markdown
        * **Section: User Details**
            * Label: User Name
            * Input Value: `John Doe`
            * Label: Status
            * Dropdown Selected: `Active`
            * Checkbox: `[x] Enable Notifications` (Checked)
            * Button: `[ Save Changes ]`
        ```
    * **Headings:** Use Markdown headings (`#`, `##`, etc.) to reflect visual sectioning in the image.
4.  **Prioritize Key Information:** Ensure critical details like settings, values, IDs, errors, and configurations are captured accurately and completely.

**Output:**

* Respond ONLY with the extracted and formatted text as a single Markdown string. Do not include introductory text like "Here is the extracted text:". Start directly with the Markdown content.

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Expect the Image content immediately after this prompt.
* **Focus:** Accurate text extraction AND structural representation in Markdown.
* **Completeness:** Extract ALL relevant and legible details.
* **Output Format:** Strictly output ONLY the Markdown content.

---
**(END OF PROMPT FILE CONTENT - Image Content input expected immediately after this line)** 