AUTO-EXECUTE-V1

**ACTION REQUIRED:** Generate documentation based on the provided information about Pull Request (PR) data storage. The documentation should guide a developer on how to retrieve and utilize this PR data, including associated structured commit metadata. Output only the generated Markdown guide. Do not describe this prompt; execute the steps within it.

# Prompt for AI: Generate PR Data Retrieval Documentation

You are a documentation generator expert. Your task is to create a comprehensive guide explaining how a developer can retrieve and query data about Git Pull Requests (PRs), assuming the data is stored in a specific structured format and location, and potentially links to separate structured commit metadata files.

**Input:**

1.  **PR Data Storage Location:** [Provide a clear description of where the primary PR data is stored. Examples: "JSON files within the `.brain/git/pull-requests/` directory, named `[pr_number].json`.", "A 'pull_requests' table in a PostgreSQL database.", "An in-memory data structure."]
2.  **PR Data Structure Definition:** [Provide a detailed description or example of the structure for a single PR's data. MUST specify the fields available, e.g., `{ "prNumber": 123, "title": "...", "author": "...", "status": "open", "commitHashes": ["hash1", "hash2"], "reviewComments": [...] }`]
3.  **Commit Metadata Linkage (IMPORTANT):** Specify if and how the PR data links to detailed commit metadata. Assume commit metadata is stored in `.brain/git/commits/[xx]/[hash].json` and has the structure `{ "hash": "...", "messageSubject": "...", "messageBody": "...", "messageFooter": "...", "files": [...] }`. Example linkage: "The `commitHashes` array in the PR data contains the full hashes of commits included in the PR."

**Instructions for Generating the Guide:**

Create a Markdown document containing the following sections, tailored to the specific `Storage Location`, `Data Structure`, and `Commit Metadata Linkage` provided in the input:

1.  **Overview:** Briefly describe the PR data storage system.
2.  **Data Structure Explained:**
    * List **each field** defined in the input `PR Data Structure Definition`.
    * Provide a clear explanation of what each field represents.
    * **Crucially:** Explain how the field linking commits (e.g., `commitHashes`) relates to the separate structured commit metadata files in `.brain/git/commits/`. Describe the structure of the commit metadata JSON (`messageSubject`, `messageBody`, etc.).
3.  **Retrieval Methods:**
    * Provide general advice on accessing the data based on the `Storage Location` (e.g., reading files, querying DB, accessing object).
    * Include basic code snippets (TypeScript/JavaScript) demonstrating how to load/access a single PR's data structure.
4.  **Common Query Examples & Code:**
    * Provide several realistic query examples relevant to PRs.
    * For each query:
        * State the goal (e.g., "Find all PRs by author 'JaneDev'").
        * Explain the logic needed to fulfill the query, considering both the PR data structure and potentially the linked commit metadata.
        * Provide a code snippet (TypeScript/JavaScript) demonstrating how to implement the query logic.
    * **Include examples like:**
        * Finding PRs by author, status, label, title keyword.
        * **Finding PRs that modified a specific file** (Explain this requires checking the `files` array within the JSON metadata of *each commit* linked to the PR).
        * Finding PRs with review comments matching certain criteria (text, author).
        * Finding PRs based on commit message content (Explain this requires retrieving commit metadata and checking `messageSubject`, `messageBody`, or `messageFooter`).
5.  **Accessing Associated Data:**
    * Explain how to retrieve and use the detailed commit metadata associated with a PR using the linking field (e.g., iterating through `commitHashes` and reading the corresponding JSON files).
    * Explain how to access and interpret review comments, including any line number or commit associations if present in the `Data Structure`.
6.  **Indexing & Optimization:**
    * Suggest relevant indexing strategies based on the `Storage Location` and common query patterns (e.g., index by author, status, file paths within commit metadata).
    * Provide general tips for optimizing data retrieval performance (e.g., selective loading, caching).

**Output:**

* Respond ONLY with the generated Markdown documentation guide. Ensure it is comprehensive, accurate, and directly reflects the `Storage Location`, `Data Structure`, and `Commit Metadata Linkage` provided in the input. Use clear explanations and practical code examples.

**Example Output Structure (Markdown - AI needs to fill content based on Input):**

```markdown
# Guide: Retrieving Pull Request Data

## 1. Overview
This guide explains how to access and query Pull Request (PR) data stored in [Description based on Input: Storage Location].

## 2. Data Structure Explained

The primary data for each PR is stored with the following structure:
* `fieldName1`: [Explanation based on Input: Data Structure]
* `fieldName2`: [Explanation...]
* `commitHashes` (example field name): An array of commit hash strings. Each hash corresponds to a detailed commit metadata file stored separately.
* `reviewComments`: [Explanation...]
* ... (List all fields from input)

**Linked Commit Metadata:**
Each hash in the `commitHashes` array points to a JSON file located at `.brain/git/commits/[xx]/[hash].json`, where `xx` is the first two characters of the hash. These files contain detailed information about the specific commit, structured as:
* `hash`: Full commit hash.
* `messageSubject`: The commit subject line.
* `messageBody`: The commit body (can be multi-line or empty).
* `messageFooter`: The commit footer (can be multi-line or empty).
* `files`: An array of file paths modified in that commit.
* `timestamp`: Commit timestamp.
* ... (other relevant commit metadata fields)

## 3. Retrieval Methods
To access the PR data stored in [Storage Location], you can use the following approach:

```typescript
// Basic code snippet to load PR data based on storage type
// e.g., reading a JSON file, querying a DB...
async function loadPrData(prNumber: number): Promise<PrDataType | null> {
  // Implementation depends on Storage Location
  console.log(`Loading data for PR #${prNumber}`);
  // ... add retrieval logic here ...
  return null; // Replace with actual data
}