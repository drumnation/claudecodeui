#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = require('glob');

async function fixStoryTitles() {
  console.log('🔍 Fixing story titles for consistent navigation...\n');
  
  const storyFiles = glob.sync('src/**/*.stories.{js,jsx}');
  let fixedCount = 0;
  
  // Define title mappings for consistency
  const titleMappings = {
    // Chat feature - normalize all to Features/Chat
    "'Chat/MessagesArea'": "'Features/Chat/Components/MessagesArea'",
    '"Chat/MessagesArea"': '"Features/Chat/Components/MessagesArea"',
    "'ChatInterface/ClaudeStatus'": "'Features/Chat/Components/ClaudeStatus'",
    '"ChatInterface/ClaudeStatus"': '"Features/Chat/Components/ClaudeStatus"',
    "'ChatInterface/HintTexts'": "'Features/Chat/Components/HintTexts'",
    '"ChatInterface/HintTexts"': '"Features/Chat/Components/HintTexts"',
    "'ChatInterface/InputArea'": "'Features/Chat/Components/InputArea'",
    '"ChatInterface/InputArea"': '"Features/Chat/Components/InputArea"',
    "'ChatInterface/MessageStates'": "'Features/Chat/Components/MessageStates'",
    '"ChatInterface/MessageStates"': '"Features/Chat/Components/MessageStates"',
    "'ChatInterface/ScrollToBottomButton'": "'Features/Chat/Components/ScrollToBottomButton'",
    '"ChatInterface/ScrollToBottomButton"': '"Features/Chat/Components/ScrollToBottomButton"',
    "'ChatInterface/Tools/TaskTool'": "'Features/Chat/Components/Tools/TaskTool'",
    '"ChatInterface/Tools/TaskTool"': '"Features/Chat/Components/Tools/TaskTool"',
    
    // Message tools
    "'ChatInterface/Message/AssistantMessage'": "'Features/Chat/Components/Message/AssistantMessage'",
    '"ChatInterface/Message/AssistantMessage"': '"Features/Chat/Components/Message/AssistantMessage"',
    "'ChatInterface/Message/UserMessage'": "'Features/Chat/Components/Message/UserMessage'",
    '"ChatInterface/Message/UserMessage"': '"Features/Chat/Components/Message/UserMessage"',
    "'ChatInterface/Message/Tools/BashTool'": "'Features/Chat/Components/Tools/BashTool'",
    '"ChatInterface/Message/Tools/BashTool"': '"Features/Chat/Components/Tools/BashTool"',
    "'ChatInterface/Message/Tools/DefaultTool'": "'Features/Chat/Components/Tools/DefaultTool'",
    '"ChatInterface/Message/Tools/DefaultTool"': '"Features/Chat/Components/Tools/DefaultTool"',
    "'ChatInterface/Message/Tools/EditTool'": "'Features/Chat/Components/Tools/EditTool'",
    '"ChatInterface/Message/Tools/EditTool"': '"Features/Chat/Components/Tools/EditTool"',
    "'ChatInterface/Message/Tools/ReadTool'": "'Features/Chat/Components/Tools/ReadTool'",
    '"ChatInterface/Message/Tools/ReadTool"': '"Features/Chat/Components/Tools/ReadTool"',
    "'ChatInterface/Message/Tools/TodoWriteTool'": "'Features/Chat/Components/Tools/TodoWriteTool'",
    '"ChatInterface/Message/Tools/TodoWriteTool"': '"Features/Chat/Components/Tools/TodoWriteTool"',
    "'ChatInterface/Message/Tools/WriteTool'": "'Features/Chat/Components/Tools/WriteTool'",
    '"ChatInterface/Message/Tools/WriteTool"': '"Features/Chat/Components/Tools/WriteTool"',
    
    // Files feature
    "'Features/FileTree'": "'Features/Files/FileTree'",
    '"Features/FileTree"': '"Features/Files/FileTree"',
  };
  
  for (const file of storyFiles) {
    try {
      let content = await readFile(file, 'utf8');
      let originalContent = content;
      let fileUpdated = false;
      
      // Apply each replacement
      for (const [oldTitle, newTitle] of Object.entries(titleMappings)) {
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

fixStoryTitles().catch(console.error);