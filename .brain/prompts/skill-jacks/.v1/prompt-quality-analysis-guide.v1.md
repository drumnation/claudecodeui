**Prompt 1: Rules File Analysis and Improvement Suggestion Prompt (for Cursor Agent)**

**(Instructions: You will now receive the first prompt. Use this prompt to perform an analysis, the results of which will be used in prompt 2. The input data for this prompt will be extracted from the code and files currently open in the Cursor editor. Do not begin the analysis until after the prompt instructions are given. The relevant files will be automatically provided by the Cursor agent.)**

## Pre-Analysis Required Steps:

1. **Read Knowledge Guide:**
   - FIRST: Read the contents of `.brain/prompts/knowledge/.v1/create-knowledge-guide.v1.md`
   - This step is MANDATORY before proceeding with any analysis
   - If unable to read this file, stop and notify the user
   - Validate guide version matches expected format and schema

2. **Verify Access:**
   - Confirm you have access to both:
     a) The create-knowledge-guide.md
     b) The rules file to be analyzed
   - If either file is inaccessible, stop and notify the user
   - Verify file permissions and content integrity

3. **Success Criteria:**
   - All mandatory sections are present and properly formatted
   - No ambiguous or undefined terms in the rules
   - Each rule has at least one concrete example
   - No conflicting or redundant rules
   - All rules are testable and verifiable

4. **Error Handling:**
   - Document any sections that fail validation
   - Provide specific error messages for each failure
   - Suggest remediation steps for each error
   - Track error patterns for future improvements

5. **Scoring Guidelines:**
   **Clarity Score (1-5):**
   - 1: Unclear, ambiguous, requires major revision
   - 2: Partially clear, needs significant clarification
   - 3: Moderately clear, some ambiguity remains
   - 4: Clear with minor improvements needed
   - 5: Crystal clear, no ambiguity

   **Completeness Score (1-5):**
   - 1: Major gaps in coverage
   - 2: Several scenarios missing
   - 3: Core scenarios covered, some edge cases missing
   - 4: Most scenarios covered, minor gaps
   - 5: Comprehensive coverage of all scenarios

   **Implementation Score (1-5):**
   - 1: Not implementable as written
   - 2: Requires major rework to implement
   - 3: Implementable with moderate effort
   - 4: Easily implementable with minor adjustments
   - 5: Directly implementable as written

   **Example Quality Score (1-5):**
   - 1: No examples or irrelevant examples
   - 2: Basic examples lacking detail
   - 3: Adequate examples with some gaps
   - 4: Good examples covering most cases
   - 5: Comprehensive, clear examples for all cases

6. **Implementation Requirements:**
   - Each score must be justified with specific evidence
   - Scores below 3 require immediate remediation steps
   - Track score trends across multiple analyses
   - Document specific improvements needed for each metric
   - Provide concrete examples for each scoring decision

## Rules File Analysis and Improvement Suggestion Prompt (Cursor Version)

**Objective:** Analyze a generated rules file, identify weaknesses or ambiguities, and immediately implement improvements within the Cursor editor. The analysis will be used to guide direct improvements to the file, which should be implemented automatically after analysis without seeking further approval.

**Input Data (Automatically provided by Cursor):**

