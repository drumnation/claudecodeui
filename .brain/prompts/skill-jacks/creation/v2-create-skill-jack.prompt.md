**ACTION REQUIRED: CRITICAL PROCESS ADHERENCE REQUIRED.**
**TO PREVENT SYSTEM TIMEOUTS, YOU MUST STRICTLY FOLLOW THE MULTI-PART FILE GENERATION PROCESS. THIS MEANS YOUR INTERNAL CONTENT GENERATION MUST SIMULATE CREATING THE SKILL JACK IN THE SPECIFIED `.ts.part` CHUNKS SEQUENTIALLY (AS DETAILED IN STEP 0 AND STEP 0.5) *BEFORE* ASSEMBLING THEM INTO THE FINAL SINGLE CODE BLOCK FOR OUTPUT. FAILURE TO INTERNALLY GENERATE IN CHUNKS WILL LEAD TO TIMEOUTS.**

Execute the following skill-jack file generation task immediately. Use the provided `[Topic to Document]`, `[Topic Type]`, and `[TargetScope]` to generate a comprehensive, structured skill-jack rule file in TypeScript format. Output ONLY the generated TypeScript code block. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Generate Structured Skill-Jack File

🤖 Generate a comprehensive skill-jack rule file on the topic of: **[Topic to Document]** (Type: **[Topic Type]**) (Scope: **[TargetScope]**)

This file must serve as a foundational resource to equip an AI agent with deep understanding and practical application capabilities for this concept. It will be used within a multi-agent system.

---

## Step 0: File Organization and Structure (Pre-computation)

1.  **Input Parameters (Assumed to be provided with the request):**
    * `[Topic to Document]`
    * `[Topic Type]` (e.g., 'Coding', 'Psychology', 'Parenting', 'SocialDynamics')
    * `[TargetScope]` (e.g., "universal" or "agent:my-expert-agent")

2.  **Derive Names:**
    * Topic Kebab Case: `[topic-name-kebab-case]` (derived from `[Topic to Document]`, e.g., `darvo`, `typescript-debugging`)
    * Final Output Filename: `[topic-name-kebab-case].skill-jack.ts`
    * CamelCase Constant Name: `[topicNameInCamelCase]SkillJack` (derived from `[Topic to Document]`, e.g., `darvoSkillJack`, `typescriptDebuggingSkillJack`).

3.  **Temporary Job Directory (TEMP_JOB_DIR):**
    * Conceptual Path: `.brain/skill-jacks/temp-skill-jack-parts/[topic-name-kebab-case]/`
    * Conceptual Action: `mkdir -p .brain/skill-jacks/temp-skill-jack-parts/[topic-name-kebab-case]/`
    * All temporary part files will be mentally written into this `TEMP_JOB_DIR`.

4.  **Determine Final Destination Path Logic:**
    * **Base Path Determination:**
        * If `[TargetScope]` is "universal": `BASE_PATH = ".brain/skill-jacks/"`
        * If `[TargetScope]` starts with "agent:":
            * Extract agent name (e.g., `my-expert-agent` from "agent:my-expert-agent"). Let this be `AGENT_NAME`.
            * `BASE_PATH = ".brain/N-agent-${AGENT_NAME}/d-skill-jacks/"`
    * **Subfolder Organization:**
        * Based on the `[Topic Type]` and `[Topic to Document]`, decide on an appropriate subfolder name (e.g., `coding/`, `psychology/`, `productivity/`). This subfolder should be relevant to the topic's categorization. Let this be `[chosen-subfolder]`.
        * Example: `chosen-subfolder = "coding-patterns"` or `chosen-subfolder = "social-dynamics"`.
    * **Final Directory (FINAL_DESTINATION_DIR):** `FINAL_DESTINATION_DIR = "${BASE_PATH}[chosen-subfolder]/"`
        * Note: Ensure `[chosen-subfolder]` ends with a `/` if it's not empty, or handle path concatenation appropriately. If no subfolder is chosen, `FINAL_DESTINATION_DIR` is just `BASE_PATH`.
    * **Final File Path (FINAL_FILE_PATH):** `FINAL_FILE_PATH = "${FINAL_DESTINATION_DIR}${Final Output Filename}"`
    * Conceptual Action (performed later): `mkdir -p ${FINAL_DESTINATION_DIR}`

## Step 0.5: Large File Generation and Assembly Strategy (MANDATORY INTERNAL PROCESS)

