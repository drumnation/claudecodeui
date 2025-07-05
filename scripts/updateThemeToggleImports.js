#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = require('glob');

async function updateThemeToggleImports() {
  console.log('🔍 Updating ThemeToggle imports...\n');
  
  // Get all JS/JSX files
  const allFiles = glob.sync('src/**/*.{js,jsx}');
  let fixedCount = 0;
  let totalReplacements = 0;
  
  // Define all the import mappings
  const importMappings = {
    // Old DarkModeToggle imports
    '@/features/chat/components/QuickSettingsPanel/components/DarkModeToggle': '@/shared-components/ThemeToggle',
    
    // Old ThemeToggle imports from settings
    '@/features/settings/components/ThemeToggle': '@/shared-components/ThemeToggle',
  };
  
  for (const file of allFiles) {
    try {
      let content = await readFile(file, 'utf8');
      let originalContent = content;
      let fileReplacements = 0;
      
      // Apply mappings
      for (const [oldPath, newPath] of Object.entries(importMappings)) {
        const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newPath);
          fileReplacements += matches.length;
          console.log(`✨ Fixed ${matches.length} import(s) in ${path.relative(process.cwd(), file)}`);
        }
      }
      
      // Also update component references from DarkModeToggle to ThemeToggle
      if (content.includes('DarkModeToggle')) {
        content = content.replace(/\bDarkModeToggle\b/g, 'ThemeToggle');
        console.log(`✨ Updated component references in ${path.relative(process.cwd(), file)}`);
        fileReplacements++;
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
}

updateThemeToggleImports().catch(console.error);