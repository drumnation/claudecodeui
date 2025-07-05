#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = require('glob');

async function fixStorybookTitles() {
  console.log('🔍 Fixing Storybook titles...\n');
  
  // Get all story files
  const storyFiles = glob.sync('src/**/*.stories.{js,jsx}');
  let fixedCount = 0;
  
  // Define title replacements
  const titleReplacements = {
    // Git feature
    "'Features/Git/GitPanel'": "'Features/Git'",
    '"Features/Git/GitPanel"': '"Features/Git"',
    "'Features/Git/BranchSelector'": "'Features/Git/BranchSelector'",
    "'Features/Git/CommitMessage'": "'Features/Git/CommitMessage'",
    "'Features/Git/FileItem'": "'Features/Git/FileItem'",
    "'Features/Git/NewBranchModal'": "'Features/Git/NewBranchModal'",
    
    // Terminal feature
    "'Features/Terminal/Shell'": "'Features/Terminal'",
    '"Features/Terminal/Shell"': '"Features/Terminal"',
    "'Features/Terminal/ConnectOverlay'": "'Features/Terminal/ConnectOverlay'",
    "'Features/Terminal/EmptyState'": "'Features/Terminal/EmptyState'",
    "'Features/Terminal/ShellHeader'": "'Features/Terminal/ShellHeader'",
    "'Features/Terminal/Terminal'": "'Features/Terminal/Terminal'",
    
    // Preview feature
    "'Features/Preview/LivePreviewPanel'": "'Features/Preview'",
    '"Features/Preview/LivePreviewPanel"': '"Features/Preview"',
    "'Features/Preview/NavigationBar'": "'Features/Preview/NavigationBar'",
    "'Features/Preview/LogsPanel'": "'Features/Preview/LogsPanel'",
    "'Features/Preview/PreviewFrame'": "'Features/Preview/PreviewFrame'",
    "'Features/Preview/ServerControls'": "'Features/Preview/ServerControls'",
    "'Features/Preview/StatusIndicator'": "'Features/Preview/StatusIndicator'",
    
    // Settings feature
    "'Features/Settings/QuickSettingsPanel'": "'Features/Settings/QuickSettings'",
    '"Features/Settings/QuickSettingsPanel"': '"Features/Settings/QuickSettings"',
    "'Features/Settings/ToolsSettings'": "'Features/Settings/Tools'",
    '"Features/Settings/ToolsSettings"': '"Features/Settings/Tools"',
    "'Features/Settings/DarkModeToggle'": "'Features/Settings/DarkModeToggle'",
    
    // Also update legacy Components paths
    "'Components/GitPanel'": "'Features/Git'",
    '"Components/GitPanel"': '"Features/Git"',
    "'Components/LivePreviewPanel'": "'Features/Preview'",
    '"Components/LivePreviewPanel"': '"Features/Preview"',
    "'Components/Shell'": "'Features/Terminal'",
    '"Components/Shell"': '"Features/Terminal"',
    "'Components/QuickSettingsPanel'": "'Features/Settings/QuickSettings'",
    '"Components/QuickSettingsPanel"': '"Features/Settings/QuickSettings"',
    "'Components/ToolsSettings'": "'Features/Settings/Tools'",
    '"Components/ToolsSettings"': '"Features/Settings/Tools"',
    "'Components/DarkModeToggle'": "'Features/Settings/DarkModeToggle'",
    '"Components/DarkModeToggle"': '"Features/Settings/DarkModeToggle"'
  };
  
  for (const file of storyFiles) {
    try {
      let content = await readFile(file, 'utf8');
      let originalContent = content;
      let fileUpdated = false;
      
      // Apply each replacement
      for (const [oldTitle, newTitle] of Object.entries(titleReplacements)) {
        if (content.includes(oldTitle)) {
          content = content.replace(new RegExp(oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newTitle);
          console.log(`✨ Updated title in ${path.relative(process.cwd(), file)}`);
          console.log(`   ${oldTitle} → ${newTitle}`);
          fileUpdated = true;
        }
      }
      
      // Write back if changes were made
      if (content !== originalContent) {
        await writeFile(file, content, 'utf8');
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} story files!`);
}

fixStorybookTitles().catch(console.error);