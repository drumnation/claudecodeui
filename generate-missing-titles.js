#!/usr/bin/env node

/**
 * Quick script to generate titles for sessions without them
 * Run this from the monorepo root: node generate-missing-titles.js
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Load environment variables
require('dotenv').config();

async function generateTitlesForProject(projectPath, projectName) {
  console.log(`\n📁 Checking project: ${projectName}`);
  
  try {
    const files = await fs.readdir(projectPath);
    const sessionFiles = files.filter(f => f.endsWith('.jsonl'));
    
    let needsUpdate = 0;
    
    for (const file of sessionFiles) {
      const sessionId = file.replace('.jsonl', '');
      const filePath = path.join(projectPath, file);
      
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        if (lines.length === 0) continue;
        
        // Check if has summary
        let hasGoodSummary = false;
        try {
          const firstLine = JSON.parse(lines[0]);
          if (firstLine.type === 'summary' && 
              firstLine.summary && 
              firstLine.summary !== 'No summary available' &&
              firstLine.summary !== 'New Session') {
            hasGoodSummary = true;
          }
        } catch {
          // Not a summary line
        }
        
        if (!hasGoodSummary) {
          console.log(`  ❌ ${sessionId} - No title`);
          needsUpdate++;
        } else {
          const summary = JSON.parse(lines[0]).summary;
          console.log(`  ✅ ${sessionId} - "${summary}"`);
        }
      } catch (error) {
        console.error(`  ⚠️  Error reading ${file}:`, error.message);
      }
    }
    
    if (needsUpdate > 0) {
      console.log(`\n  📊 ${needsUpdate} sessions need titles in ${projectName}`);
      console.log(`  💡 To update them, run:`);
      console.log(`     cd apps/backend && npx tsx src/modules/sessions/update-missing-titles.ts`);
    }
  } catch (error) {
    console.error(`Error reading project ${projectName}:`, error.message);
  }
}

async function main() {
  console.log('🔍 Checking Claude sessions for missing titles...\n');
  
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  console.log(`OpenAI API Key: ${hasOpenAI ? '✅ Configured' : '❌ Not set'}`);
  console.log(`Title generation will use: ${hasOpenAI ? 'GPT-3.5' : 'Pattern matching'}\n`);
  
  const projectsPath = path.join(os.homedir(), '.claude', 'projects');
  
  try {
    const projects = await fs.readdir(projectsPath, { withFileTypes: true });
    
    for (const project of projects) {
      if (project.isDirectory()) {
        await generateTitlesForProject(
          path.join(projectsPath, project.name),
          project.name
        );
      }
    }
    
    console.log('\n✨ Scan complete!');
  } catch (error) {
    console.error('Error reading projects:', error.message);
  }
}

main().catch(console.error);