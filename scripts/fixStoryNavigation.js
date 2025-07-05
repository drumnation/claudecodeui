#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = require('glob');

async function fixStoryNavigation() {
  console.log('🔍 Consolidating story navigation structure...\n');
  
  const storyFiles = glob.sync('src/**/*.stories.{js,jsx}');
  let fixedCount = 0;
  
  for (const file of storyFiles) {
    try {
      let content = await readFile(file, 'utf8');
      let originalContent = content;
      
      // Find the title line
      const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
      if (!titleMatch) continue;
      
      const currentTitle = titleMatch[1];
      let newTitle = currentTitle;
      
      // Consolidate Chat stories
      if (currentTitle.startsWith('Chat/') && !currentTitle.startsWith('Features/Chat/')) {
        // Chat/MessagesArea -> Features/Chat/Components/MessagesArea
        const component = currentTitle.substring(5); // Remove 'Chat/'
        newTitle = `Features/Chat/Components/${component}`;
      }
      
      // Consolidate ChatInterface stories
      else if (currentTitle.startsWith('ChatInterface/') && !currentTitle.startsWith('Features/Chat/')) {
        // ChatInterface/ClaudeStatus -> Features/Chat/Components/ClaudeStatus
        // ChatInterface/Message/Tools/BashTool -> Features/Chat/Components/Message/Tools/BashTool
        const component = currentTitle.substring(14); // Remove 'ChatInterface/'
        newTitle = `Features/Chat/Components/${component}`;
      }
      
      // Fix FileTree
      else if (currentTitle === 'Features/FileTree') {
        newTitle = 'Features/Files/FileTree';
      }
      
      // Update the content if title changed
      if (newTitle !== currentTitle) {
        const oldTitleString = `title: '${currentTitle}'`;
        const newTitleString = `title: '${newTitle}'`;
        
        content = content.replace(oldTitleString, newTitleString);
        
        // Also handle double quotes
        const oldTitleStringDouble = `title: "${currentTitle}"`;
        const newTitleStringDouble = `title: "${newTitle}"`;
        content = content.replace(oldTitleStringDouble, newTitleStringDouble);
        
        if (content !== originalContent) {
          await writeFile(file, content, 'utf8');
          console.log(`✨ Updated: ${path.relative(process.cwd(), file)}`);
          console.log(`   ${currentTitle} → ${newTitle}`);
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} story files!`);
  console.log('\n📁 Expected navigation structure:');
  console.log('   - App');
  console.log('   - Features');
  console.log('     - Chat (all chat-related stories)');
  console.log('     - Files');
  console.log('     - Git'); 
  console.log('     - Preview');
  console.log('     - Projects');
  console.log('     - Settings');
  console.log('     - Terminal');
  console.log('   - Layouts');
  console.log('   - Shared Components');
}

fixStoryNavigation().catch(console.error);