**YOU MUST INTERNALLY GENERATE THE SKILL JACK CONTENT IN THE FOLLOWING CHUNKS.** This is not just about conceptual file operations; your internal content creation process must break the task down this way to avoid generating an overly large single piece of data internally, which causes timeouts.

1.  **Generate Content in Chunks (Internal Simulation):**
    * Your internal thought process must create the content for each of the following `.ts.part` files sequentially. These parts will be conceptually stored in `TEMP_JOB_DIR`.
    * The content for each part must be only the specified raw JavaScript object property/value string (or header/footer structure). Do not include ` ```typescript ` markers *within* these raw content parts.
    * **`00-header.ts.part`**:
        * Content: File-level JSDoc comment, the JSDoc comment for the skill jack constant, and the start of the constant declaration:
            ```typescript
            /**
             * Skill-Jack: [Title Case Topic]
             *
             * [1-sentence explanation...]
             * @module brain-garden/skill-jack
             * @category [appropriate category chosen by agent, e.g. value of chosen-subfolder]
             */

            /**
             * Skill-Jack on [Topic to Document]
             *
             * This constant provides comprehensive guidance...
             */
            export const [topicNameInCamelCase]SkillJack = {
            ```
    * **`01-metadata.ts.part`**:
        * Content: The `topic`, `topicType`, and `description` properties, each followed by a comma.
            ```typescript
            topic: "[Topic to Document]",
            topicType: "[Topic Type]",
            description: "[Detailed description of the topic and its relevance. Ensure this is comprehensive.]",
            ```
    * **`02-corePrinciples.ts.part`**:
        * Content: The `corePrinciples` array property, filled with 3-7 principles, followed by a comma.
            ```typescript
            corePrinciples: [ /* ... detailed content ... */ ],
            ```
    * **`03-applicationProcess.ts.part`**: (or `behavioralPattern`, etc.)
        * Content: The `applicationProcess` object property (or its equivalent), filled comprehensively, followed by a comma.
            ```typescript
            applicationProcess: { /* ... detailed content ... */ },
            ```
    * **`04-examples.ts.part`**:
        * Content: The `examples` object property, filled with diverse use cases, followed by a comma.
            ```typescript
            examples: { /* ... detailed content ... */ },
            ```
    * **`05-codeExamples.ts.part` (Conditional)**: If `[Topic Type]` is 'Coding' or highly technical.
        * Content: The `codeExamples` array property, followed by a comma.
            ```typescript
            codeExamples: [ /* ... detailed content ... */ ],
            ```
    * **`06-commonPitfalls.ts.part`**: (or `warningSigns`, etc.)
        * Content: The `commonPitfalls` array property (or its equivalent), filled comprehensively, followed by a comma.
            ```typescript
            commonPitfalls: [ /* ... detailed content ... */ ],
            ```
    * **`07-improvementGuidelines.ts.part` (Conditional & Adaptable)**:
        * Content: The `improvementGuidelines` object property, followed by a comma.
            ```typescript
            improvementGuidelines: { /* ... detailed content ... */ },
            ```
    * **`08-specializedSections.ts.part` (Conditional & Dynamic)**: If adding specialized sections for non-coding topics.
        * Content example:
            ```typescript
            psychologicalImpacts: [ /* ... detailed content ... */ ],
            keyTheories: [ /* ... detailed content ... */ ],
            ```
    * **`09-resources.ts.part`**:
        * Content: The `resources` array property, followed by a comma.
            ```typescript
            resources: [ /* ... detailed content ... */ ],
            ```
    * **`10-conclusion.ts.part`**:
        * Content: The `conclusion` string property. **NO TRAILING COMMA HERE.**
            ```typescript
            conclusion: "[Comprehensive conclusion statement.]"
            ```
    * **`99-footer.ts.part`**:
        * Content: The closing brace and semicolon for the constant.
            ```typescript
            };
            ```

2.  **Conceptual Combination:**
    * After internally generating all parts, imagine they are combined by the script:
        `node .brain/scripts/combine-skill-jack-parts.js ${TEMP_JOB_DIR} ${TEMP_JOB_DIR}${Final Output Filename}`

3.  **Conceptual File Placement:**
    * Imagine destination directory creation: `mkdir -p ${FINAL_DESTINATION_DIR}`
    * Imagine file move: `mv ${TEMP_JOB_DIR}${Final Output Filename} ${FINAL_FILE_PATH}`

4.  **Conceptual Clean Up:**
    * Imagine temp directory removal: `rm -rf ${TEMP_JOB_DIR}`

5.  **Final Output Expectation for THIS Prompt (Adhering to Internal Chunking):**
    * For the purpose of *this interaction*, your *internal process* MUST generate the content in the sequence of chunks described above.
    * Then, assemble these internally generated chunks into the SINGLE, FINAL, COMBINED TypeScript code block for your response.
    * Your response is *only* this final, combined code block. Do not output the individual conceptual parts, the script name, or the shell commands.

## Step 1: Skill-Jack Constant Template (Content Reference for Assembling Parts)

The exported constant in your generated file (assembled from parts defined in Step 0.5) should follow this structure. Adapt content and conditionally include/exclude sections based on the `[Topic Type]`. Content for each field should be comprehensive and meet the requirements.

```typescript
/**
 * Skill-Jack: [Title Case Topic]
 *
 * [1-sentence explanation of what this skill-jack file is for, tailored to the topic and its type]
 *
 * @module brain-garden/skill-jack
 * @category [appropriate category for this skill-jack - e.g., value of chosen-subfolder from Step 0]
 */

