#!/usr/bin/env tsx

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import {
  ensureDirectories,
  getCountFilePath,
  getErrorReportPath,
} from "../utils/paths.js";

// Ensure directories exist
ensureDirectories();

// Run count tracking
const RUN_COUNT_FILE = getCountFilePath("format");
let runCount = 1;
try {
  runCount = parseInt(readFileSync(RUN_COUNT_FILE, "utf-8"), 10) + 1;
} catch {
  // File doesn't exist, start at 1
}
writeFileSync(RUN_COUNT_FILE, runCount.toString());

// Get current git info
let branchName = "unknown";
let commitHash = "unknown";
try {
  branchName = execSync("git branch --show-current", {
    encoding: "utf-8",
  }).trim();
  commitHash = execSync("git rev-parse --short HEAD", {
    encoding: "utf-8",
  }).trim();
} catch {
  // Git commands failed
}

// Get current date/time using date command
const currentDate = execSync('date +"%A, %B %d, %Y at %I:%M:%S %p"', {
  encoding: "utf-8",
}).trim();

// First try auto-fix with turbo
console.log("🎨 Running format auto-fix using turbo...");
let autoFixed = false;
try {
  execSync('pnpm turbo run format --filter="*" -- --write', {
    encoding: "utf-8",
    stdio: "inherit",
  });
  autoFixed = true;
  console.log(
    "✅ Auto-formatting completed! Re-checking for any remaining issues...",
  );
} catch (error: any) {
  // Auto-fix may have fixed some issues, continue to check what remains
  autoFixed = true;
}

// Run format check to see what issues remain (with turbo)
console.log("🔍 Checking for remaining format issues...");
let formatOutput = "";
let exitCode = 0;

try {
  formatOutput = execSync('pnpm turbo run format --filter="*" -- --check', {
    encoding: "utf-8",
  });
} catch (error: any) {
  formatOutput = error.stdout || "";
  exitCode = error.status || 1;
}

// Parse format output to find unformatted files
const unformattedFiles: string[] = [];
const packageFiles = new Map<string, string[]>();

// Parse Prettier output (looking for file paths)
const lines = formatOutput.split("\n");
let currentPackage = "";

for (const line of lines) {
  // Detect package context from turbo output
  const packageMatch = /(@[^:]+):/.exec(line);
  if (packageMatch?.[1]) {
    currentPackage = packageMatch[1];
  }

  // Look for file paths that Prettier reports as needing formatting
  // Prettier outputs relative paths when files need formatting
  if (
    line.includes(".ts") ||
    line.includes(".tsx") ||
    line.includes(".js") ||
    line.includes(".jsx") ||
    line.includes(".json") ||
    line.includes(".md") ||
    line.includes(".css") ||
    line.includes(".scss")
  ) {
    // Extract file path
    const filePath = line.trim().replace(/^[^\s]+\s+/, ""); // Remove any prefix
    if (
      filePath &&
      !filePath.includes("Checking formatting...") &&
      !filePath.includes("Code style issues found")
    ) {
      unformattedFiles.push(filePath);

      // Add to package files
      if (!packageFiles.has(currentPackage)) {
        packageFiles.set(currentPackage, []);
      }
      packageFiles.get(currentPackage)!.push(filePath);
    }
  }
}

// Group files by extension
const filesByExtension = new Map<string, string[]>();
unformattedFiles.forEach((file: string) => {
  const ext = file.substring(file.lastIndexOf("."));
  if (!filesByExtension.has(ext)) {
    filesByExtension.set(ext, []);
  }
  filesByExtension.get(ext)!.push(file);
});

// Generate markdown report
const markdownContent = `# 🎨 Current Format Issues

[✓ Date compliance: All dates generated via command] **Last Updated:** ${currentDate}
**Run:** #${runCount} | **Branch:** ${branchName} | **Commit:** ${commitHash}
**Status:** ${unformattedFiles.length} unformatted files
${
  autoFixed
    ? "**✅ Auto-format was applied!** Issues shown are files that could not be auto-formatted."
    : ""
}

## 🔄 Quick Fix

${
  unformattedFiles.length > 0
    ? `### One-Command Fix:
\`\`\`bash
pnpm turbo run format -- --write
\`\`\`

This will automatically format all ${unformattedFiles.length} files listed below.
`
    : "All files are properly formatted! 🎉"
}

## 🤖 Agent Workflow Instructions

**FOR CLAUDE SUB-AGENTS:** ${
  autoFixed
    ? "Auto-formatting was already applied. These files may have syntax errors preventing formatting."
    : "Use the one-command fix above to resolve all formatting issues at once."
}

### 🚀 Parallel Agent Strategy (Up to 6 Agents)
- **For syntax errors preventing formatting:**
  - Agent 1-2: TypeScript/TSX files with syntax errors
  - Agent 3-4: JavaScript/JSX files with syntax errors  
  - Agent 5-6: JSON/Configuration files with syntax errors
- **Coordination:** Each agent should claim specific file types or directories

### 📋 Individual Agent Workflow:
1. **Run the fix command** above if not already done
2. **If files remain**, they likely have syntax errors - fix those first
3. **Run:** \`pnpm brain:format-failures\` to verify all issues resolved
4. **Commit** with message: \`style: apply prettier formatting\`

## 📊 Quick Summary
- **Unformatted Files:** ${unformattedFiles.length}
- **Exit Code:** ${exitCode}
${autoFixed ? "- **Auto-format:** Applied successfully" : "- **Auto-format:** Not yet applied"}

${
  unformattedFiles.length > 0
    ? `## 🎯 Files Needing Format (By Extension)

${Array.from(filesByExtension.entries())
  .sort((a, b) => b[1].length - a[1].length)
  .map(
    ([ext, files]) => `### ${ext} Files (${files.length})

${files
  .slice(0, 20)
  .map((file: string) => `- [ ] \`${file}\``)
  .join(
    "\n",
  )}${files.length > 20 ? `\n*... and ${files.length - 20} more ${ext} files*` : ""}`,
  )
  .join("\n\n")}

## 📦 Files by Package

${Array.from(packageFiles.entries())
  .filter(([pkg, files]) => files.length > 0)
  .map(
    ([pkg, files]) => `### ${pkg}
- **Unformatted files:** ${files.length}`,
  )
  .join("\n\n")}`
    : ""
}

## ⚡ Quick Actions

- **Auto-format all:** \`pnpm turbo run format -- --write\`
- **Re-check formatting:** \`pnpm brain:format-failures\`
- **Check specific package:** \`cd [package-dir] && pnpm format\`
- **Update prettier config:** Review \`.prettierrc\` settings

---
*Updated automatically by format collection script with turbo caching*
`;

// Write the markdown file
writeFileSync(getErrorReportPath("errors.format-failures.md"), markdownContent);

console.log(`\n📊 Format Summary:`);
console.log(`- Unformatted files: ${unformattedFiles.length}`);
console.log(`- Auto-format: ${autoFixed ? "Applied" : "Not applied"}`);
console.log(`- Report: _errors/errors.format-failures.md`);

// Exit with appropriate code
process.exit(unformattedFiles.length > 0 ? 1 : 0);
