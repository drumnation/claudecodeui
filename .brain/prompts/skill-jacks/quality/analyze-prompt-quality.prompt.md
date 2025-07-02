**ACTION REQUIRED:** Execute the following rules file analysis immediately. Read the referenced `@.brain/prompts/skill-jacks/creation/create-skill-jack-general.prompt.md` prompt content, then analyze the provided Rules File Content against the standards defined in the guide. Output ONLY the structured Markdown analysis report. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Analyze Rules File Quality Against Guide Standard

**Objective:** Analyze a generated rules file (provided as input content) against the standards defined in the `@.brain/prompts/skill-jacks/creation/create-skill-jack-general.prompt.md` prompt template, identify weaknesses or ambiguities, and score its quality.

**Input:**

1.  **Skill Jack Prompt Content:** [The FULL Markdown content of the `@.brain/prompts/skill-jacks/creation/create-skill-jack-general.prompt.md` prompt is expected here. This defines the standard the rules file should meet.]
2.  **Rules File Content:** [The FULL content of the specific `.rules.ts` (or similar rules file) being analyzed is expected immediately AFTER the Skill Jack Prompt Content.]

**Analysis Process:**

1.  **Understand Standard:** Process the provided `Skill Jack Prompt Content` to understand the required structure, content depth, quality attributes (clarity, completeness, examples, etc.), and validation criteria for a knowledge file. Note the scoring guidelines provided within it.
2.  **Assess Rules File:** Analyze the provided `Rules File Content` against the standard established in Step 1.
    * **Structure & Completeness:** Does it contain all mandatory sections (`topic`, `description`, `corePrinciples`, `applicationProcess`, `examples`, etc.)? Are the sections sufficiently detailed as required by the guide?
    * **Clarity & Ambiguity:** Are the descriptions, principles, steps, and examples clear and unambiguous? Could they be misinterpreted?
    * **Actionability:** Are the `agentActions` specific and executable?
    * **Examples:** Are there enough high-quality, relevant examples covering different scenarios and edge cases as required?
    * **Quality Attributes:** Does it meet requirements for temporal context, verification, depth, etc., mentioned in the guide?
3.  **Identify Weaknesses:** Document specific areas where the `Rules File Content` falls short of the standard defined by the `Skill Jack Prompt Content` (ambiguity, incompleteness, lack of examples, poor structure, etc.).
4.  **Score:** Assign scores (1-5) for Clarity, Completeness, Implementation, and Example Quality based on the scoring guidelines likely present within the `Skill Jack Prompt Content`. Justify each score.

**Output Format:**

Respond ONLY with a single Markdown document structured as follows. Do not include introductory or concluding text.

```markdown
## Rules File Analysis Report

**Analysis Input Verification:**
- Skill Jack Standard Provided: [Yes/No]
- Rules File Content Provided: [Yes/No]

**(Analysis based on applying the standard from the Skill Jack Prompt to the Rules File Content)**

**1. Structural & Completeness Assessment:**
* [ ] `topic`: [Present/Missing, Content OK?]
* [ ] `description`: [Present/Missing, Content OK?]
* [ ] `corePrinciples`: [Present/Missing, Sufficient Detail/Examples?]
* [ ] `applicationProcess`: [Present/Missing, Steps Clear?, Agent Actions Actionable?]
* [ ] `examples`: [Present/Missing, Sufficient Number/Quality/Detail?]
* [ ] `codeExamples`: [Present/Missing, Quality OK?]
* [ ] `commonPitfalls`: [Present/Missing, Clear Solutions?]
* [ ] `improvementGuidelines`: [Present/Missing, Actionable?]
* [ ] `resources`: [Present/Missing, Links Valid?]
* [ ] `conclusion`: [Present/Missing, Comprehensive?]
* **Overall Completeness:** [Summary of missing/incomplete sections]

**2. Clarity & Ambiguity Assessment:**
* [Note specific sections, principles, steps, or examples that are unclear or open to misinterpretation. Provide rationale.]

**3. Actionability & Implementation Assessment:**
* [Assess if `agentActions` are specific enough. Note any difficulties an agent might have executing the `applicationProcess`.]

**4. Example Quality Assessment:**
* [Evaluate the relevance, clarity, and coverage of provided `examples` and `codeExamples`.]

**5. Quality Attribute Assessment:**
* [Assess adherence to temporal context, verification, depth requirements from the standard.]

**6. Scoring:**
* Clarity Score: [1-5] (Justification: ...)
* Completeness Score: [1-5] (Justification: ...)
* Implementation Score: [1-5] (Justification: ...)
* Example Quality Score: [1-5] (Justification: ...)

**7. Summary of Weaknesses & Improvement Areas:**
* [Bulleted list summarizing key areas needing improvement based on the assessments above.]
``` 