// DO NOT include the ISkillJack interface definition in this file.
// Ensure the constant below strictly adheres to the ISkillJack structure,
// conditionally applying sections based on the [Topic Type].

/**
 * Skill-Jack on [Topic to Document]
 *
 * This constant provides comprehensive guidance on understanding and applying/recognizing
 * [Topic to Document] in the context of [relevant application domain or context, e.g., software development, interpersonal relationships, child rearing].
 */
export const [topicNameInCamelCase]SkillJack = {
  topic: "...", // string: [Topic to Document]
  topicType: "...", // string: [Topic Type]
  description: "...", // string: Detailed description of the topic and its relevance.
  corePrinciples: [ // array of objects: Fundamental ideas or tenets.
    {
      name: "...", // string
      description: "...", // string
      examples: ["...", "..."], // optional array of strings: Illustrative examples of the principle in action.
    },
    // ... more principles
  ],
  // SECTION: Application Process / Behavioral Manifestations
  // For 'Coding' topics, this is 'applicationProcess'.
  // For non-coding topics, this might be 'behavioralPattern', 'interactionDynamics', or 'identificationProcess'.
  // Adjust sub-fields accordingly.
  applicationProcess: { // object OR equivalent for non-coding topics
    description: "...", // string: Overview of how to apply the skill or how the concept manifests.
    steps: [ // array of objects: Sequential steps for application or stages of manifestation.
      {
        name: "...", // string: Name of the step or stage.
        description: "...", // string: Detailed description.
        // For 'Coding' topics, use 'agentActions'.
        // For non-coding, might be 'observedBehaviors', 'communicationStrategies', 'internalCognitions'.
        agentActions: [ // array of objects OR equivalent for non-coding.
          {
            action: "...", // string: Specific action, behavior, or indicator.
            explanation: "...", // string: Rationale or meaning.
          },
          // ... more actions/behaviors
        ],
      },
      // ... more steps/stages
    ],
  },
  examples: { // object
    description: "...", // string: How examples illustrate the topic.
    useCases: [ // array of objects
      {
        scenario: "...", // string: Context or situation.
        // For 'Coding': 'implementation'. For non-coding: 'manifestationDetails', 'exampleDialogue', 'observedOutcome'.
        implementation: "...", // string: How the topic is applied or observed.
        outcome: "...", // string: Result or consequence.
      },
      // ... more use cases
    ],
  },
  // CONDITIONAL SECTION: Include 'codeExamples' only if [Topic Type] is 'Coding' or highly technical.
  ...( '[Topic Type]' === 'Coding' /* Evaluate this condition */ ? { codeExamples: [
    {
      language: "...", // string (e.g., 'typescript', 'python')
      description: "...", // string
      code: "...", // string containing formatted code
      explanation: "...", // string
    },
    // ... more code examples
  ]} : {}),
  // SECTION: Common Pitfalls / Warning Signs / Common Challenges
  // Adapt 'name', 'description', 'solution', 'preventativeMeasures' based on [Topic Type].
  // For DARVO, this might be 'Warning Signs & Manipulative Tactics'.
  // For Parenting, 'Common Parenting Challenges'.
  commonPitfalls: [ // array of objects
    {
      name: "...", // string: Name of the pitfall, warning sign, or challenge.
      description: "...", // string: How it manifests or what it entails.
      // For 'Coding': 'solution'. For non-coding: 'counterStrategy', 'mitigationApproach', 'supportiveResponse'.
      solution: "...", // string
      // For 'Coding': 'preventativeMeasures'. For non-coding: 'awarenessTips', 'boundarySetting'.
      preventativeMeasures: ["...", "..."], // array of strings
    },
    // ... more pitfalls/signs/challenges
  ],
  // CONDITIONAL SECTION: 'improvementGuidelines'
  // For 'Coding', focuses on technical improvement.
  // For non-coding, might focus on 'personalDevelopment', 'relationshipImprovement', 'understandingDeeper'.
  ...(true /* Replace with logic based on [Topic Type] to determine if this section is included */ ? { improvementGuidelines: {
    description: "...", // string: How to improve understanding or application.
    metrics: [ // array of objects: Ways to assess or measure understanding/application/effectiveness.
      {
        name: "...", // string: Name of the metric or area of focus.
        description: "...", // string
        // For 'Coding': 'assessmentMethod'. For non-coding: 'reflectionPrompt', 'observationalCue'.
        assessmentMethod: "...", // string
      },
      // ... more metrics/areas
    ],
  }} : {}),

  // META-INSTRUCTION: For non-coding [Topic Type] like 'Psychology', 'SocialDynamics', 'Parenting',
  // consider adding specialized sections here if applicable. These sections should be new top-level
  // keys in the main object, following a similar structure (object or array of objects with name/description).
  // Evaluate relevance deeply for [Topic to Document].
  // Examples:
  // psychologicalImpacts (for topics like DARVO): [{ name: "...", description: "...", copingMechanisms: ["..."] }]
  // keyTheories (for Psychology topics): [{ name: "...", proponents: ["..."], coreTenets: "..." }]
  // societalImpact (for SocialDynamics): { description: "...", positiveAspects: ["..."], negativeAspects: ["..."] }
  // ethicalConsiderations (for various non-coding): [{ consideration: "...", implications: "...", recommendations: ["..."] }]
  // developmentalAspects (for Parenting): [{ stage: "...", characteristics: "...", parentingFocus: ["..."] }]
  // Example of how to conditionally add such a section (replace with actual logic):
  // ...( '[Topic Type]' === 'Psychology' && '[Topic to Document]' === 'Cognitive Dissonance' ? { cognitiveBiasesRelated: [ { name: "Confirmation Bias", description: "..." } ] } : {}),

  resources: [ // optional array of objects
    {
      type: "documentation", // 'documentation' | 'academic_paper' | 'book' | 'tutorial' | 'reference' | 'tool' | 'article' | 'support_group' | 'video'
      name: "...", // string
      description: "...", // string
      link: "...", // optional string (URL)
      authorInstitution: "...", // optional string
    },
    // ... more resources
  ],
  conclusion: "...", // string: Summary of key takeaways and broader implications or considerations.
}; // End of [topicNameInCamelCase]SkillJack constant
```

## Step 2: Reference Interface (DO NOT INCLUDE IN OUTPUT)

For your reference when building the `[topicNameInCamelCase]SkillJack` constant by mentally assembling the parts, here is a conceptual `ISkillJack` interface structure. Your final output file must NOT contain this interface definition. The actual generated object should conditionally include/exclude fields based on `[Topic Type]` and potentially add new ones as per the meta-instructions.

```typescript
// THIS IS FOR REFERENCE ONLY - DO NOT INCLUDE IN THE GENERATED FILE
interface ICorePrinciple {
  name: string;
  description: string;
  examples?: string[];
}

