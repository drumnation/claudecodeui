#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = require('glob');

async function fixMovedComponentImports() {
  console.log('🔍 Fixing imports for moved components...\n');
  
  // Get all JS/JSX files
  const allFiles = glob.sync('src/**/*.{js,jsx}');
  let fixedCount = 0;
  let totalReplacements = 0;
  
  // Define all the import mappings
  const importMappings = {
    // DarkModeToggle moved to settings/components
    '@/features/settings/DarkModeToggle': '@/features/settings/components/DarkModeToggle',
    
    // QuickSettingsPanel moved from settings to chat/components
    '@/features/settings/QuickSettingsPanel': '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel',
    '@/features/settings': '@/features/chat/components/QuickSettingsPanel' // for destructured imports
  };
  
  for (const file of allFiles) {
    try {
      let content = await readFile(file, 'utf8');
      let originalContent = content;
      let fileReplacements = 0;
      
      // Special handling for files that import from @/features/settings
      if (content.includes("from '@/features/settings'") || content.includes('from "@/features/settings"')) {
        // Check if it's importing QuickSettingsPanel
        if (content.includes('{ QuickSettingsPanel }') || content.includes('{ ToolsSettings, QuickSettingsPanel }')) {
          // Replace the specific import
          content = content.replace(
            /import\s*{\s*QuickSettingsPanel\s*}\s*from\s*['"]@\/features\/settings['"]/g,
            "import { QuickSettingsPanel } from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel'"
          );
          content = content.replace(
            /import\s*{\s*ToolsSettings\s*,\s*QuickSettingsPanel\s*}\s*from\s*['"]@\/features\/settings['"]/g,
            "import { ToolsSettings } from '@/features/settings';\nimport { QuickSettingsPanel } from '@/features/chat/components/QuickSettingsPanel/QuickSettingsPanel'"
          );
          fileReplacements++;
        }
      }
      
      // Apply other mappings
      for (const [oldPath, newPath] of Object.entries(importMappings)) {
        if (oldPath === '@/features/settings') continue; // Skip this one as we handled it above
        
        const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newPath);
          fileReplacements += matches.length;
        }
      }
      
      // Write back if changes were made
      if (content !== originalContent) {
        await writeFile(file, content, 'utf8');
        console.log(`✨ Fixed ${fileReplacements} import(s) in ${path.relative(process.cwd(), file)}`);
        fixedCount++;
        totalReplacements += fileReplacements;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  // Also need to update the export in settings/index.js
  try {
    const settingsIndexPath = 'src/features/settings/index.js';
    let content = await readFile(settingsIndexPath, 'utf8');
    if (content.includes('QuickSettingsPanel')) {
      content = content.replace(/export\s*{\s*QuickSettingsPanel\s*}\s*from\s*['"]\.\/QuickSettingsPanel['"];?\n?/g, '');
      await writeFile(settingsIndexPath, content, 'utf8');
      console.log('✨ Removed QuickSettingsPanel export from settings/index.js');
    }
  } catch (error) {
    console.error('❌ Error updating settings/index.js:', error.message);
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files with a total of ${totalReplacements} import replacements!`);
}

fixMovedComponentImports().catch(console.error);