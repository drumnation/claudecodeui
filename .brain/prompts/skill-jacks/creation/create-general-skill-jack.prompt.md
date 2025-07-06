**ACTION REQUIRED:** Execute the following skill-jack file generation task immediately. Use the provided `[Topic to Document]` and `[Topic Type]` (e.g., 'Coding', 'Psychology', 'Parenting', 'SocialDynamics') to generate a comprehensive, structured skill-jack rule file in TypeScript format, following the detailed template and requirements below. Output ONLY the generated TypeScript code block. Do not describe this prompt; execute the steps within it.

  

# Prompt for AI: Generate Structured Skill-Jack File

  

🤖 Generate a comprehensive skill-jack rule file on the topic of: **[Topic to Document]** (Type: **[Topic Type]**)

  

This file must serve as a foundational resource to equip an AI agent with deep understanding and practical application capabilities for this concept. It will be used within a multi-agent system.

  

---

  

## Step 0: File Organization and Structure

  

Create a TypeScript file with the naming convention `[topic-name-kebab-case].skill-jack.ts` (e.g., `darvo.skill-jack.ts`, `typescript-debugging.skill-jack.ts`). This file should export a **single constant** named `[topicNameInCamelCase]SkillJack` (e.g., `darvoSkillJack`, `typescriptDebuggingSkillJack`) which conforms to the `ISkillJack` interface structure (defined below for reference, but **DO NOT include the interface definition in the final output file**).

  

## Step 1: Skill-Jack Constant Template

  

The exported constant in your generated file should follow this structure. Adapt content and conditionally include/exclude sections based on the `[Topic Type]`.

  

