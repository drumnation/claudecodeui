#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = require('glob');

async function fixStorybookImports() {
  console.log('🔍 Searching for Storybook files with broken imports...\n');
  
  const storyFiles = glob.sync('src/**/*.stories.{js,jsx}');
  let fixedCount = 0;
  
  // Define the mapping from old to new paths
  const importMappings = {
    '@/components/GitPanel': '@/features/git/GitPanel',
    '@/components/LivePreviewPanel': '@/features/preview/LivePreviewPanel',
    '@/components/Shell': '@/features/terminal/Shell',
    '@/components/QuickSettingsPanel': '@/features/settings/QuickSettingsPanel',
    '@/components/ToolsSettings': '@/features/settings/ToolsSettings',
    '@/components/DarkModeToggle': '@/features/settings/QuickSettingsPanel/DarkModeToggle'
  };
  
  for (const file of storyFiles) {
    try {
      let content = await readFile(file, 'utf8');
      let originalContent = content;
      
      // Check and fix each mapping
      for (const [oldPath, newPath] of Object.entries(importMappings)) {
        const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (content.includes(oldPath)) {
          content = content.replace(regex, newPath);
          console.log(`✨ Fixed import in ${path.relative(process.cwd(), file)}`);
          console.log(`   ${oldPath} → ${newPath}`);
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
  
  console.log(`\n✅ Fixed ${fixedCount} Storybook files!`);
  
  // Now run the original fix:imports to catch any remaining issues
  console.log('\n🔧 Running fix:imports for any remaining relative imports...');
  require('./fixImports.js');
}

fixStorybookImports().catch(console.error);