interface IAgentAction_Behavior_Indicator { // Name adaptable
  action: string; // Or 'behavior', 'indicator', 'strategy'
  explanation: string;
}

interface IApplicationStep_Stage { // Name adaptable
  name: string;
  description: string;
  agentActions: IAgentAction_Behavior_Indicator[]; // Or other name
}

interface IUseCase {
  scenario: string;
  implementation: string; // Or 'manifestationDetails', 'exampleInteraction'
  outcome: string;
}

interface ICodeExample { // Only if topicType is 'Coding' or similar
  language: string;
  description: string;
  code: string;
  explanation: string;
}

interface ICommonPitfall_WarningSign_Challenge { // Name adaptable
  name: string;
  description: string;
  solution: string; // Or 'counterStrategy', 'mitigationApproach'
  preventativeMeasures: string[]; // Or 'awarenessTips', 'boundarySetting'
}

interface IMetric_ReflectionArea { // Name adaptable
  name: string;
  description: string;
  assessmentMethod: string; // Or 'reflectionPrompt', 'observationalCue'
}

interface IResource {
  type: 'documentation' | 'academic_paper' | 'book' | 'tutorial' | 'reference' | 'tool' | 'article' | 'support_group' | 'video';
  name: string;
  description: string;
  link?: string;
  authorInstitution?: string;
}

