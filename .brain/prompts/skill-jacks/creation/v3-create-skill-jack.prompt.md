**ACTION REQUIRED: ADHERENCE TO PROVIDED FILE PATHS FOR CONTENT GENERATION IS MANDATORY.**

**CONTEXT:**
A preliminary script has created a set of empty part files for the skill jack. You will be provided with a list of paths to these files (`[ListOfPartFilePaths]`). Your task is to internally generate the appropriate content for each file path in the provided list, sequentially. This structured approach is critical to prevent system timeouts.

**TASK:**
Execute the skill-jack file generation task. Use the provided `[Topic to Document]`, `[Topic Type]`, `[TargetScope]`, and importantly, the `[ListOfPartFilePaths]` to produce a comprehensive, structured skill-jack rule file in TypeScript format.

**OUTPUT REQUIREMENT:**
Output ONLY the generated TypeScript code block. This block must be the result of internally generating content corresponding to each file path in `[ListOfPartFilePaths]` and then assembling this content into a single, valid TypeScript constant.

---

# Prompt for AI: Generate Structured Skill-Jack File

🤖 Generate a comprehensive skill-jack rule file on the topic of: **[Topic to Document]** (Type: **[Topic Type]**) (Scope: **[TargetScope]**)

**Pre-created Part File Paths:** `[ListOfPartFilePaths]` (This will be a JSON array of strings, e.g., `["/path/to/00-header.ts.part", "/path/to/01-metadata.ts.part", ...]` )

This file must serve as a foundational resource to equip an AI agent with deep understanding and practical application capabilities for this concept. It will be used within a multi-agent system.

---

## Step 0: Define Names, Final Paths, and Overall Workflow Context

1.  **Input Parameters (Provided with the request):**
    * `[Topic to Document]`
    * `[Topic Type]` (e.g., 'Coding', 'Psychology', 'Parenting', 'SocialDynamics')
    * `[TargetScope]` (e.g., "universal" or "agent:my-expert-agent")
    * `[ListOfPartFilePaths]` (JSON array of strings to pre-created empty part files, provided by the orchestrating system after running `pre-generate-skill-jack-parts.js`)

2.  **Derive Names:**
    * Topic Kebab Case: `[topic-name-kebab-case]` (derived from `[Topic to Document]`)
    * Final Output Filename: `[topic-name-kebab-case].skill-jack.ts`
    * CamelCase Constant Name: `[topicNameInCamelCase]SkillJack` (derived from `[Topic to Document]`)

