#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapping of old paths to new paths
const pathMappings = {
  '@/components/GitPanel': '@/features/git/GitPanel',
  '@/components/FileTree': '@/features/files/FileTree',
  '@/components/TodoList': '@/features/chat/components/TodoList',
  '@/components/ClaudeLogo': '@/shared-components/ClaudeLogo',
  '@/components/ClaudeStatus': '@/features/chat/components/ClaudeStatus',
  '@/components/CommandMenu': '@/features/chat/components/CommandMenu',
  '@/components/DarkModeToggle': '@/features/settings/QuickSettingsPanel/DarkModeToggle',
  '@/components/ImageViewer': '@/features/files/components/ImageViewer',
  '@/components/LivePreviewPanel': '@/features/preview/LivePreviewPanel',
  '@/components/QuickSettingsPanel': '@/features/settings/QuickSettingsPanel',
  '@/components/Shell': '@/features/terminal/Shell',
  '@/components/ToolsSettings': '@/features/settings/ToolsSettings',
  '@/components/ChatInterface': '@/features/chat',
  '@/components/Message': '@/features/chat/components/Message',
  '@/components/MessagesArea': '@/features/chat/components/MessagesArea',
  '@/components/InputArea': '@/features/chat/components/InputArea',
  '@/components/HintTexts': '@/features/chat/components/HintTexts',
  '@/components/MessageStates': '@/features/chat/components/MessageStates',
  '@/components/NoProjectSelected': '@/features/chat/components/NoProjectSelected',
  '@/components/ScrollToBottomButton': '@/features/chat/components/ScrollToBottomButton',
  '@/components/ToolRenderer': '@/features/chat/components/ToolRenderer',
  '@/components/ui': '@/shared-components/ui',
};

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function findBrokenImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const brokenImports = [];
  
  lines.forEach((line, index) => {
    // Check for imports from old paths
    const importMatch = line.match(/(?:from|import)\s+['"](@\/components\/[^'"]+)['"]/);
    if (importMatch) {
      const oldPath = importMatch[1];
      let foundMapping = false;
      
      // Check if this matches any of our mappings
      for (const [oldPrefix, newPrefix] of Object.entries(pathMappings)) {
        if (oldPath.startsWith(oldPrefix)) {
          foundMapping = true;
          brokenImports.push({
            file: filePath,
            line: index + 1,
            oldImport: oldPath,
            suggestedImport: oldPath.replace(oldPrefix, newPrefix),
            fullLine: line.trim()
          });
          break;
        }
      }
      
      if (!foundMapping) {
        brokenImports.push({
          file: filePath,
          line: index + 1,
          oldImport: oldPath,
          suggestedImport: null,
          fullLine: line.trim()
        });
      }
    }
  });
  
  return brokenImports;
}

// Main execution
const featuresDir = path.join(__dirname, '..', 'src', 'features');
const allFiles = getAllFiles(featuresDir);

console.log('Scanning for broken imports in src/features...\n');

const allBrokenImports = [];

allFiles.forEach(file => {
  const brokenImports = findBrokenImports(file);
  if (brokenImports.length > 0) {
    allBrokenImports.push(...brokenImports);
  }
});

// Group by file
const groupedByFile = allBrokenImports.reduce((acc, item) => {
  if (!acc[item.file]) {
    acc[item.file] = [];
  }
  acc[item.file].push(item);
  return acc;
}, {});

// Output results
console.log(`Found ${allBrokenImports.length} broken imports in ${Object.keys(groupedByFile).length} files:\n`);

Object.entries(groupedByFile).forEach(([file, imports]) => {
  console.log(`\n${file.replace(path.join(__dirname, '..'), '.')}:`);
  imports.forEach(imp => {
    console.log(`  Line ${imp.line}: ${imp.fullLine}`);
    if (imp.suggestedImport) {
      console.log(`    → Suggested: ${imp.oldImport} → ${imp.suggestedImport}`);
    } else {
      console.log(`    → No mapping found for: ${imp.oldImport}`);
    }
  });
});

console.log('\n\nSummary of components that need import updates:');
const uniqueOldPaths = [...new Set(allBrokenImports.map(imp => imp.oldImport.split('/').slice(0, 3).join('/')))];
uniqueOldPaths.sort().forEach(path => {
  console.log(`  - ${path}`);
});