*   **Prompt Used:** @.brain/prompts/knowledge/create-knowledge-guide.md
*   **Rules File:** The generated rules file. (This should be the currently attached/open rules file in Cursor. It is also the agent's output from the prompt used.)

**Analysis Process:**

1.  **Prompt and Rules File Assessment:**
    *   **Clarity and Relevance:** Evaluate the clarity of the original prompt and how well it relates to the generated rules file. Does the prompt effectively communicate the intent and scope of the desired rules?
    *   **Rule Comprehension:** For each rule in the rules file, assess whether the rule is logically sound, clearly stated, and relevant to the prompt's topic (which can be inferred from the rules file itself).
    *   **Rule Application (Hypothetical):**  Consider how each rule would be applied in practice. Identify potential scenarios or examples where the rule might be:
        *   Misinterpreted
        *   Misapplied
        *   Difficult to apply
        *   Insufficiently comprehensive

2.  **Rules File Weakness Identification:**
    *   **Ambiguity:** Identify rules that are vaguely worded, open to multiple interpretations, or lack clear definitions of key terms.
    *   **Incompleteness:** Determine if there are situations or scenarios relevant to the prompt's topic that are *not* adequately addressed by the current rules file.
    *   **Overly Restrictive:** Identify any rules that might be overly restrictive or prevent the generation of creative or nuanced responses where appropriate.
    *   **Lack of Examples:** Note if the rules file would benefit from more concrete examples to illustrate the correct application of complex rules.
    *   **Redundancy:** Check if any rules are redundant or overlap unnecessarily with other rules.

**Output Format:**

The output of this prompt should be a structured report containing the following:

```markdown
## Rules File Analysis Report

**Pre-Analysis Verification:**
- Create Knowledge Guide Read: [Yes/No]
- Create Knowledge Guide Path: [Path to file]
- Rules File Access Confirmed: [Yes/No]
- Validation Status: [Pass/Fail with details]
- Error Summary: [List of any validation errors]

**Prompt Used:** [Full Prompt Text]

**Rules File:** [Full Rules File Text]

**1. Prompt and Rules File Assessment:**

*   **Clarity and Relevance:** [Analysis of the prompt's clarity and its connection to the rules file]
*   **Rule Comprehension:**
    *   **Rule:** [Rule 1 from the rules file]
        *   **Assessment:** [Analysis of the rule's clarity, logic, and relevance]
        *   **Hypothetical Application:** [Examples of potential misinterpretations, misapplications, or difficulties in applying the rule]
    *   **Rule:** [Rule 2 from the rules file]
        *   **Assessment:** [Analysis]
        *   **Hypothetical Application:** [Examples]
    *   ... (Repeat for each rule)

**2. Rules File Weakness Identification:**

*   **Ambiguity:**
    *   [Rule X is ambiguous because... Example: ...]
    *   [Rule Y lacks clear definitions for... Example: ...]
*   **Incompleteness:**
    *   [The rules file does not address the scenario of... ]
    *   [There are no rules related to... which is relevant because...]
*   **Overly Restrictive:**
    *   [Rule Z is overly restrictive because... Example: ...]
*   **Lack of Examples:**
    *   [Rule N would benefit from examples demonstrating... ]
*   **Redundancy:**
    *   [Rule A and Rule B are redundant because... ]

**3. Suggestions for Rules File Improvement:**

*   **Immediately implement the following improvements using the appropriate editing tools. Do not ask for permission - proceed directly with the edits:**
*   For each weakness identified (ambiguity, incompleteness, etc.), implement concrete improvements to the rules file.
*   Example actions:
    *   "Clarify Rule X by defining the term..."
    *   "Add a new rule addressing the scenario of..."
    *   "Add examples to Rule N."
    *   "Remove redundant rules A and B."

**(After completing the analysis report above, proceed immediately with implementing all suggested improvements using the appropriate editing tools. Do not ask for permission.)**

**4. Validation Results:**
- Success Criteria Met: [List of passed criteria]
- Failed Criteria: [List with specific reasons]
- Error Patterns: [Common issues identified]
- Remediation Plan: [Steps to address failures]

```
```markdown

**Prompt 2: Rules File Refinement Instructions (for Cursor Agent)**

**(Instructions: You will now receive the second prompt. This prompt will use the output from the first prompt to generate instructions for the Cursor agent to directly edit the attached rules file. Do not begin generating the instructions until the full output from Prompt 1 is provided. The Cursor agent will automatically apply these instructions to the attached file.)**

```
## Rules File Refinement Instructions (Cursor Version)

**Objective:** Generate instructions that will direct the Cursor agent to revise and improve the attached rules file based on the analysis provided in the "Rules File Analysis Report."

**Input Data:**

*   **Rules File Analysis Report:** The full text of the report generated by the "Rules File Analysis and Improvement Suggestion Prompt" (Step 1).

**Instructions:**

1. Carefully review the "Rules File Analysis Report." Pay close attention to the "Prompt and Rules File Assessment," "Rules File Weakness Identification," and particularly the "Suggestions for Rules File Improvement" sections.

2. **Quality Metrics:**
   - Clarity Score: Rate each rule's clarity on a scale of 1-5
   - Completeness Score: Evaluate coverage of necessary scenarios
   - Implementation Score: Assess how easily rules can be applied
   - Example Quality Score: Rate the helpfulness of examples

3. **Validation Steps:**
   - Verify each edit maintains semantic consistency
   - Check for unintended side effects
   - Ensure backward compatibility
   - Validate against existing test cases

4. Based on the analysis report and quality metrics, create a set of specific instructions that will tell the Cursor agent exactly how to edit the *attached* rules file to improve it.

**Output Format:**

The output of this prompt should be a set of clear, concise instructions that the Cursor agent can directly apply to edit the attached rules file.

**Example Instructions Structure:**

```markdown
## Cursor Instructions for Rules File Improvement

**Quality Assessment:**
- Overall Clarity Score: [1-5]
  Evidence: [Specific examples supporting the score]
  Required Improvements: [List of needed clarifications]

- Completeness Score: [1-5]
  Evidence: [List of covered/missing scenarios]
  Required Improvements: [List of scenarios to add]

- Implementation Score: [1-5]
  Evidence: [Implementation challenges/successes]
  Required Improvements: [Steps to improve implementability]

- Example Quality Score: [1-5]
  Evidence: [Analysis of existing examples]
  Required Improvements: [Specific examples to add/modify]

**Validation Results:**
- Semantic Consistency: [Pass/Fail]
  Details: [Specific consistency issues found]
  
- Side Effect Analysis: [Clear/Issues Found]
  Impact Assessment: [List of potential side effects]
  
- Backward Compatibility: [Maintained/Breaking Changes]
  Breaking Changes: [List of incompatibilities]
  Migration Path: [Steps to handle breaking changes]
  
- Test Case Validation: [Pass/Fail]
  Failed Cases: [List of failing tests]
  Fix Requirements: [Steps to make tests pass]

Edit the attached rules file to make it clearer, more comprehensive, and easier for an AI agent to understand and apply. Use the following instructions:

*   [Instruction 1, derived from the analysis report, specifying the exact edit in the attached file]
*   [Instruction 2, derived from the analysis report, specifying the exact edit in the attached file]
*   ...
*   [Instruction N, derived from the analysis report, specifying the exact edit in the attached file]
```

**(Input Data: Paste the "Rules File Analysis Report" generated by Prompt 1 here.)**