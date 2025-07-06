# Email Image Processing Workflow

This document outlines a workflow for extracting text and structure from email images/attachments and incorporating them into the communication management system.

## Overview

When emails contain images with important information (screenshots, diagrams, terminal output, etc.), this workflow helps extract the content into machine-readable Markdown format for better knowledge management and searchability.

## Workflow Steps

### 1. Image Identification and Extraction

1. During email ingestion (via `communication/ingestion/ingest-email.prompt.md`):
   - Identify images that contain textual or structural information
   - Save images to the asset directory as normal

2. For each relevant image:
   - Determine if image contains important textual content that should be extracted

### 2. Text & Structure Extraction

1. Use the `utilities/extract-text-from-image.prompt.md` prompt:
   ```
   node bin/run-prompt.js utilities/extract-text-from-image.prompt.md [image_path] [optional_context]
   ```

2. The extraction process will:
   - Analyze the image for text and structure
   - Convert all textual content to properly formatted Markdown
   - Preserve structural elements like tables, lists, UI components, etc.
   - Return only the extracted Markdown content

### 3. Content Integration

1. Save the extracted text:
   - Create a new Markdown file with the extracted content
   - Suggested filename: `[same_base_name_as_image].md`
   - Suggested location: Same asset directory as the original image
   
2. Update the email document:
   - Add reference to the extracted text file below the image reference
   - Example format:
     ```markdown
     ![Image Description](../assets/YYYY-MM-DD/image-filename.png)
     [📄 Extracted Text](../assets/YYYY-MM-DD/image-filename.md)
     ```

3. Update asset index:
   - Add entry for the extracted text file in `[COMM_ROOT]/index/asset.index.md`
   - Link it to the original image for reference

## Example Usage

For an email with a screenshot of firewall rules:

1. **Extract text from image:**
   ```
   node bin/run-prompt.js utilities/extract-text-from-image.prompt.md \
     communications/assets/20230415/firewall-rules-screenshot.png \
     "Firewall rule table from pfSense" > communications/assets/20230415/firewall-rules-screenshot.md
   ```

2. **Update email content:**
   ```markdown
   As you can see in the screenshot below, there are several firewall rules that need to be modified:

   ![Firewall Rules Screenshot](../assets/20230415/firewall-rules-screenshot.png)
   [📄 Extracted Firewall Rules Table](../assets/20230415/firewall-rules-screenshot.md)
   ```

## Workflow Integration

This utility workflow can be integrated into the communication management system in several ways:

1. **Manual Processing:**
   - After email ingestion, manually identify images needing extraction
   - Run the extraction prompt for each relevant image
   - Update references in the email content

2. **Semi-Automated Processing:**
   - Create a script that identifies likely candidate images (e.g., by size, dimensions, or user tags)
   - Batch process identified images
   - Generate suggested updates to email content

3. **Full Integration:**
   - Extend the email ingestion prompt to automatically identify images with text
   - Call the extraction prompt for each relevant image during ingestion
   - Automatically update the email content with references to extracted text

## Benefits

- Makes image content searchable
- Preserves structured information in machine-readable format
- Allows for easier reference and knowledge extraction
- Improves accessibility of information in images
- Supports knowledge base creation from visual content

---

**Note**: This is a workflow description document, not an executable prompt. It explains how to use the image text extraction utility within the communication management system. 