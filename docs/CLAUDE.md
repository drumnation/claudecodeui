### A Mandate for Clarity: The Definitive Rules for AI-Powered Technical Documentation

To ensure the creation of impeccable, comprehensive, and enduring technical documentation, the following set of rules must be followed. This directive is designed to guide an AI agent in building a repository of knowledge that is not only useful for current and future developers but also serves as a memory aid for the agent itself, leaving a clear trail of "breadcrumbs" and chronicling the evolution of the project.

---

### ## 1. The Golden Rule: Document with Purpose

Before any documentation is written, the intended audience and purpose must be clearly defined. All documentation must be crafted to be:

* **Discoverable:** Information should be easy to find through clear naming conventions and a logical structure.
* **Comprehensible:** Use clear, concise language. Avoid jargon where possible, and when its use is unavoidable, provide a clear definition.
* **Actionable:** Documentation should empower the reader to take a specific action, whether it's using an API, understanding a feature, or contributing to the codebase.
* **Consistent:** Adhere to a uniform style and format throughout the project's documentation.

---

### ## 2. The Project's North Star: High-Level Documentation

At the root of the project, a set of high-level documents will serve as the primary entry point for anyone seeking to understand the project's purpose and architecture.

* **`README.md`:** This is the project's front door. It must include:
    * A concise **project summary** explaining what the project is and the problem it solves.
    * **Getting Started:** Clear, step-by-step instructions for setting up the development environment and running the project.
    * **Usage:** Simple, practical examples of how to use the project.
    * **Contribution Guidelines:** A clear process for how others can contribute to the project.
    * **License Information:** A statement of the project's license.

* **`ARCHITECTURE.md`:** This document will provide a high-level overview of the system's architecture. It must contain:
    * **Core Concepts:** An explanation of the fundamental concepts and design principles.
    * **System Diagram:** A visual representation of the major components and their interactions.
    * **Technology Stack:** A list of the key technologies and frameworks used, with a brief justification for their selection.

---

### ## 3. The Breadcrumbs of Creation: Documenting the "Why"

To leave a clear trail of thought and decision-making, a dedicated log will be maintained.

* **`DECISION_LOG.md`:** This document will chronicle all significant architectural and technical decisions. Each entry must include:
    * **Date:** The date the decision was made.
    * **Context:** The problem or question that prompted the decision.
    * **Options Considered:** A brief overview of the different solutions that were evaluated.
    * **The Decision:** A clear statement of the chosen solution and the rationale behind it.
    * **Consequences:** The anticipated positive and negative consequences of the decision.

---

### ## 4. The Voice of the Code: In-Code Documentation

The code itself should be a primary source of documentation.

* **Descriptive Naming:** All variables, functions, classes, and modules must have clear, descriptive names that accurately reflect their purpose.
* **Function and Method Comments:** Every function and method must have a docstring that explains:
    * Its **purpose** (the "what," not the "how").
    * Its **parameters**, including their types and a brief description.
    * What it **returns**, including the type and a description.
    * Any **exceptions** it might raise.
* **Inline Comments:** Use inline comments sparingly to explain complex or non-obvious sections of code. Focus on the "why" behind a particular implementation choice.

---

### ## 5. A Memory for the Agent: The Self-Documentation Protocol

To ensure the AI agent retains critical information about the project, a special set of internal notes will be maintained. These are for the agent's reference and to aid in future development and maintenance.

* **`AGENT_NOTES.md`:** This file will contain a running log of:
    * **Key Challenges:** A record of significant technical hurdles encountered and how they were overcome.
    * **Future Considerations:** A list of potential future improvements, refactoring opportunities, or features to consider.
    * **"Gotchas" and Quirks:** A list of any non-intuitive behaviors or potential pitfalls in the codebase.
    * **Learning Summaries:** After implementing a new feature or fixing a complex bug, a brief summary of what was learned and how it can be applied in the future.