```typescript

/**

* Skill-Jack: [Title Case Topic]

*

* [1-sentence explanation of what this skill-jack file is for, tailored to the topic and its type]

*

* @module brain-garden/skill-jack

* @category [appropriate category for this skill-jack - e.g., 'coding-patterns', 'psychological-concepts', 'parenting-strategies', 'social-dynamics']

*/

  

// DO NOT include the ISkillJack interface definition in this file.

// Ensure the constant below strictly adheres to the ISkillJack structure,

// conditionally applying sections based on the [Topic Type].

  

/**

* Skill-Jack on [Topic]

*

* This constant provides comprehensive guidance on understanding and applying/recognizing

* [Topic] in the context of [relevant application domain or context, e.g., software development, interpersonal relationships, child rearing].

*/

export const [topicNameInCamelCase]SkillJack = {

topic: "...", // string: [Topic to Document]

topicType: "...", // string: [Topic Type] (e.g., 'Coding', 'Psychology', 'Parenting', 'SocialDynamics')

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

...(true /* Replace with condition: [Topic Type] === 'Coding' */ ? { codeExamples: [

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

...(true /* Replace with logic based on [Topic Type] */ ? { improvementGuidelines: {

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

// Examples:

// psychologicalImpacts (for topics like DARVO): [{ name: "...", description: "...", copingMechanisms: ["..."] }]

// keyTheories (for Psychology topics): [{ name: "...", proponents: ["..."], coreTenets: "..." }]

// societalImpact (for SocialDynamics): { description: "...", positiveAspects: ["..."], negativeAspects: ["..."] }

// ethicalConsiderations (for various non-coding): [{ consideration: "...", implications: "...", recommendations: ["..."] }]

// developmentalAspects (for Parenting): [{ stage: "...", characteristics: "...", parentingFocus: ["..."] }]

// Add such sections based on deep relevance to the [Topic to Document]. For example:

// ...( '[Topic Type]' === 'Psychology' && '[Topic to Document]' === 'Cognitive Dissonance' ? { cognitiveBiasesRelated: [ { name: "Confirmation Bias", description: "..." } ] } : {}),

// ...( '[Topic Type]' === 'SocialDynamics' && '[Topic to Document]' === 'DARVO' ? { perpetratorMotivations: [ { motivation: "...", indicators: ["..."] } ] } : {}),

  

resources: [ // optional array of objects

{

type: "documentation", // 'documentation' | 'academic_paper' | 'book' | 'tutorial' | 'reference' | 'tool' | 'article' | 'support_group'

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

  

For your reference when building the `[topicNameInCamelCase]SkillJack` constant, here is a conceptual `ISkillJack` interface structure. Your final output file must NOT contain this interface definition. The actual generated object should conditionally include/exclude fields based on `[Topic Type]` and potentially add new ones as per the meta-instructions.

  

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

  

## Step 3: Core Requirements

  

When generating the skill-jack file, adhere to these requirements:

  

1. **Comprehensiveness & Topic-Type Relevance**: Content must be detailed and highly relevant to the `[Topic to Document]` and its `[Topic Type]`. An agent should be able to understand and correctly apply/recognize it.

2. **Clarity**: All explanations should be unambiguous and directly applicable or understandable within the topic's domain.

3. **Accuracy**: Information must be accurate and reflect established knowledge or best practices for the given topic.

4. **Specificity**: Avoid vague statements; include concrete examples, steps, indicators, and metrics suitable for the topic.

5. **Independence**: The file should be a complete resource on the topic.

6. **Temporal Context**: Where applicable, include information about the evolution of understanding or application of the topic.

7. **Verifiability/Recognizability**: Include objective ways to verify correct implementation (for coding) or recognize manifestations (for non-coding topics).

  

## Step 4: Important Considerations for Content Generation

  

- **Topic, TopicType & Description**: Clearly define the scope, importance, and nature of the topic according to its type.

- **Core Principles**: Include 3-7 foundational concepts. For non-coding, these might be underlying assumptions, key insights, or fundamental truths.

- **Application Process / Behavioral Manifestations**: Detail sequential steps for coding, or stages/patterns of behavior/interaction for non-coding topics. `agentActions` should become relevant actions, observable behaviors, or communication strategies.

- **Examples**: Include diverse scenarios. For non-coding, "implementation" might be "manifestation," "interaction breakdown," or "observed pattern."

- **Code Examples (Conditional)**: If `[Topic Type]` is 'Coding', ensure examples are practical, well-documented, and follow best practices. Omit entirely if not a coding topic.

- **Common Pitfalls / Warning Signs / Challenges**: Tailor this section heavily.

- For `Coding`: Address typical misunderstandings and implementation errors, with technical solutions.

- For `Psychology` (e.g., DARVO): Focus on "Warning Signs," "Manipulative Tactics," "Misinterpretations," and "Impact on Victim," with "Counter Strategies" or "Protective Measures."

- For `Parenting`: Focus on "Common Challenges," "Misconceptions," with "Constructive Approaches" or "Supportive Responses."

- **Improvement Guidelines (Conditional & Adaptable)**:

- For `Coding`: Provide concrete ways to measure and enhance implementations.

- For non-coding: Focus on deepening understanding, self-reflection, recognizing patterns more effectively, or improving relational outcomes. Metrics might be qualitative.

- **Meta-Instruction for Adding Specialized Categories (Non-Coding Topics)**:

- **Crucial Step**: Before finalizing, evaluate if the `[Topic to Document]` (if non-coding) would benefit from additional, specialized sections not explicitly listed in the main template (e.g., `psychologicalImpacts` for DARVO, `keyTheories` for a psychological concept, `developmentalStages` for a parenting topic).

- Refer to the examples in the `ISkillJack` reference and within the template's meta-instruction comments.

- If adding such sections, define them as new top-level keys in the exported constant. Ensure they are structured meaningfully (e.g., an array of objects with `name` and `description` fields, or a more complex object if needed).

- **The goal is to make the skill-jack maximally informative and useful for the specific non-coding domain.**

- **Resources**: Include reputable, current sources. For non-coding, this might include academic papers, seminal books, reputable organizations, or support resources.

- **Conclusion**: Summarize key takeaways and contextual considerations, including potential ethical implications or broader societal relevance for non-coding topics.

  

## Step 5: Enhanced Guidelines for Superior Quality

  

1. **Depth Without Overwhelm**: Balance comprehensive coverage with usability.

2. **Progressive Disclosure**: Organize information logically.

3. **First Principles Integration**: Connect guidelines/observations to fundamental principles.

4. **Decision Frameworks / Recognition Patterns**: Include criteria for application (coding) or identification/response (non-coding).

5. **Edge Case Handling / Nuances**: Address unusual situations or subtle variations.

6. **Balanced Perspective**: Acknowledge complexities, trade-offs, or differing viewpoints, especially for non-coding topics.

7. **Future Adaptation / Evolving Understanding**: Indicate areas where approaches or understanding might evolve.

8. **Problem-Solving / Critical Thinking Prompts**: Include guidance for common issues (coding) or prompts for deeper reflection (non-coding).

  

---

  

## Validation Reminder

  

Before completing your output, verify that:

  

1. The `[topicNameInCamelCase]SkillJack` constant is correctly named and filled with substantive, topic-specific content.

2. The content strictly adheres to the `ISkillJack` structure *as adapted for the given `[Topic Type]`*.

3. **The `ISkillJack` interface definition is NOT included in the output file.**

4. Conditional sections (like `codeExamples`) are ONLY included if appropriate for the `[Topic Type]`.

5. Sections like `commonPitfalls` and `applicationProcess` are meaningfully adapted for non-coding topics.

6. For non-coding topics, you have actively considered and potentially added specialized categories as per the meta-instructions.

7. Examples are concrete and relevant. Agent actions (or their non-coding equivalents) are explicit.

8. The TypeScript structure is valid and properly formatted.

9. Code examples (if included) are accurate and would compile.

  

**Final Output:**

Respond ONLY with the complete TypeScript code block for the generated `[topicNameInCamelCase]SkillJack` constant. Ensure it is valid TypeScript. Start the response directly with ```typescript and end it directly with```. No introductory or concluding text.