// Potential specialized sections for non-coding topics (examples)
interface IPsychologicalImpact {
  name: string; // e.g., "On Self-Esteem"
  description: string;
  copingMechanisms?: string[];
}

interface IKeyTheory {
  name: string; // e.g., "Attachment Theory"
  proponents?: string[];
  coreTenets: string;
  criticisms?: string[];
}

interface ISkillJack {
  topic: string;
  topicType: string; // 'Coding', 'Psychology', 'Parenting', 'SocialDynamics', etc.
  description: string;
  corePrinciples: ICorePrinciple[];
  applicationProcess: { // Or 'behavioralPattern', 'interactionDynamics', etc.
    description: string;
    steps: IApplicationStep_Stage[];
  };
  examples: {
    description: string;
    useCases: IUseCase[];
  };
  codeExamples?: ICodeExample[]; // Conditional
  commonPitfalls: ICommonPitfall_WarningSign_Challenge[]; // Adapt naming and content
  improvementGuidelines?: { // Conditional and adaptable content
    description: string;
    metrics: IMetric_ReflectionArea[];
  };
  resources?: IResource[];
  conclusion: string;

  // Dynamically added sections based on meta-instructions and topic type:
  // e.g., psychologicalImpacts?: IPsychologicalImpact[];
  // e.g., keyTheories?: IKeyTheory[];
  // e.g., perpetratorMotivations?: { motivation: string; indicators: string[]; }[]; // for DARVO
  // etc.
}
// END OF REFERENCE INTERFACE
```

## Step 3: Core Requirements for Content in Parts

When generating the content for each `.ts.part` file, ensure the resulting combined skill-jack adheres to these requirements:

1.  **Comprehensiveness & Topic-Type Relevance**: Content must be detailed and highly relevant to the `[Topic to Document]` and its `[Topic Type]`. An agent should be able to understand and correctly apply/recognize it.
2.  **Clarity**: All explanations should be unambiguous and directly applicable or understandable within the topic's domain.
3.  **Accuracy**: Information must be accurate and reflect established knowledge or best practices for the given topic.
4.  **Specificity**: Avoid vague statements; include concrete examples, steps, indicators, and metrics suitable for the topic.
5.  **Independence**: The file should be a complete resource on the topic.
6.  **Temporal Context**: Where applicable, include information about the evolution of understanding or application of the topic.
7.  **Verifiability/Recognizability**: Include objective ways to verify correct implementation (for coding) or recognize manifestations (for non-coding topics).

## Step 4: Important Considerations for Generating Content of Parts

When generating the content for each `.ts.part` file **as part of your internal chunked generation process**:

-   **Topic, TopicType & Description (for `01-metadata.ts.part`)**: Clearly define the scope, importance, and nature of the topic according to its type.
-   **Core Principles (for `02-corePrinciples.ts.part`)**: Include 3-7 foundational concepts. For non-coding, these might be underlying assumptions, key insights, or fundamental truths.
-   **Application Process / Behavioral Manifestations (for `03-applicationProcess.ts.part`)**: Detail sequential steps for coding, or stages/patterns of behavior/interaction for non-coding topics. `agentActions` should become relevant actions, observable behaviors, or communication strategies.
-   **Examples (for `04-examples.ts.part`)**: Include diverse scenarios. For non-coding, "implementation" might be "manifestation," "interaction breakdown," or "observed pattern."
-   **Code Examples (Conditional, for `05-codeExamples.ts.part`)**: If `[Topic Type]` is 'Coding', ensure examples are practical, well-documented, and follow best practices. Omit this part entirely if not a coding/technical topic.
-   **Common Pitfalls / Warning Signs / Challenges (for `06-commonPitfalls.ts.part`)**: Tailor this section heavily.
    * For `Coding`: Address typical misunderstandings and implementation errors, with technical solutions.
    * For `Psychology` (e.g., DARVO): Focus on "Warning Signs," "Manipulative Tactics," "Misinterpretations," and "Impact on Victim," with "Counter Strategies" or "Protective Measures."
    * For `Parenting`: Focus on "Common Challenges," "Misconceptions," with "Constructive Approaches" or "Supportive Responses."
-   **Improvement Guidelines (Conditional & Adaptable, for `07-improvementGuidelines.ts.part`)**:
    * For `Coding`: Provide concrete ways to measure and enhance implementations.
    * For non-coding: Focus on deepening understanding, self-reflection, recognizing patterns more effectively, or improving relational outcomes. Metrics might be qualitative. Omit this part if not applicable.
-   **Meta-Instruction for Adding Specialized Categories (Non-Coding Topics, for `08-specializedSections.ts.part`)**:
    * **Crucial Step**: Before generating content for this part (or deciding to omit it), evaluate if the `[Topic to Document]` (if non-coding) would benefit from additional, specialized sections not explicitly listed in the main template (e.g., `psychologicalImpacts` for DARVO, `keyTheories` for a psychological concept, `developmentalStages` for a parenting topic).
    * Refer to the examples in the `ISkillJack` reference and within the template's meta-instruction comments.
    * If adding such sections, define them as new top-level keys in the exported constant. Ensure they are structured meaningfully (e.g., an array of objects with `name` and `description` fields, or a more complex object if needed).
    * **The goal is to make the skill-jack maximally informative and useful for the specific non-coding domain.** If no specialized sections are relevant, this part file can be conceptually omitted.
-   **Resources (for `09-resources.ts.part`)**: Include reputable, current sources. For non-coding, this might include academic papers, seminal books, reputable organizations, or support resources.
-   **Conclusion (for `10-conclusion.ts.part`)**: Summarize key takeaways and contextual considerations, including potential ethical implications or broader societal relevance for non-coding topics.

## Step 5: Enhanced Guidelines for Superior Quality of Content in Parts

1.  **Depth Without Overwhelm**: Balance comprehensive coverage with usability within each section.
2.  **Progressive Disclosure**: Organize information logically within each section's content.
3.  **First Principles Integration**: Connect guidelines/observations to fundamental principles.
4.  **Decision Frameworks / Recognition Patterns**: Include criteria for application (coding) or identification/response (non-coding).
5.  **Edge Case Handling / Nuances**: Address unusual situations or subtle variations.
6.  **Balanced Perspective**: Acknowledge complexities, trade-offs, or differing viewpoints, especially for non-coding topics.
7.  **Future Adaptation / Evolving Understanding**: Indicate areas where approaches or understanding might evolve.
8.  **Problem-Solving / Critical Thinking Prompts**: Include guidance for common issues (coding) or prompts for deeper reflection (non-coding).

---

## Validation Reminder (For the final, combined output)

Before completing your output (the single, combined skill jack that you will provide):

1.  **CRITICAL PROCESS CHECK:** Confirm that your internal content generation process strictly adhered to the multi-part chunking detailed in Step 0.5. You must have mentally (or conceptually) generated each `.ts.part` sequentially before assembling the final output.
2.  Imagine the conceptual `combine-skill-jack-parts.js` script has correctly concatenated these internally generated parts.
3.  Imagine this combined file has been successfully moved to `FINAL_FILE_PATH`.
4.  The content you output must be this final, combined content.
5.  Verify that:
    a.  The `[topicNameInCamelCase]SkillJack` constant is correctly named and filled with substantive, topic-specific content.
    b.  The content strictly adheres to the `ISkillJack` structure *as adapted for the given `[Topic Type]`*.
    c.  **The `ISkillJack` interface definition is NOT included in the output file.**
    d.  Conditional parts/sections (like `codeExamples`, `improvementGuidelines`, `specializedSections`) are ONLY included if appropriate for the `[Topic Type]` and `[Topic to Document]`, and their content is meaningful. If a conditional part was conceptually omitted, it should not appear in the final output.
    e.  Sections like `commonPitfalls` and `applicationProcess` are meaningfully adapted for non-coding topics.
    f.  For non-coding topics, you have actively considered and potentially added specialized categories.
    g.  Examples are concrete and relevant. Agent actions (or their non-coding equivalents) are explicit.
    h.  The TypeScript structure is valid and properly formatted.
    i.  Code examples (if included) are accurate and would compile.

**Final Output:**
Respond ONLY with the complete, COMBINED TypeScript code block for the generated `[topicNameInCamelCase]SkillJack` constant. Ensure it is valid TypeScript. Start the response directly with ```typescript and end it directly with ```. No introductory or concluding text.