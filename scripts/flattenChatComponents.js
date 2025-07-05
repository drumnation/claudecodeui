#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const CHAT_COMPONENTS_DIR = path.join(__dirname, '../src/features/chat/components');

// Components with double nested folders that need to be flattened
const componentsToFlatten = [
  'ClaudeStatus',
  'CommandMenu',
  'HintTexts',
  'MessageStates',
  'NoProjectSelected'
];

async function moveFiles(componentName) {
  const outerDir = path.join(CHAT_COMPONENTS_DIR, componentName);
  const innerDir = path.join(outerDir, componentName);
  
  try {
    // Check if the inner directory exists
    await fs.access(innerDir);
    
    // Get all files from the inner directory
    const files = await fs.readdir(innerDir);
    
    // Move each file to the outer directory
    for (const file of files) {
      const sourcePath = path.join(innerDir, file);
      const destPath = path.join(outerDir, file);
      
      // Check if it's a file (not a directory)
      const stat = await fs.stat(sourcePath);
      if (stat.isFile()) {
        await fs.rename(sourcePath, destPath);
        console.log(`Moved: ${componentName}/${componentName}/${file} -> ${componentName}/${file}`);
      }
    }
    
    // Remove the now-empty inner directory
    await fs.rmdir(innerDir);
    console.log(`Removed empty directory: ${componentName}/${componentName}/`);
    
    // Check if there's an index file in the outer directory that needs updating
    const outerIndexPath = path.join(outerDir, 'index.js');
    try {
      const indexContent = await fs.readFile(outerIndexPath, 'utf8');
      // Update the import path to remove the double nesting
      const updatedContent = indexContent.replace(
        new RegExp(`\\./${componentName}`, 'g'),
        '.'
      );
      
      if (indexContent !== updatedContent) {
        await fs.writeFile(outerIndexPath, updatedContent);
        console.log(`Updated index.js for ${componentName}`);
      }
    } catch (err) {
      // No outer index file or error reading it
    }
    
    return true;
  } catch (err) {
    console.log(`Skipping ${componentName}: ${err.message}`);
    return false;
  }
}

async function findAndUpdateImports() {
  // Find all files that might contain imports
  const findCommand = `find src -type f \\( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*"`;
  const { execSync } = require('child_process');
  
  try {
    const files = execSync(findCommand, { cwd: path.join(__dirname, '..') })
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean);
    
    console.log(`\nChecking ${files.length} files for imports to update...`);
    
    let updatedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(__dirname, '..', file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        let updated = false;
        let newContent = content;
        
        // Update imports for each flattened component
        for (const component of componentsToFlatten) {
          // Pattern 1: from '@/features/chat/components/ComponentName/ComponentName'
          const pattern1 = new RegExp(
            `@/features/chat/components/${component}/${component}`,
            'g'
          );
          if (pattern1.test(newContent)) {
            newContent = newContent.replace(pattern1, `@/features/chat/components/${component}`);
            updated = true;
          }
          
          // Pattern 2: from '../ComponentName/ComponentName'
          const pattern2 = new RegExp(
            `\\.\\./\\.\\./components/${component}/${component}`,
            'g'
          );
          if (pattern2.test(newContent)) {
            newContent = newContent.replace(pattern2, `../../components/${component}`);
            updated = true;
          }
          
          // Pattern 3: from './ComponentName/ComponentName' (for files in the components directory)
          const pattern3 = new RegExp(
            `\\./${component}/${component}`,
            'g'
          );
          if (pattern3.test(newContent)) {
            newContent = newContent.replace(pattern3, `./${component}`);
            updated = true;
          }
        }
        
        if (updated) {
          await fs.writeFile(filePath, newContent);
          updatedCount++;
          console.log(`Updated imports in: ${file}`);
        }
      } catch (err) {
        console.error(`Error processing ${file}: ${err.message}`);
      }
    }
    
    console.log(`\nUpdated imports in ${updatedCount} files`);
  } catch (err) {
    console.error('Error finding files:', err.message);
  }
}

async function main() {
  console.log('Flattening double nested component folders in chat/components...\n');
  
  // First, move all the files
  for (const component of componentsToFlatten) {
    await moveFiles(component);
  }
  
  // Then, update all imports
  await findAndUpdateImports();
  
  console.log('\nDone! All double nested folders have been flattened.');
}

main().catch(console.error);