3.  **Conceptual File System Workflow (Context for this generation strategy):**
    * The paths in `[ListOfPartFilePaths]` point to initially empty files in a temporary job directory (`TEMP_JOB_DIR`, e.g., `.brain/skill-jacks/temp-skill-jack-parts/[topic-name-kebab-case]/`). You will be populating these conceptually by generating content for each path.
    * After you provide the final combined content, a script (`node .brain/scripts/combine-skill-jack-parts.js ${TEMP_JOB_DIR} ${TEMP_JOB_DIR}${Final Output Filename}`) would (in a real scenario where file system operations are performed) write your generated content chunks to these pre-created files (if they weren't just placeholders for your internal generation) and then combine them, or simply use your final assembled output. For *this interaction*, your final single output block is what matters.
    * The final file path (`FINAL_FILE_PATH`) would be determined based on `[TargetScope]` and a chosen subfolder (e.g., `FINAL_DESTINATION_DIR = .brain/skill-jacks/[chosen-subfolder]/`). The agent needs to select an appropriate `[chosen-subfolder]` based on the topic and type for the `@category` JSDoc tag and for the conceptual final placement.
    * The combined file would be moved: `mv ${TEMP_JOB_DIR}${Final Output Filename} ${FINAL_FILE_PATH}`.
    * Cleanup: `rm -rf ${TEMP_JOB_DIR}`.
    * **Your immediate task is to internally generate content for each path in `[ListOfPartFilePaths]` and then assemble it into one final string for output.**

## Step 0.5: MANDATORY Content Generation per Provided File Path

Your internal process *must* iterate through the `[ListOfPartFilePaths]` (provided as input). For each `filePath` in this list, you will determine the type of content it corresponds to (based on its name, e.g., "00-header.ts.part", "01-metadata.ts.part") and generate that content.

**Content Generation Algorithm by File Path:**

For each `filePath` in `[ListOfPartFilePaths]`:

1.  **Identify Part Type:** Determine which skill jack part the `filePath` represents (e.g., by looking at "00-header", "01-metadata" in the filename).
2.  **Generate Content for this Path:** Create the specific content string for this part.
    * If the part is conditional (e.g., a file path corresponding to "05-codeExamples.ts.part", "07-improvementGuidelines.ts.part", "08-specializedSections.ts.part") and you determine it's not applicable for the current `[Topic to Document]` or `[Topic Type]`, then the content for this `filePath` should be an empty string (`""`). This signals that this part contributes nothing to the final assembled object.
    * The content for each part must be raw JavaScript/TypeScript code snippets as specified below, not wrapped in markdown code blocks (unless markdown is part of a string value).

**Content Definitions (map these to the identified part type from the filePath):**

* **For the path ending in "00-header.ts.part":**
    * Content: File-level JSDoc, constant's JSDoc, and start of the constant declaration.
        ```typescript
        /**
         * Skill-Jack: [Title Case Topic]
         *
         * [1-sentence explanation of what this skill-jack file is for, tailored to the topic and its type]
         *
         * @module brain-garden/skill-jack
         * @category [appropriate category for this skill-jack - e.g., value of chosen-subfolder from Step 0, like 'coding-patterns' or 'psychological-concepts']
         */

        /**
         * Skill-Jack on [Topic to Document]
         *
         * This constant provides comprehensive guidance on understanding and applying/recognizing
         * [Topic to Document] in the context of [relevant application domain or context, e.g., software development, interpersonal relationships, child rearing].
         */
        export const [topicNameInCamelCase]SkillJack = {
        ```
* **For the path ending in "01-metadata.ts.part":**
    * Content: `topic`, `topicType`, `description` properties, with a trailing comma.
        ```typescript
        topic: "[Topic to Document]",
        topicType: "[Topic Type]",
        description: "[Detailed, comprehensive description of the topic and its relevance. This should be several sentences or paragraphs as appropriate to fully explain the topic's scope and importance.]",
        ```
* **For the path ending in "02-corePrinciples.ts.part":**
    * Content: `corePrinciples` array, filled with 3-7 detailed principles, with a trailing comma.
        ```typescript
        corePrinciples: [
          {
            name: "[Principle 1 Name]",
            description: "[Detailed description of Principle 1, explaining its significance and core idea.]",
            examples: ["[Clear, concise example 1.1 illustrating the principle]", "[Clear, concise example 1.2 illustrating the principle]"],
          },
          // ... (typically 2 to 6 more detailed principles)
        ],
        ```
* **For the path ending in "03-applicationProcess.ts.part":**
    * Content: `applicationProcess` object (or `behavioralPattern`, `interactionDynamics`, `identificationProcess` etc., for non-coding topics), filled comprehensively with description and steps, with a trailing comma. Each step should have detailed agent actions (or non-coding equivalents like `observedBehaviors`).
        ```typescript
        applicationProcess: { // Or equivalent name for non-coding
          description: "[Overview of how to apply the skill or how the concept manifests in practice.]",
          steps: [
            {
              name: "[Step 1 Name/Stage 1 Title]",
              description: "[Detailed description of what happens in Step 1/Stage 1.]",
              agentActions: [ // Or observedBehaviors, communicationStrategies, etc.
                { action: "[Specific action/behavior 1.1]", explanation: "[Rationale or meaning of action/behavior 1.1]" },
                { action: "[Specific action/behavior 1.2]", explanation: "[Rationale or meaning of action/behavior 1.2]" },
                // ... more actions/behaviors for this step
              ],
            },
            // ... (more detailed steps/stages)
          ],
        },
        ```
* **For the path ending in "04-examples.ts.part":**
    * Content: `examples` object, filled with description and diverse, detailed use cases, with a trailing comma.
        ```typescript
        examples: {
          description: "[Explanation of how these use cases or examples illustrate the practical application or manifestation of the topic.]",
          useCases: [
            {
              scenario: "[Specific, illustrative Scenario 1 demonstrating the topic in context.]",
              implementation: "[Detailed explanation of how the topic is applied or observed in Scenario 1. For non-coding topics, this could be 'manifestationDetails', 'exampleDialogue', or 'observedOutcome'.]",
              outcome: "[The result, consequence, or learning from Scenario 1.]",
            },
            // ... (more diverse and detailed use cases)
          ],
        },
        ```
* **For the path ending in "05-codeExamples.ts.part" (Conditional Content):**
    * If `[Topic Type]` is 'Coding' or highly technical: `codeExamples` array, filled with practical, well-documented code examples, with a trailing comma.
        ```typescript
        codeExamples: [
          {
            language: "typescript", // or other relevant language
            description: "[Description of what this code example demonstrates.]",
            code: `// Relevant code snippet
        function exampleFunction() {
          // ... code ...
        }`,
            explanation: "[Detailed explanation of the code, its purpose, and key aspects.]",
          },
          // ... (more code examples if applicable)
        ],
        ```
    * Else (if not a coding/technical topic): Content for this path is an empty string `""`.
* **For the path ending in "06-commonPitfalls.ts.part":**
    * Content: `commonPitfalls` array (or `warningSigns`, `commonChallenges` etc., for non-coding topics), filled comprehensively with name, description, solution/counterStrategy, and preventativeMeasures/awarenessTips, with a trailing comma.
        ```typescript
        commonPitfalls: [
          {
            name: "[Pitfall/Warning Sign/Challenge 1 Name]",
            description: "[Detailed description of how this pitfall/sign/challenge manifests or what it entails.]",
            solution: "[Practical solution, counter-strategy, or mitigation approach for addressing this.]",
            preventativeMeasures: ["[Specific preventative measure or awareness tip 1.1]", "[Specific preventative measure or awareness tip 1.2]"],
          },
          // ... (more common pitfalls/signs/challenges)
        ],
        ```
* **For the path ending in "07-improvementGuidelines.ts.part" (Conditional Content):**
    * If applicable to `[Topic Type]` (e.g., for skill development, process refinement, or deepening understanding): `improvementGuidelines` object, filled with description and detailed metrics/reflection areas, with a trailing comma.
        ```typescript
        improvementGuidelines: {
          description: "[Explanation of how to improve understanding, application, or effectiveness related to the topic.]",
          metrics: [ // Or reflectionPrompts, observationalCues for non-coding
            {
              name: "[Metric/Guideline Area 1 Name]",
              description: "[Detailed description of this metric or area for improvement.]",
              assessmentMethod: "[How to assess this metric, or a specific reflection prompt/observational cue.]",
            },
            // ... (more metrics/guidelines)
          ],
        },
        ```
    * Else: Content for this path is an empty string `""`.
* **For the path ending in "08-specializedSections.ts.part" (Conditional Content):**
    * If applicable for non-coding `[Topic to Document]`/`[Topic Type]` (refer to META-INSTRUCTION in Step 1's template to decide if sections like `psychologicalImpacts`, `keyTheories`, `societalImpact`, `ethicalConsiderations`, `developmentalAspects` are relevant): One or more specialized section properties, each filled with detailed content, each with a trailing comma (if multiple properties are defined here, the last one defined *within this part's content string* will have a comma).
        ```typescript
        // Example if psychologicalImpacts and keyTheories are relevant:
        // psychologicalImpacts: [
        //   { name: "[Impact 1]", description: "[Description of Impact 1]", copingMechanisms: ["[Mechanism 1.1]"] },
        //   // ... more impacts
        // ],
        // keyTheories: [
        //   { name: "[Theory 1]", proponents: ["[Proponent A]", "[Proponent B]"], coreTenets: "[Core tenets of Theory 1]" },
        //   // ... more theories
        // ],
        ```
    * Else (if no specialized sections are deemed necessary): Content for this path is an empty string `""`.
* **For the path ending in "09-resources.ts.part":**
    * Content: `resources` array, filled with reputable, current sources, with a trailing comma.
        ```typescript
        resources: [
          {
            type: "documentation", // E.g., 'academic_paper', 'book', 'tutorial', 'reference', 'tool', 'article', 'support_group', 'video'
            name: "[Resource 1 Name]",
            description: "[Brief description of what the resource offers or covers.]",
            link: "[https://stackoverflow.com/questions/32616582/extract-all-urls-that-start-with-http-or-https-and-end-with-html-from-text-file](https://stackoverflow.com/questions/32616582/extract-all-urls-that-start-with-http-or-https-and-end-with-html-from-text-file)",
            authorInstitution: "[Author or Institution if known, e.g., 'OpenAI', 'Stanford University']",
          },
          // ... (more resources)
        ],
        ```
* **For the path ending in "10-conclusion.ts.part":**
    * Content: `conclusion` string property. **This part's content string should NOT end with a comma if it's the last actual property being defined before the footer.**
        ```typescript
        conclusion: "[Comprehensive conclusion statement, summarizing key takeaways, broader implications, or considerations for future development/understanding related to the topic.]"
        ```
* **For the path ending in "99-footer.ts.part":**
    * Content: Closing brace and semicolon.
        ```typescript
        };
        ```

**Internal Assembly for Final Output:**
After conceptually generating the content string for *each* file path in `[ListOfPartFilePaths]`, you will assemble these strings in order to form the single TypeScript code block for your response.
* Concatenate the content strings. If a content string for a path is an empty string `""` (because the conditional part was not applicable), it adds nothing to the assembly.
* **Comma Management During Assembly:** This is crucial for a valid JavaScript object.
    * The content generated for "00-header.ts.part" and "99-footer.ts.part" are structural and don't involve property commas themselves.
    * For content generated for parts "01" through "09": If a part generates content (i.e., not an empty string), and it is defining one or more object properties, that entire block of properties should end with a comma *if it is followed by another part that also generates content (properties)*.
    * The content generated for the *last actual property-defining part* before "10-conclusion.ts.part" must end with a comma.
    * The content generated for "10-conclusion.ts.part" (the `conclusion` property itself) must *not* end with a comma.
    * Essentially, your final assembled string for the object literal `{...}` must have commas correctly separating properties, with no trailing comma after the last property. If, for example, `08-specializedSections.ts.part` is empty, and `09-resources.ts.part` has content, then the content from `09-resources.ts.part` needs a trailing comma (as it's followed by `10-conclusion.ts.part`). If `09-resources.ts.part` was also empty, then `07-improvementGuidelines.ts.part` (if it had content) would need the trailing comma, and so on. The content from "10-conclusion.ts.part" is the only property-defining part that should reliably not have a comma at the end of its generated string.
    * Your final assembled string must be a valid TypeScript object literal.

## Step 1: Skill-Jack Constant Template (Reference for Content Structure)

The structure below shows the complete skill jack. Your task is to generate content for the provided file paths such that, when assembled, they form this complete structure. The comments indicate which part path typically generates which section.

```typescript
/**
 * Skill-Jack: [Title Case Topic]
 *
 * [1-sentence explanation of what this skill-jack file is for, tailored to the topic and its type]
 *
 * @module brain-garden/skill-jack
 * @category [appropriate category for this skill-jack - e.g., value of chosen-subfolder from Step 0]
 */
// Above is from content for "00-header.ts.part" path

// DO NOT include the ISkillJack interface definition in this file.
// Ensure the constant below strictly adheres to the ISkillJack structure,
// conditionally applying sections based on the [Topic Type].

/**
 * Skill-Jack on [Topic to Document]
 *
 * This constant provides comprehensive guidance on understanding and applying/recognizing
 * [Topic to Document] in the context of [relevant application domain or context, e.g., software development, interpersonal relationships, child rearing].
 */
// Above is also from content for "00-header.ts.part" path
export const [topicNameInCamelCase]SkillJack = { // export const ... { is from "00-header.ts.part"
  topic: "...", // string: [Topic to Document] // From content for "01-metadata.ts.part" path
  topicType: "...", // string: [Topic Type] // From content for "01-metadata.ts.part" path
  description: "...", // string: Detailed description of the topic and its relevance. // From content for "01-metadata.ts.part" path
  corePrinciples: [ // array of objects: Fundamental ideas or tenets. // From content for "02-corePrinciples.ts.part" path
    {
      name: "...", // string
      description: "...", // string
      examples: ["...", "..."], // optional array of strings: Illustrative examples of the principle in action.
    },
    // ... more principles
  ],
  // SECTION: Application Process / Behavioral Manifestations // From content for "03-applicationProcess.ts.part" path
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
  examples: { // object // From content for "04-examples.ts.part" path
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
  // CONDITIONAL SECTION: Include 'codeExamples' only if [Topic Type] is 'Coding' or highly technical. // From content for "05-codeExamples.ts.part" path (if applicable)
  ...( '[Topic Type]' === 'Coding' /* Evaluate this condition */ ? { codeExamples: [
    {
      language: "...", // string (e.g., 'typescript', 'python')
      description: "...", // string
      code: "...", // string containing formatted code
      explanation: "...", // string
    },
    // ... more code examples
  ]} : {}),
  // SECTION: Common Pitfalls / Warning Signs / Common Challenges // From content for "06-commonPitfalls.ts.part" path
  // Adapt 'name', 'description', 'solution', 'preventativeMeasures' based on [Topic Type].
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
  // CONDITIONAL SECTION: 'improvementGuidelines' // From content for "07-improvementGuidelines.ts.part" path (if applicable)
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

  // META-INSTRUCTION & CONTENT: For non-coding [Topic Type] like 'Psychology', 'SocialDynamics', 'Parenting', // From content for "08-specializedSections.ts.part" path (if applicable)
  // consider adding specialized sections here if applicable. These sections should be new top-level
  // keys in the main object, following a similar structure (object or array of objects with name/description).
  // Examples:
  // psychologicalImpacts (for topics like DARVO): [{ name: "...", description: "...", copingMechanisms: ["..."] }]
  // keyTheories (for Psychology topics): [{ name: "...", proponents: ["..."], coreTenets: "..." }]
  // Add such sections based on deep relevance to the [Topic to Document]. For example:
  // ...( '[Topic Type]' === 'Psychology' && '[Topic to Document]' === 'Cognitive Dissonance' ? { cognitiveBiasesRelated: [ { name: "Confirmation Bias", description: "..." } ] } : {}),

  resources: [ // optional array of objects // From content for "09-resources.ts.part" path
    {
      type: "documentation", // 'documentation' | 'academic_paper' | 'book' | 'tutorial' | 'reference' | 'tool' | 'article' | 'support_group' | 'video'
      name: "...", // string
      description: "...", // string
      link: "...", // optional string (URL)
      authorInstitution: "...", // optional string
    },
    // ... more resources
  ],
  conclusion: "...", // string: Summary of key takeaways and broader implications or considerations. // From content for "10-conclusion.ts.part" path
}; // From content for "99-footer.ts.part" path
```

## Step 2: Reference Interface (DO NOT INCLUDE IN OUTPUT)

For your reference when building the content for each part path, here is a conceptual `ISkillJack` interface structure. Your final output file (the assembled content) must NOT contain this interface definition.

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
  // Dynamically added sections based on meta-instructions and topic type:
  // e.g., psychologicalImpacts?: IPsychologicalImpact[];
  // e.g., keyTheories?: IKeyTheory[];
  // e.g., perpetratorMotivations?: { motivation: string; indicators: string[]; }[]; // for DARVO
  // etc.
  resources?: IResource[];
  conclusion: string;
}
// END OF REFERENCE INTERFACE
```

## Step 3: Core Requirements for Content Generated for Each Path

When generating the content for each `filePath` from `[ListOfPartFilePaths]`, ensure the resulting combined skill-jack adheres to these requirements:

1.  **Comprehensiveness & Topic-Type Relevance**: Content must be detailed and highly relevant to the `[Topic to Document]` and its `[Topic Type]`. An agent should be able to understand and correctly apply/recognize it.
2.  **Clarity**: All explanations should be unambiguous and directly applicable or understandable within the topic's domain.
3.  **Accuracy**: Information must be accurate and reflect established knowledge or best practices for the given topic.
4.  **Specificity**: Avoid vague statements; include concrete examples, steps, indicators, and metrics suitable for the topic.
5.  **Independence**: The file should be a complete resource on the topic.
6.  **Temporal Context**: Where applicable, include information about the evolution of understanding or application of the topic.
7.  **Verifiability/Recognizability**: Include objective ways to verify correct implementation (for coding) or recognize manifestations (for non-coding topics).

## Step 4: Important Considerations for Generating Content for Each Path

When generating the content corresponding to each `filePath` from `[ListOfPartFilePaths]`:

-   **Content for "01-metadata.ts.part" path**: Clearly define the scope, importance, and nature of the topic according to its type.
-   **Content for "02-corePrinciples.ts.part" path**: Include 3-7 foundational concepts. For non-coding, these might be underlying assumptions, key insights, or fundamental truths.
-   **Content for "03-applicationProcess.ts.part" path**: Detail sequential steps for coding, or stages/patterns of behavior/interaction for non-coding topics. `agentActions` should become relevant actions, observable behaviors, or communication strategies.
-   **Content for "04-examples.ts.part" path**: Include diverse scenarios. For non-coding, "implementation" might be "manifestation," "interaction breakdown," or "observed pattern."
-   **Content for "05-codeExamples.ts.part" path (Conditional)**: If `[Topic Type]` is 'Coding', ensure examples are practical, well-documented, and follow best practices. If not, the content for this path is an empty string.
-   **Content for "06-commonPitfalls.ts.part" path**: Tailor this section heavily.
    * For `Coding`: Address typical misunderstandings and implementation errors, with technical solutions.
    * For `Psychology` (e.g., DARVO): Focus on "Warning Signs," "Manipulative Tactics," "Misinterpretations," and "Impact on Victim," with "Counter Strategies" or "Protective Measures."
    * For `Parenting`: Focus on "Common Challenges," "Misconceptions," with "Constructive Approaches" or "Supportive Responses."
-   **Content for "07-improvementGuidelines.ts.part" path (Conditional & Adaptable)**:
    * For `Coding`: Provide concrete ways to measure and enhance implementations.
    * For non-coding: Focus on deepening understanding, self-reflection, recognizing patterns more effectively, or improving relational outcomes. Metrics might be qualitative. If not applicable, content for this path is an empty string.
-   **Content for "08-specializedSections.ts.part" path (META-INSTRUCTION for Non-Coding Topics)**:
    * **Crucial Decision**: Evaluate if the `[Topic to Document]` (if non-coding) would benefit from additional, specialized sections (e.g., `psychologicalImpacts` for DARVO, `keyTheories` for a psychological concept).
    * Refer to examples in Step 1 template and Step 2 Reference Interface.
    * If adding such sections, their definitions form the content for this path. Ensure they are structured meaningfully as new top-level keys in the object.
    * If no specialized sections are relevant, content for this path is an empty string.
-   **Content for "09-resources.ts.part" path**: Include reputable, current sources. For non-coding, this might include academic papers, seminal books, reputable organizations, or support resources.
-   **Content for "10-conclusion.ts.part" path**: Summarize key takeaways and contextual considerations, including potential ethical implications or broader societal relevance for non-coding topics.

## Step 5: Enhanced Guidelines for Superior Quality of Content for Paths

Apply these guidelines to the content you generate for each `filePath`:
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

Before providing your single, combined output:

1.  **CRITICAL PROCESS VALIDATION:** Confirm that your internal content generation strictly processed each `filePath` from `[ListOfPartFilePaths]` sequentially, generating content (or an empty string `""` for non-applicable conditional parts) for each. The final output must be an assembly of this sequentially generated content.
2.  **Assembly and Comma Validation:** The content you output must be the correct assembly of all generated part strings. Crucially, ensure that JavaScript object property definitions are correctly separated by commas, and there is NO trailing comma after the LAST property in the main object (typically the `conclusion` property, or the last actual content-bearing property before it if `conclusion` itself were somehow omitted). If content for a conditional `filePath` was an empty string, it should be seamlessly omitted from the final assembled object structure or handled such that no invalid syntax (like `propertyName: ,` or a hanging comma before a `}`) occurs.
3.  Ensure all other validation points are met:
    a.  The `[topicNameInCamelCase]SkillJack` constant is correctly named and filled with substantive, topic-specific content.
    b.  The content strictly adheres to the `ISkillJack` structure *as adapted for the given `[Topic Type]`*.
    c.  **The `ISkillJack` interface definition is NOT included in the output file.**
    d.  Conditional sections (resulting from processing conditional part file paths) are ONLY included if appropriate and their content is meaningful. If content for a conditional part path was an empty string, that section should not appear or be an empty valid structure in the final output.
    e.  Sections like `commonPitfalls` and `applicationProcess` are meaningfully adapted for non-coding topics.
    f.  For non-coding topics, you have actively considered and potentially added specialized categories via the content for the "08-specializedSections.ts.part" path.
    g.  Examples are concrete and relevant. Agent actions (or their non-coding equivalents) are explicit.
    h.  The TypeScript structure is valid and properly formatted.
    i.  Code examples (if included from content for "05-codeExamples.ts.part" path) are accurate and would compile.

**Final Output:**
Respond ONLY with the complete, COMBINED TypeScript code block for the generated `[topicNameInCamelCase]SkillJack` constant (which is the assembly of content generated for each path in `[ListOfPartFilePaths]`, correctly handling empty content for non-applicable conditional parts and ensuring valid comma placement to form a valid object literal). Ensure it is valid TypeScript. Start the response directly with ```typescript and end it directly with ```. No introductory or concluding text.