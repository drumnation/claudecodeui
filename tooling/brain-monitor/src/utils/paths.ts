import { mkdirSync } from "fs";
import { join } from "path";

// Ensure directories exist
export function ensureDirectories(): void {
  mkdirSync("_errors", { recursive: true });
  mkdirSync("_errors/.counts", { recursive: true });
  mkdirSync("_errors/reports", { recursive: true });
  mkdirSync("_logs", { recursive: true });
}

// Get the path for a count file
export function getCountFilePath(type: string): string {
  return join("_errors", ".counts", `.${type}-run-count`);
}

// Get the path for an error report
export function getErrorReportPath(filename: string): string {
  // Keep validation-summary.md in the root
  if (filename === "validation-summary.md") {
    return join("_errors", filename);
  }
  // All other error reports go in the reports subdirectory
  return join("_errors", "reports", filename);
}
