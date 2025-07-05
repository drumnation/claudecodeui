#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function fixImports() {
  const files = [
    'src/features/chat/components/MessageStates/MessageStates.stories.jsx',
    'src/features/chat/components/MessageStates/MessageStates.jsx',
    'src/features/chat/components/NoProjectSelected/NoProjectSelected.stories.jsx',
    'src/features/chat/components/NoProjectSelected/NoProjectSelected.jsx',
    'src/features/chat/components/ClaudeStatus/ClaudeStatus.stories.jsx',
    'src/features/chat/components/ClaudeStatus/ClaudeStatus.hook.js',
    'src/features/chat/components/ClaudeStatus/ClaudeStatus.jsx',
    'src/features/chat/components/CommandMenu/CommandMenu.jsx',
    'src/features/chat/components/CommandMenu/CommandMenu.stories.jsx',
    'src/features/chat/components/HintTexts/HintTexts.jsx',
    'src/features/chat/components/HintTexts/HintTexts.stories.jsx'
  ];

  const componentsToFix = [
    'ClaudeStatus',
    'CommandMenu',
    'HintTexts',
    'MessageStates',
    'NoProjectSelected'
  ];

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let updated = false;

      for (const component of componentsToFix) {
        // Fix imports like: from '@/features/chat/components/Component/Component'
        const pattern = new RegExp(
          `from\\s+['"]@/features/chat/components/${component}/${component}['"]`,
          'g'
        );
        if (pattern.test(content)) {
          content = content.replace(pattern, `from '@/features/chat/components/${component}'`);
          updated = true;
        }

        // Fix imports like: from './Component/Component'
        const relativePattern = new RegExp(
          `from\\s+['"]\\./${component}/${component}['"]`,
          'g'
        );
        if (relativePattern.test(content)) {
          content = content.replace(relativePattern, `from './${component}'`);
          updated = true;
        }

        // Fix imports like: import Component from './Component/Component/Component'
        const selfImportPattern = new RegExp(
          `from\\s+['"]\\./${component}/${component}/${component}['"]`,
          'g'
        );
        if (selfImportPattern.test(content)) {
          content = content.replace(selfImportPattern, `from './${component}'`);
          updated = true;
        }

        // Fix default imports within the component itself
        const defaultImportPattern = new RegExp(
          `import\\s+${component}\\s+from\\s+['"]@/features/chat/components/${component}/${component}['"]`,
          'g'
        );
        if (defaultImportPattern.test(content)) {
          content = content.replace(
            defaultImportPattern,
            `import ${component} from '@/features/chat/components/${component}'`
          );
          updated = true;
        }
      }

      if (updated) {
        await fs.writeFile(filePath, content);
        console.log(`Fixed imports in: ${file}`);
      }
    } catch (err) {
      console.error(`Error processing ${file}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('Fixing remaining double nested imports...\n');
  await fixImports();
  console.log('\nDone!');
}

main().catch(console.error);