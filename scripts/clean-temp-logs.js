#!/usr/bin/env node

/**
 * Script to automatically remove temporary logging statements
 * Usage: node scripts/clean-temp-logs.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

const TEMP_LOG_PATTERNS = [
  // Match logTrace calls
  /\s*.*\.logTrace\([^)]*\);?\s*\n/g,
  // Match logTemp calls  
  /\s*.*\.logTemp\([^)]*\);?\s*\n/g,
  // Match TRACE-TEMP logger calls
  /\s*.*logger\.debug\([^)]*TRACE[^)]*\);?\s*\n/g,
  // Match TEMP logger calls
  /\s*.*logger\.debug\([^)]*TEMP[^)]*\);?\s*\n/g,
  // Match console.log with TRACE or TEMP markers
  /\s*console\.log\([^)]*(?:TRACE|TEMP)[^)]*\);?\s*\n/g,
];

const COMMENT_PATTERNS = [
  // Match // TRACE: comments
  /\s*\/\/\s*TRACE:.*\n/g,
  // Match // TEMP: comments
  /\s*\/\/\s*TEMP:.*\n/g,
];

async function cleanTempLogs() {
  console.log('🧹 Cleaning temporary logs...');
  
  // Find all TypeScript/JavaScript files
  const files = await glob('**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', 'dist/**', '_logs/**', 'scripts/**'],
    cwd: process.cwd()
  });

  let totalFilesChanged = 0;
  let totalLogsRemoved = 0;

  for (const file of files) {
    const filePath = join(process.cwd(), file);
    const originalContent = readFileSync(filePath, 'utf8');
    let content = originalContent;
    let fileLogsRemoved = 0;

    // Remove temp log patterns
    for (const pattern of TEMP_LOG_PATTERNS) {
      const matches = content.match(pattern) || [];
      fileLogsRemoved += matches.length;
      content = content.replace(pattern, '');
    }

    // Remove temp comments
    for (const pattern of COMMENT_PATTERNS) {
      const matches = content.match(pattern) || [];
      fileLogsRemoved += matches.length;
      content = content.replace(pattern, '');
    }

    // Clean up extra blank lines (max 2 consecutive)
    content = content.replace(/\n{3,}/g, '\n\n');

    if (content !== originalContent) {
      writeFileSync(filePath, content);
      totalFilesChanged++;
      totalLogsRemoved += fileLogsRemoved;
      console.log(`✅ ${file}: Removed ${fileLogsRemoved} temp logs`);
    }
  }

  console.log(`\n🎉 Cleanup complete!`);
  console.log(`📁 Files changed: ${totalFilesChanged}`);
  console.log(`🗑️  Total logs removed: ${totalLogsRemoved}`);
}

// Run the cleanup
cleanTempLogs().catch(console.error);