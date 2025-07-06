AUTO-EXECUTE-V1

**ACTION REQUIRED:** Analyze the provided Code Standards content and generate a comprehensive set of code review guidelines formatted as Markdown, suitable for guiding an AI code reviewer. Output only the generated Markdown guidelines. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Generate AI Code Review Guidelines from Standards

You are an expert in code review best practices and technical documentation. Your task is to generate a comprehensive set of code review guidelines specifically tailored for an AI code reviewer to follow, based on the provided code standards document content.

**Input:**

1.  **Code Standards Content:** [The FULL content of the relevant code standards, style guides, and best practices document(s) is expected immediately following this prompt text]

**Instructions:**

1.  **Analyze Input Standards:** Carefully read and understand all rules, recommendations, and examples within the provided `Code Standards Content`. Identify key principles, specific rules, and mandatory requirements.
2.  **Generate Comprehensive Guidelines (Markdown):** Create a Markdown document that translates the input standards and general best practices into actionable guidelines **formatted primarily as checklists (`[ ]`)** for an AI reviewer. Structure the guidelines logically (similar to the example structure provided in the original prompt description). Ensure the guidelines cover AT LEAST the following areas, **incorporating specifics directly from the input `Code Standards Content`**:
    * **Overall Review Process:** High-level checklist for the AI reviewer's workflow.
    * **Code Quality:** Checklists covering adherence to specific coding standards & styles found in input, readability rules from input, maintainability checks, data structure/algorithm use, naming conventions from input.
    * **Security:** Checklists for vulnerabilities relevant to the project/language mentioned in standards (input validation rules, data handling practices, common flaws mentioned).
    * **Performance:** Checklists for identifying bottlenecks, resource usage concerns, UI performance points based on standards/best practices.
    * **Clarity and Documentation:** Checklists for required comment styles (e.g., JSDoc rules from input), documentation updates (READMEs, etc. if mentioned in standards), naming clarity checks, complexity explanation requirements.
    * **Refactoring and Code Smells:** Checklists for identifying duplication/smells based on standards/general principles (DRY, KISS, YAGNI), adherence to specific refactoring patterns mentioned in standards.
    * **Error Handling:** Checklists for robust error handling, required logging practices/formats from standards, graceful degradation.
    * **Testing:** Checklists verifying test coverage expectations from standards, test case quality (edge cases), specific testing requirements (visual regression, integration test patterns from standards).
    * **Technology/Component Specific Rules:** Checklists incorporating rules from the standards related to specific frameworks (React, etc.), SOLID principles, file structure, etc.
    * **Language Specific Rules (e.g., TypeScript):** Checklists for rules from standards regarding type safety (`any`), generics, type guards, immutability, exhaustive checks, etc.
    * **Providing Feedback (Guidance for AI):** Include instructions on how the AI should format its review comments (clarity, code examples, referencing specific rules from the standards).
3.  **Tailor Directly to Input:** This is critical. The generated guidelines MUST directly reflect, quote, or reference the specific rules, limits, and conventions found in the provided `Code Standards Content`. Use examples (like code snippets) directly from the standards document or create parallel examples illustrating the specific rules.
4.  **Format for AI & Readability:** Use Markdown formatting with extensive use of checklists (`[ ]`), clear headings, and code blocks. This structure makes it easier for a subsequent AI process (like the code reviewer) to parse and follow the guidelines.

**Output:**

* Respond ONLY with the generated Markdown document containing the comprehensive, tailored code review guidelines, formatted heavily as checklists. Do not include any other introductory or concluding text.

**Example Output Structure Reminder (Markdown - AI generates content based on Input Standards):**

```markdown
# [Project/Language Specific] AI Code Review Guidelines

## Overview
[Brief description referencing source standards.]

## Review Process Checklist
- [ ] Understand PR Context (Description, Linked Issues)
- [ ] Verify Build/Test Status (If applicable)
# ... other process steps ...

## Technical Guideline Checklists

### Code Quality & Style
- [ ] Adheres to naming convention: `camelCaseVariables` (Rule 3.1 from Standards Doc)?
    ```[language]
    // Example from standards doc or illustrating it
    ```
- [ ] Max line length does not exceed [NN] characters (Rule 4.2)?
# ... more quality checks based on standards ...

### Security
- [ ] Are all external inputs validated as per Standard 5.1?
- [ ] Is sensitive data handled according to Standard 5.5 (e.g., no logging)?
# ... more security checks based on standards ...

### Performance
# ... performance checks based on standards ...

### Clarity & Documentation
- [ ] Are exported functions documented using JSDoc (Standard 6.1)?
# ... documentation checks based on standards ...

### Refactoring & Code Smells
# ... refactoring checks based on standards ...

### Error Handling
- [ ] Does error logging follow the format in Standard 8.2?
# ... error handling checks based on standards ...

### Testing
- [ ] Is test coverage above [X]% for new code (Standard 9.1)?
# ... testing checks based on standards ...

### [Technology/Framework Specific Rules]
- [ ] [React Hook rules from Standard 10.1 checked?]
- [ ] [TypeScript `any` type avoided (Standard 11.1)?]
    ```typescript
    // Example from standards
    ```
# ... more specific checks based on standards ...

## Providing Feedback (AI Reviewer Guidance)
* Format comments: `File: [path], Line: [number], Rule: [Standard #], Issue: [description], Suggestion: [advice]`
* Include code examples where helpful.
* Maintain neutral tone.

## Final Compliance Check
- [ ] Does the PR meet the core requirements from its description?
- [ ] Does the code adhere to all critical rules (e.g., Security Standards 5.x)?
# ... final checks ...
```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Expect the `Code Standards Content` immediately after this prompt text.
* **Tailoring is MANDATORY:** Output MUST be derived from and reference the provided standards content.
* **Checklist Format:** Prioritize using Markdown checklists (`[ ]`) for actionable guidelines.
* **Output Format:** Strictly adhere to Markdown formatting. Respond ONLY with the generated guidelines document.

---
**(END OF PROMPT FILE CONTENT - Code Standards Content input expected immediately after this line)**