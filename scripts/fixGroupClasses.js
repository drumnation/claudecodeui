#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = require('glob');

async function fixGroupClasses() {
  console.log('🔍 Searching for twin.macro group class usage...\n');
  
  const styleFiles = glob.sync('src/**/*.styles.js');
  let fixedCount = 0;
  
  for (const file of styleFiles) {
    try {
      let content = await readFile(file, 'utf8');
      let originalContent = content;
      
      // Pattern 1: Fix standalone group in tw`` templates
      content = content.replace(/\$\{tw`group\s*/g, '${tw`');
      content = content.replace(/\$\{tw`(.*)group\s+/g, '${tw`$1');
      
      // Pattern 2: Fix group in multi-class templates
      content = content.replace(/\$\{tw`([^`]*)\sgroup\s+([^`]*)`\}/g, '${tw`$1 $2`}');
      content = content.replace(/\$\{tw`([^`]*)\sgroup`\}/g, '${tw`$1`}');
      
      // Pattern 3: Fix group-hover usage (should remain, but parent needs className="group")
      // This is valid, just need to ensure parent has group class
      
      // Pattern 4: Fix specific cases
      content = content.replace('${tw`group relative`}', '${tw`relative`}');
      content = content.replace('${tw`group md:group`}', '${tw``}');
      
      if (content !== originalContent) {
        await writeFile(file, content, 'utf8');
        console.log(`✨ Fixed group usage in ${path.relative(process.cwd(), file)}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} style files!`);
  
  // Now update the component files to add className="group" where needed
  console.log('\n🔍 Updating component files to add group className...\n');
  
  const componentsToUpdate = [
    {
      file: 'src/layouts/root/Sidebar/components/SessionItem/SessionItem.jsx',
      component: 'SessionContainer',
      needsGroup: true
    },
    {
      file: 'src/layouts/root/Sidebar/components/ProjectItem/ProjectItem.jsx',
      component: 'ProjectContainer',
      needsGroup: true
    }
  ];
  
  for (const { file, component, needsGroup } of componentsToUpdate) {
    try {
      let content = await readFile(file, 'utf8');
      
      // Look for the component usage and add className="group" if not present
      const regex = new RegExp(`<${component}([^>]*)>`, 'g');
      
      content = content.replace(regex, (match, attrs) => {
        if (!attrs.includes('className')) {
          return `<${component} className="group"${attrs}>`;
        } else if (!attrs.includes('group')) {
          // Add group to existing className
          return match.replace(/className="([^"]*)"/, 'className="$1 group"');
        }
        return match;
      });
      
      await writeFile(file, content, 'utf8');
      console.log(`✨ Added group className to ${path.relative(process.cwd(), file)}`);
    } catch (error) {
      console.error(`❌ Error updating ${file}:`, error.message);
    }
  }
  
  console.log('\n🎉 Group class fixes complete!');
}

fixGroupClasses().catch(console.error);