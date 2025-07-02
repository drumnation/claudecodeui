import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

interface InjectionResult {
  success: boolean;
  file?: string;
  error?: string;
  alreadyInjected?: boolean;
}

const IMPORT_STATEMENT = "import { initBrowserConsoleCapture } from '@kit/brain-monitor/browser';";
const INIT_STATEMENT = `
// Initialize brain-monitor console capture
if (typeof window !== 'undefined') {
  initBrowserConsoleCapture();
}`;

/**
 * Check if the file already has brain-monitor imports
 */
function isAlreadyInjected(content: string): boolean {
  return content.includes('@kit/brain-monitor/browser') || 
         content.includes('initBrowserConsoleCapture');
}

/**
 * Find the best location to inject the import statement
 */
function findImportInsertionPoint(content: string): number {
  // Look for the last import statement
  const importRegex = /^import\s+.*?;$/gm;
  let lastImportIndex = -1;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    lastImportIndex = match.index + match[0].length;
  }
  
  if (lastImportIndex !== -1) {
    return lastImportIndex;
  }
  
  // If no imports found, insert at the beginning
  return 0;
}

/**
 * Find the best location to inject the initialization code
 */
function findInitInsertionPoint(content: string): number {
  // Look for function App() or const App = 
  const appComponentRegex = /(?:function\s+App\s*\(|const\s+App\s*=)/;
  const match = content.match(appComponentRegex);
  
  if (match && match.index !== undefined) {
    // Find the opening brace of the component
    const componentStart = match.index;
    const afterMatch = content.substring(componentStart);
    const braceIndex = afterMatch.indexOf('{');
    
    if (braceIndex !== -1) {
      // Insert after the opening brace
      return componentStart + braceIndex + 1;
    }
  }
  
  // Fallback: insert after imports
  return findImportInsertionPoint(content) + 1;
}

/**
 * Inject brain-monitor console capture into a React app file
 */
async function injectIntoFile(filePath: string): Promise<InjectionResult> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check if already injected
    if (isAlreadyInjected(content)) {
      return {
        success: true,
        file: filePath,
        alreadyInjected: true,
      };
    }
    
    // Find insertion points
    const importInsertPoint = findImportInsertionPoint(content);
    const initInsertPoint = findInitInsertionPoint(content);
    
    // Build the new content
    let newContent = content;
    
    // Insert import (add newline after it)
    if (importInsertPoint === 0) {
      newContent = IMPORT_STATEMENT + '\n\n' + newContent;
    } else {
      newContent = 
        newContent.slice(0, importInsertPoint) + 
        '\n' + IMPORT_STATEMENT + 
        newContent.slice(importInsertPoint);
    }
    
    // Update init insertion point after adding import
    const adjustedInitPoint = initInsertPoint + IMPORT_STATEMENT.length + 1;
    
    // Insert initialization
    newContent = 
      newContent.slice(0, adjustedInitPoint) + 
      '\n' + INIT_STATEMENT + '\n' +
      newContent.slice(adjustedInitPoint);
    
    // Write the updated content
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    return {
      success: true,
      file: filePath,
    };
  } catch (error) {
    return {
      success: false,
      file: filePath,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Auto-inject brain-monitor console capture into React apps
 */
export async function injectBrowserCapture(projectRoot: string = process.cwd()): Promise<InjectionResult[]> {
  const results: InjectionResult[] = [];
  
  // Common patterns for main React app files
  const patterns = [
    'src/App.tsx',
    'src/App.jsx',
    'src/app.tsx',
    'src/app.jsx',
    'app/App.tsx',
    'app/App.jsx',
    'apps/*/src/App.tsx',
    'apps/*/src/App.jsx',
    'packages/*/src/App.tsx',
    'packages/*/src/App.jsx',
  ];
  
  // Find all matching files
  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { 
      cwd: projectRoot,
      absolute: true,
    });
    files.push(...matches);
  }
  
  // Remove duplicates
  const uniqueFiles = [...new Set(files)];
  
  if (uniqueFiles.length === 0) {
    results.push({
      success: false,
      error: 'No App.tsx or App.jsx files found',
    });
    return results;
  }
  
  // Inject into each file
  for (const file of uniqueFiles) {
    const result = await injectIntoFile(file);
    results.push(result);
  }
  
  return results;
}

/**
 * Create an Express middleware snippet for the project
 */
export async function generateExpressMiddleware(): Promise<string> {
  return `
// Brain-Monitor Browser Logs Endpoint
// Add this to your Express app setup

import { createBrainMonitorRouter } from '@kit/brain-monitor/server';

// Add the brain-monitor routes
app.use('/_brain-monitor', createBrainMonitorRouter());
`;
}