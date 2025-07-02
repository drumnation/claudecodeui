# Basic Communication Management Workflow

This document outlines how to use the various communication prompt modules together to create an effective communication management workflow.

## Overview

The communication prompts are organized into functional categories:

1. **Ingestion** - Process incoming communications
2. **Response** - Draft outgoing communications
3. **Analysis** - Understand and summarize communications
4. **Knowledge** - Extract and structure valuable information

## Workflow Stages

### Stage 1: Communication Intake

1. Receive new email or message
2. Determine communication type:
   - For emails: Use `ingestion/ingest-email.prompt.md`
   - For messages: Use `ingestion/ingest-message.prompt.md`
3. The ingestion process will:
   - Extract metadata
   - Save content with proper formatting
   - Process any attachments/images
   - Update communication logs and indexes
   - Extract action items
   - Return a JSON summary

### Stage 2: Knowledge Extraction & Analysis

1. For important communications containing valuable domain knowledge:
   - Use `knowledge/extract-knowledge-snippet.prompt.md` with the processed communication
   - Review and save the extracted knowledge to the knowledge base
   
2. For communication threads that need summarization:
   - Use `analysis/summarize-thread.prompt.md` with the thread content
   - Review and save the summary for future reference

### Stage 3: Response Generation

1. When a response is needed:
   - Use `response/write-email.prompt.md` with:
     - The previous email content or path
     - A clear response goal
     - Any specific points to include
     - Optional writing style guidelines
   - Review the draft response
   - Send the response after appropriate review

2. To maintain consistent communication style:
   - Periodically use `response/learn-writing-style.prompt.md` with good examples
   - Reference the stored style in future email drafting

## Example Usage Sequence

1. **Receive email about network configuration**
   ```
   cat email_content.txt | node bin/run-prompt.js communication/ingestion/ingest-email.prompt.md
   ```

2. **Extract technical knowledge from the email**
   ```
   node bin/run-prompt.js communication/knowledge/extract-knowledge-snippet.prompt.md \
     --source="communications/processed/emails/20230415/01-network-configuration.md" \
     --topic="Network Configuration"
   ```

3. **Draft a response to get clarification**
   ```
   node bin/run-prompt.js communication/response/write-email.prompt.md \
     --previous="communications/processed/emails/20230415/01-network-configuration.md" \
     --goal="Get clarification on firewall specifications" \
     --points="Confirm version requirements, Ask about VPN tunnel requirements"
   ```

## Reminder: File Structure

The communication prompts work with this recommended file structure:

```
communications/
├── assets/          # Images and attachments 
├── index/           # Communication indexes
├── processed/       # Structured communications
├── knowledge-base/  # Extracted domain knowledge
├── summaries/       # Communication thread summaries
└── styles/          # Writing style guides
```

## Future Enhancements

This workflow can be expanded by adding:

1. **Integration prompts** - Connecting with task management systems
2. **Call notes prompts** - Processing verbal communication notes
3. **Notification prompts** - Generating alerts for action items
4. **Sentiment analysis** - Understanding communication tone and urgency

---

**Note**: This is a workflow description document, not an executable prompt. It explains how to use the individual prompt modules together to create an effective communication management system. 