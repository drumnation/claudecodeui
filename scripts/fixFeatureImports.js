#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = require('glob');

async function fixFeatureImports() {
  console.log('🔍 Searching for all files with broken imports in features directory...\n');
  
  // Get all JS/JSX files in features directory
  const featureFiles = glob.sync('src/features/**/*.{js,jsx}');
  let fixedCount = 0;
  let totalReplacements = 0;
  
  // Define the mapping from old to new paths
  const importMappings = {
    '@/components/GitPanel': '@/features/git/GitPanel',
    '@/components/LivePreviewPanel': '@/features/preview/LivePreviewPanel',
    '@/components/Shell': '@/features/terminal/Shell',
    '@/components/QuickSettingsPanel': '@/features/settings/QuickSettingsPanel',
    '@/components/ToolsSettings': '@/features/settings/ToolsSettings',
    '@/components/DarkModeToggle': '@/features/settings/QuickSettingsPanel/DarkModeToggle'
  };
  
  for (const file of featureFiles) {
    try {
      let content = await readFile(file, 'utf8');
      let originalContent = content;
      let fileReplacements = 0;
      
      // Check and fix each mapping
      for (const [oldPath, newPath] of Object.entries(importMappings)) {
        const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newPath);
          fileReplacements += matches.length;
          console.log(`✨ Fixed ${matches.length} import(s) in ${path.relative(process.cwd(), file)}`);
          console.log(`   ${oldPath} → ${newPath}`);
        }
      }
      
      // Write back if changes were made
      if (content !== originalContent) {
        await writeFile(file, content, 'utf8');
        fixedCount++;
        totalReplacements += fileReplacements;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files with a total of ${totalReplacements} import replacements!`);
  
  // Also check for any remaining broken imports in other directories
  console.log('\n🔍 Checking for broken imports in other directories...\n');
  
  const otherFiles = glob.sync('src/**/*.{js,jsx}', {
    ignore: ['src/features/**/*', 'node_modules/**/*']
  });
  
  let otherFixedCount = 0;
  for (const file of otherFiles) {
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
        otherFixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  if (otherFixedCount > 0) {
    console.log(`\n✅ Fixed ${otherFixedCount} additional files outside features directory!`);
  }
  
  console.log('\n🎉 Import purification complete!');
}

fixFeatureImports().catch(console.error);