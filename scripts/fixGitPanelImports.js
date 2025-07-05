#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = require('glob');

async function fixGitPanelImports() {
  console.log('🔍 Fixing GitPanel imports...\n');
  
  // Get all JS/JSX files
  const allFiles = glob.sync('src/**/*.{js,jsx}');
  let fixedCount = 0;
  let totalReplacements = 0;
  
  for (const file of allFiles) {
    try {
      let content = await readFile(file, 'utf8');
      let originalContent = content;
      
      // Count replacements for this file
      const matches = content.match(/@\/features\/git\/GitPanel/g);
      const replacementCount = matches ? matches.length : 0;
      
      // Replace all occurrences of @/features/git/GitPanel with @/features/git
      content = content.replace(/@\/features\/git\/GitPanel/g, '@/features/git');
      
      // Write back if changes were made
      if (content !== originalContent) {
        await writeFile(file, content, 'utf8');
        console.log(`✨ Fixed ${replacementCount} import(s) in ${path.relative(process.cwd(), file)}`);
        fixedCount++;
        totalReplacements += replacementCount;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} files with a total of ${totalReplacements} import replacements!`);
}

fixGitPanelImports().catch(console.error);