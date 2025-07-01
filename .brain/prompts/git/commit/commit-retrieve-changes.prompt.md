AUTO-EXECUTE-V1

**ACTION REQUIRED:**  Use the information and instructions below to fetch, parse, analyze, and format commit data based on the provided inputs.

# Prompt for AI: Retrieve and Format Git Commit Data

You are a commit data retrieval expert. Your task is to extract, parse, and format commit data from a Git repository based on specific filters and queries. You will provide structured information about commits, including metadata, changes, and contextual information, using the latest metadata structure.

**Input:**

* **Repository**: The path or name of the repository to analyze (assume current context if not provided).
* **Commit Reference** (optional): Specific commit hash, branch, tag, or range (e.g., `HEAD~5..HEAD`, `main`, `v1.2.0`).
* **Filters** (optional): Criteria like `--author="..."`, `--since="..."`, `--until="..."`, `--grep="..."`, `-- <pathspec>`.
* **Output Format** (optional): Preferred format (Default: JSON).
* **Detail Level** (optional): Amount of detail (e.g., `minimal` - hash/subject/author/date; `standard` - adds body/files; `detailed` - adds stats/parents/etc.).

**Instructions:**

1.  **Data Retrieval:**
    * Construct and execute appropriate `git log` or related Git commands based on the provided `Commit Reference` and `Filters`.
    * Use formatting options in `git log` (like `--pretty=format:...`) to efficiently retrieve required fields. Example format string elements: `%H` (hash), `%h` (abbr hash), `%an` (author name), `%ae` (author email), `%ai` (author date ISO), `%cn`, `%ce`, `%ci`, `%s` (subject), `%b` (body), `%N` (notes). Handle potential footer parsing separately if needed or use full message `%B`.
    * To get file stats/list, consider using `--stat` or running `git show --pretty="" --name-status HASH` per commit if high detail is needed.
    * Handle errors during command execution.

2.  **Data Parsing (per commit):**
    * Extract relevant information retrieved from Git commands.
    * **Commit Message:** Parse the full commit message (`%B`) into three distinct components:
        * `messageSubject`: The first line.
        * `messageBody`: Lines between the subject and the footer (after the first blank line, before the last blank line if a footer exists). Preserve internal newlines. Can be empty.
        * `messageFooter`: Lines after the last blank line following the body. Preserve internal newlines. Can be empty.
    * Extract other fields based on `Detail Level`: hash (`%H`), abbreviated hash (`%h`), author (`%an`, `%ae`), date (`%ai`), committer (if different), changed files (path, status M/A/D), stats (insertions/deletions), parent hashes (`%P`), associated tags/branches (`git name-rev`, `git branch --contains`, `git tag --contains`).

3.  **Contextual Analysis (per commit):**
    * Based on `messageSubject`, identify Conventional Commit prefix (`type`, `scope`, `breaking_change` marker `!`).
    * Based on `messageBody` and `messageFooter`, identify references to issues (`#123`, `Closes: #...`) or PRs.
    * Identify significant commits (e.g., merge commits based on parent count, commits associated with tags).

4.  **Data Formatting:**
    * Structure the data for each commit according to the target `Output Format` (default JSON) and `Detail Level`.
    * Use the field names specified in the example below (`messageSubject`, `messageBody`, `messageFooter`, etc.).
    * If multiple commits are retrieved, present them as a list/array.
    * Optionally include summary information (total commits, author counts, etc.) if requested or appropriate.

**Output:**

Provide a structured representation of the requested commit data. Ensure the output strictly follows the requested format (default JSON) and uses the specified field names, especially for the commit message components.

**Example Output (JSON format, standard detail level):**

```json
{
  "repository": "example/repo", // Or indicate local context
  "query_parameters": { // Echo back the effective parameters used
    "commit_reference": "HEAD~2..HEAD",
    "filters": ["--author=jane.doe"]
  },
  "total_commits_retrieved": 2,
  "commits": [
    {
      "hash": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      "abbreviated_hash": "a1b2c3d",
      "author": {
        "name": "Jane Doe",
        "email": "jane.doe@example.com"
      },
      "date": "2023-06-15T10:30:00Z", // Use ISO 8601 format
      "messageSubject": "feat(api): Add user authentication endpoint",
      "messageBody": "Implement a new endpoint for user authentication using JWT tokens.\n\nThis includes:\n- Token generation and validation\n- Password hashing\n- Session management", // Body without footer
      "messageFooter": "Resolves #123", // Footer extracted
      // Standard Detail Level might include basic file list:
      "files": [
         {"path": "src/api/auth.js", "status": "M"}, // Example using --name-status
         {"path": "src/models/user.js", "status": "M"},
         {"path": "src/middleware/auth.js", "status": "M"},
         {"path": "tests/api/auth.test.js", "status": "A"},
         {"path": "docs/api.md", "status": "M"}
      ],
       // Detailed Level might add stats, parents, refs, conv. commit breakdown:
      "stats": { // Example for Detailed Level
         "files_changed": 5, "insertions": 120, "deletions": 10
       },
      "parents": ["b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c"], // Example for Detailed Level
      "references": {"issues": ["#123"], "pull_requests": []}, // Example for Detailed Level
      "conventional_commit": {"type": "feat", "scope": "api", "breaking_change": false} // Example for Detailed Level
    },
    {
      "hash": "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c",
      "abbreviated_hash": "b2c3d4e",
      "author": {
        "name": "Jane Doe",
        "email": "jane.doe@example.com"
      },
      "date": "2023-06-14T15:45:00Z",
      "messageSubject": "refactor(models): Improve user model validation",
      "messageBody": "Enhance user model validation to be more robust and handle edge cases better.\n\nThis change simplifies the validation logic while making it more comprehensive.",
      "messageFooter": "", // Example with empty footer
      "files": [
         {"path": "src/models/user.js", "status": "M"},
         {"path": "tests/models/user.test.js", "status": "M"}
      ]
      // Detailed fields omitted for brevity in this second example
    }
  ]
  // Optional Summary section might go here
}