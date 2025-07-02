**ACTION REQUIRED:** Execute the following writing style analysis immediately. Analyze the provided email samples to extract and learn a specific writing style. Output JSON containing the identified style characteristics for use in future email drafting. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Learn Email Writing Style

**Objective:**
Analyze multiple email examples to extract and codify a consistent writing style, which can then be used as a reference for drafting future emails in the same voice and style.

**Input:**

1.  **Email Samples:** [Multiple email samples from the same author whose style should be analyzed and mimicked. Provide at least 2-3 samples for best results.]
2.  **Style Name:** [A descriptive name for this writing style, e.g., "Client Communication Style", "Technical Support Style", "Executive Style"]
3.  **Author Name:** [Name of the person whose style is being analyzed]
4.  **Style Storage Path (Variable):** `[STYLE_PATH]` (Defaults to `./communications/styles/`)

**Instructions:**

1.  **Analyze Greeting Patterns:**
    * Identify common greeting formats and level of formality.
    * Note variations based on recipient type or context.
    * Extract typical opening phrases.
2.  **Identify Paragraph Structure:**
    * Analyze typical paragraph length (short/medium/long).
    * Identify transition patterns between paragraphs.
    * Note how information is sequentially presented.
3.  **Analyze Sentence Construction:**
    * Identify average sentence length and complexity.
    * Note use of active vs. passive voice.
    * Identify common sentence structures or patterns.
4.  **Extract Vocabulary Patterns:**
    * Identify level of formality in word choice.
    * Note industry-specific terminology frequency.
    * Identify "signature phrases" or recurring expressions.
5.  **Analyze Question Formulation:**
    * Identify how questions are typically phrased.
    * Note directness vs. indirectness in requests.
    * Analyze how follow-up questions are structured.
6.  **Identify Closing Patterns:**
    * Extract typical closing phrases.
    * Note signature format and any personalization.
    * Identify level of formality in closing.
7.  **Analyze Overall Tone:**
    * Determine if tone is formal, semiformal, or casual.
    * Identify emotional markers (empathetic, authoritative, friendly, etc.).
    * Note use of humor, idioms, or cultural references.
8.  **Create Style Guide Object:**
    * Compile all observations into a structured JSON object.
    * Include clear guidelines for each writing element.
    * Include specific examples from the source emails.
9.  **Save Style Guide:**
    * Generate a filename from the style name: `[style_name_slug].style.json`.
    * **Action:** Save the Style Guide to `[STYLE_PATH]/[style_name_slug].style.json`.

**Output:**

* Respond ONLY with a single JSON object containing the learned style characteristics.

    ```json
    {
      "styleMetadata": {
        "name": "[Style Name]",
        "author": "[Author Name]",
        "dateCreated": "[Current Date YYYY-MM-DD]",
        "sampleCount": 3,
        "filePath": "[STYLE_PATH]/[style_name_slug].style.json"
      },
      "greetingPatterns": {
        "formalGreetings": ["Dear [Name],", "Good morning [Name],"],
        "casualGreetings": ["Hi [Name],", "Hey [Name],"],
        "defaultGreeting": "Hi [Name],",
        "greetingFormality": "semiformal",
        "examples": ["Hi Jed,", "Good afternoon Ms. Johnson,"]
      },
      "paragraphStructure": {
        "averageLength": "short|medium|long",
        "typicalSentencesPerParagraph": 2,
        "transitionPhrases": ["Additionally,", "However,", "With that in mind,"],
        "informationFlow": "chronological|problem-solution|general-to-specific"
      },
      "sentenceConstruction": {
        "averageLength": "short|medium|long",
        "voicePreference": "activeVoice|passiveVoice|mixed",
        "complexityLevel": "simple|moderate|complex",
        "commonStructures": [
          "I'm writing to...",
          "Could you please...",
          "I'd like to request..."
        ]
      },
      "vocabularyPatterns": {
        "formalityLevel": "formal|semiformal|casual",
        "technicalTermFrequency": "low|medium|high",
        "commonPhrases": [
          "I appreciate your assistance with...",
          "Let me know if you need anything else.",
          "I'll look into this further."
        ],
        "avoidedTerms": []
      },
      "questionFormulation": {
        "directness": "direct|indirect",
        "commonFormats": [
          "Could you please [action]?",
          "I was wondering if you could [action]?",
          "Would it be possible to [action]?"
        ],
        "followUpPatterns": [
          "Also, regarding [topic]...",
          "One more thing about [topic]..."
        ]
      },
      "closingPatterns": {
        "formalClosings": ["Best regards,", "Sincerely,"],
        "casualClosings": ["Thanks,", "Cheers,"],
        "defaultClosing": "Best regards,",
        "signatureFormat": "[Full Name]|[First Name]",
        "includesTitle": true|false
      },
      "overallTone": {
        "formality": "formal|semiformal|casual",
        "emotionalTone": ["professional", "friendly", "authoritative"],
        "usesHumor": true|false,
        "usesCulturalReferences": true|false,
        "emphasizesRelationship": true|false
      },
      "structuralPreferences": {
        "usesBulletPoints": true|false,
        "usesNumberedLists": true|false,
        "includesGreeting": true|false,
        "includesContextRecap": true|false,
        "formatsPriorities": true|false
      }
    }
    ```

**Crucial Instructions for AI:**
* **ACTION REQUIRED:** Execute NOW.
* **Input Source:** Analyze email samples provided after this prompt.
* **Output Format:** Strictly output ONLY the specified JSON object with the learned style characteristics.
* **Thoroughness:** Be thorough in analyzing and extracting style patterns.
* **Examples:** Include specific examples from the source emails to illustrate each pattern.

---
**(END OF PROMPT FILE CONTENT - Email Samples expected immediately after this line)** 