#!/usr/bin/env tsx

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import {
  ensureDirectories,
  getCountFilePath,
  getErrorReportPath,
} from "../utils/paths.js";

interface ParsedError {
  package: string;
  filePath: string;
  lineNumber: number;
  column: number;
  errorCode: string;
  errorMessage: string;
  fullLine: string;
}

interface PackageStats {
  errors: ParsedError[];
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  totalCount: number;
  severityScore: number;
}

// Ensure directories exist
ensureDirectories();

const FILE = getErrorReportPath("errors.typecheck-failures.md");
const RUN_COUNT_FILE = getCountFilePath("typecheck");

// Read/increment run count
let runCount = 1;
if (existsSync(RUN_COUNT_FILE)) {
  runCount = parseInt(readFileSync(RUN_COUNT_FILE, "utf-8"), 10) + 1;
}
writeFileSync(RUN_COUNT_FILE, runCount.toString());

// Get git info
const getBranch = () => {
  try {
    return execSync("git branch --show-current", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
};

const getCommit = () => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
};

console.log(`🔄 Updating current error state (Run #${runCount})...`);

// Run turbo and capture output
let turboOutput = "";
try {
  turboOutput = execSync(
    "pnpm turbo run typecheck --output-logs=full --continue",
    {
      encoding: "utf-8",
      stdio: "pipe",
    },
  );
} catch (error: any) {
  turboOutput = error.stdout || "";
}

// Parse errors
const errorLines = turboOutput
  .split("\n")
  .filter((line) => line.includes("error TS"));
const parsedErrors: ParsedError[] = [];

// Enhanced regex to handle turbo output format
const errorRegex =
  /^@([^:]+):typecheck:\s*([^(]+)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/;

errorLines.forEach((line: string) => {
  const match = errorRegex.exec(line);
  if (match?.[1] && match[2] && match[3] && match[4] && match[5] && match[6]) {
    parsedErrors.push({
      package: match[1],
      filePath: match[2].trim(),
      lineNumber: parseInt(match[3], 10),
      column: parseInt(match[4], 10),
      errorCode: match[5],
      errorMessage: match[6],
      fullLine: line,
    });
  }
});

// Count failed packages
const failedPackagesMatch = /Failed:\s*([^\n]+)/.exec(turboOutput);
const failedPackagesList = failedPackagesMatch?.[1]
  ? failedPackagesMatch[1]
      .split(",")
      .map((p: string) => p.trim())
      .filter((p: string) => p.includes("@financial"))
  : [];

// Count common patterns
const countPattern = (pattern: RegExp) =>
  parsedErrors.filter((e: ParsedError) => pattern.test(e.errorMessage)).length;

const undefinedCount = countPattern(/(possibly.*undefined|possibly.*null)/);
const propertyCount = countPattern(/Property.*does not exist/);
const unknownCount = countPattern(/is of type.*unknown/);
const typeMismatchCount = countPattern(/not assignable to/);

// Group errors by package
const packageStats = new Map<string, PackageStats>();

parsedErrors.forEach((error: ParsedError) => {
  if (!packageStats.has(error.package)) {
    packageStats.set(error.package, {
      errors: [],
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
      totalCount: 0,
      severityScore: 0,
    });
  }

  const stats = packageStats.get(error.package)!;
  stats.errors.push(error);
  stats.totalCount++;

  // Categorize by severity
  if (["TS1005", "TS2304", "TS2322", "TS2345"].includes(error.errorCode)) {
    stats.highSeverity++;
  } else if (
    ["TS2339", "TS2532", "TS18046", "TS18048"].includes(error.errorCode)
  ) {
    stats.mediumSeverity++;
  } else if (
    ["TS2554", "TS7006", "TS2551", "TS2349"].includes(error.errorCode)
  ) {
    stats.lowSeverity++;
  }

  stats.severityScore =
    stats.highSeverity * 3 + stats.mediumSeverity * 2 + stats.lowSeverity * 1;
});

// Generate the report
const currentDate = new Date().toLocaleString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

let output = `# 🚨 Current TypeScript Errors

[✓ Date compliance: All dates generated via command] **Last Updated:** ${currentDate}
**Run:** #${runCount} | **Branch:** ${getBranch()} | **Commit:** ${getCommit()}
**Status:** ${parsedErrors.length} errors in ${failedPackagesList.length} packages

`;

// Add batch analysis if there are errors
if (parsedErrors.length > 0) {
  output += `## 🔄 Batch-Fixing Opportunities

`;

  let hasBatchOpportunities = false;

  if (undefinedCount >= 3) {
    hasBatchOpportunities = true;
    output += `### 🎯 **HIGH PRIORITY:** Undefined/Null Checks (${undefinedCount} instances)
- **TS2532/TS18048**: Add null/undefined guards (\`if (obj?.property)\` or \`obj && obj.property\`)

`;
  }

  if (unknownCount >= 2) {
    hasBatchOpportunities = true;
    output += `### 🔧 **MEDIUM PRIORITY:** Error Type Assertions (${unknownCount} instances)
- **TS18046**: Add proper error typing (\`error as Error\` or \`(error as Error).message\`)

`;
  }

  if (propertyCount >= 2) {
    hasBatchOpportunities = true;
    output += `### 🏗️ **STRUCTURAL:** Interface/Property Issues (${propertyCount} instances)
- **TS2339/TS2551**: Update interfaces or use optional chaining

`;
  }

  if (typeMismatchCount >= 2) {
    hasBatchOpportunities = true;
    output += `### 🔄 **TYPE FIXES:** Assignment Issues (${typeMismatchCount} instances)
- **TS2322**: Fix type mismatches (Date vs string, etc.)

`;
  }

  if (hasBatchOpportunities) {
    output += `💡 **Recommended Approach:** Focus on batch patterns above for maximum efficiency

### 🤖 **Claude Integration Tip:**

Copy this error list and prompt Claude in Cursor:
\`\`\`
Fix these TypeScript errors in batch, prioritizing the high-impact patterns above:
[paste the checkbox list below]
\`\`\`

`;
  } else {
    output += `💡 **Recommended Approach:** Tackle errors individually or group by file

`;
  }
} else {
  output += `🎉 **No TypeScript errors found!** All packages are clean.

`;
}

// Add workflow instructions
output += `## 🤖 Agent Workflow Instructions

**FOR CLAUDE SUB-AGENTS:** Use this file as your task list. Follow this workflow:

### 🚀 Parallel Agent Strategy (Up to 6 Agents)
- **Divide and conquer:** Have up to 6 agents work on different error groups simultaneously
- **Assignment suggestions:**
  - Agent 1-2: High severity errors (TS2345, TS2322, TS2741)
  - Agent 3-4: Import/module errors (TS2307, TS2305)
  - Agent 5-6: Property/undefined errors (TS2339, TS2532, TS18048)
- **Coordination:** Each agent should claim specific files or packages to avoid conflicts

### 📋 Individual Agent Workflow:
1. **Check batch opportunities above** - Prioritize high-impact batch fixes
2. **Pick errors to fix** (use smart grouping strategy below)
3. **Fix the errors** in the codebase
4. **Run:** \`pnpm brain:typecheck-failures\` to refresh this file
5. **Verify** your fixes removed the errors from the list
6. **Commit** with appropriate messages using \`pnpm brain:commit --include-fixes\`

### 📋 Commit Strategy (Based on Error Count):
- **≤5 errors:** Individual commits per error (\`fix: TS2532 undefined check in pattern-extraction.node.ts:113\`)
- **6-15 errors:** Group by file (\`fix: resolve TypeScript errors in pattern-extraction.node.ts\`)
- **16+ errors:** Group by error type (\`fix: add undefined checks for TS2532 errors\`)

`;

// Add strategy
let strategy = "";
if (parsedErrors.length <= 5) {
  strategy =
    "**Individual commits** per error (`fix: TS2532 undefined check in pattern-extraction.node.ts:113`)";
} else if (parsedErrors.length <= 15) {
  strategy =
    "**Group by file** (`fix: resolve TypeScript errors in pattern-extraction.node.ts`)";
} else {
  strategy =
    "**Group by error type** (`fix: add undefined checks for TS2532 errors`)";
}

output += `### 🎯 Current Strategy for ${parsedErrors.length} errors:
${strategy}

`;

// Add summary
output += `## 📊 Quick Summary
- **Errors:** ${parsedErrors.length} TypeScript issues
- **Failed Packages:** ${failedPackagesList.length}
- **Exit Code:** ${parsedErrors.length === 0 ? 0 : 2}

## 🎯 Fix These Errors (Checkboxes)

`;

// Add error checkboxes
if (parsedErrors.length > 0) {
  parsedErrors.forEach((error: ParsedError) => {
    const filename = error.filePath.split("/").pop() || "unknown";
    output += `- [ ] **${error.errorCode}** in \`${filename}\` (Line ${error.lineNumber})
  - **Path:** \`${error.filePath}\`
  - **Error:** ${error.errorMessage}

`;
  });
} else {
  output += `🎉 **No TypeScript errors found!** All packages are clean.

`;
}

// Add package info
output += `## 📦 Failed Packages

`;

if (failedPackagesList.length > 0) {
  failedPackagesList.forEach((pkg) => {
    output += `- **${pkg}** - Run \`cd\` to package directory and \`pnpm typecheck\`
`;
  });
} else {
  output += `🎉 All packages passed TypeScript checking!
`;
}

// Add quick actions
output += `
## ⚡ Quick Actions

- **Rerun after fixes:** \`pnpm brain:errors\`
- **Check specific package:** \`cd [package-dir] && pnpm typecheck\`
- **Full rebuild:** \`pnpm turbo run typecheck --no-cache\`

## 📊 Package Error Analysis

`;

if (parsedErrors.length > 0) {
  output += `### 🎯 Errors by Package

`;

  // Sort packages by error count
  const sortedPackages = Array.from(packageStats.entries()).sort(
    ([, a], [, b]) => b.totalCount - a.totalCount,
  );

  sortedPackages.forEach(([pkg, stats]) => {
    output += `- **@${pkg}**: ${stats.totalCount} errors
`;
  });

  output += `
### 🚨 Severity Breakdown by Package

`;

  // Sort by severity score
  const sortedBySeverity = Array.from(packageStats.entries()).sort(
    ([, a], [, b]) => b.severityScore - a.severityScore,
  );

  sortedBySeverity.forEach(([pkg, stats]) => {
    output += `#### @${pkg} (${stats.totalCount} errors, severity score: ${stats.severityScore})
`;
    if (stats.highSeverity > 0) {
      output += `- 🔴 **High Severity**: ${stats.highSeverity} errors (syntax, missing declarations, type assignments)
`;
    }
    if (stats.mediumSeverity > 0) {
      output += `- 🟡 **Medium Severity**: ${stats.mediumSeverity} errors (property issues, undefined checks)
`;
    }
    if (stats.lowSeverity > 0) {
      output += `- 🟢 **Low Severity**: ${stats.lowSeverity} errors (parameter issues, implicit any)
`;
    }
    output += `
`;
  });

  output += `### 🎯 **Recommended Package Priority:**

1. **Focus on high severity scores first** (syntax errors block compilation)
2. **Target packages with many medium severity errors** (undefined checks are often batch-fixable)
3. **Tackle remaining packages by total error count**
`;
} else {
  output += `🎉 All packages are error-free!
`;
}

output += `
---
*Updated automatically by error collection script*
`;

// Write the file
writeFileSync(FILE, output);

// Console output
console.log(
  `🚨 Found ${parsedErrors.length} errors in ${failedPackagesList.length} packages`,
);
console.log(`📄 Updated: ${FILE}`);
console.log(`🔄 Run again after fixes: pnpm brain:errors`);

// Exit with appropriate code
process.exit(parsedErrors.length === 0 ? 0 : 2);
