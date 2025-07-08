#!/usr/bin/env node

/**
 * Migration script to consolidate incorrectly stored sessions
 * Moves sessions from subdirectory-based project paths to their canonical roots
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { getCanonicalProjectRoot, encodeProjectPath, decodeProjectPath } = require('../server/core/projectUtils');

const DRY_RUN = process.argv.includes('--dry-run');
const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');

console.log(`Running migration ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'}`);
console.log(`Projects directory: ${CLAUDE_PROJECTS_DIR}`);
console.log('');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJSONL(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content.trim().split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
  } catch (error) {
    console.error(`Error reading JSONL file ${filePath}:`, error.message);
    return [];
  }
}

async function writeJSONL(filePath, data) {
  const content = data.map(item => JSON.stringify(item)).join('\n');
  await fs.writeFile(filePath, content, 'utf8');
}

async function mergeSessionFiles(sourceDir, targetDir) {
  console.log(`  Merging sessions from ${sourceDir} to ${targetDir}`);
  
  // Read all session files from both directories
  const sourceFiles = await fs.readdir(sourceDir).catch(() => []);
  const targetFiles = await fs.readdir(targetDir).catch(() => []);
  
  const allSessionIds = new Set([
    ...sourceFiles.filter(f => f.endsWith('.jsonl')),
    ...targetFiles.filter(f => f.endsWith('.jsonl'))
  ]);
  
  let mergedCount = 0;
  
  for (const sessionFile of allSessionIds) {
    const sourcePath = path.join(sourceDir, sessionFile);
    const targetPath = path.join(targetDir, sessionFile);
    
    const sourceExists = await exists(sourcePath);
    const targetExists = await exists(targetPath);
    
    if (sourceExists && !targetExists) {
      // Move the file
      if (!DRY_RUN) {
        await fs.rename(sourcePath, targetPath);
      }
      console.log(`    Moved session ${sessionFile}`);
      mergedCount++;
    } else if (sourceExists && targetExists) {
      // Merge the files
      const sourceData = await readJSONL(sourcePath);
      const targetData = await readJSONL(targetPath);
      
      // Create a map to avoid duplicates (key by timestamp and type)
      const messageMap = new Map();
      
      [...targetData, ...sourceData].forEach(msg => {
        const key = `${msg.timestamp || ''}-${msg.type || ''}`;
        messageMap.set(key, msg);
      });
      
      const mergedData = Array.from(messageMap.values())
        .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));
      
      if (!DRY_RUN) {
        await writeJSONL(targetPath, mergedData);
        await fs.unlink(sourcePath);
      }
      
      console.log(`    Merged session ${sessionFile} (${sourceData.length} + ${targetData.length} = ${mergedData.length} messages)`);
      mergedCount++;
    }
  }
  
  return mergedCount;
}

async function migrateProjects() {
  try {
    // Ensure the projects directory exists
    if (!await exists(CLAUDE_PROJECTS_DIR)) {
      console.log('No Claude projects directory found. Nothing to migrate.');
      return;
    }
    
    // Get all project directories
    const entries = await fs.readdir(CLAUDE_PROJECTS_DIR, { withFileTypes: true });
    const projectDirs = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
    
    console.log(`Found ${projectDirs.length} project directories`);
    console.log('');
    
    // Track migration stats
    const stats = {
      total: projectDirs.length,
      migrated: 0,
      merged: 0,
      skipped: 0,
      errors: 0
    };
    
    // Group projects by their canonical root
    const projectGroups = new Map();
    
    for (const encodedPath of projectDirs) {
      try {
        const decodedPath = decodeProjectPath(encodedPath);
        const canonicalRoot = getCanonicalProjectRoot(decodedPath);
        const canonicalEncoded = encodeProjectPath(canonicalRoot);
        
        if (!projectGroups.has(canonicalEncoded)) {
          projectGroups.set(canonicalEncoded, []);
        }
        
        projectGroups.get(canonicalEncoded).push({
          encoded: encodedPath,
          decoded: decodedPath,
          canonical: canonicalRoot
        });
      } catch (error) {
        console.error(`Error processing ${encodedPath}:`, error.message);
        stats.errors++;
      }
    }
    
    // Process each group
    for (const [canonicalEncoded, projects] of projectGroups) {
      if (projects.length === 1 && projects[0].encoded === canonicalEncoded) {
        // Already using canonical path, skip
        stats.skipped++;
        continue;
      }
      
      console.log(`\nProcessing group with canonical root: ${projects[0].canonical}`);
      console.log(`  ${projects.length} directories to consolidate`);
      
      // Find the target directory (prefer the canonical one if it exists)
      let targetProject = projects.find(p => p.encoded === canonicalEncoded);
      if (!targetProject) {
        // Use the first one as target
        targetProject = projects[0];
      }
      
      const targetDir = path.join(CLAUDE_PROJECTS_DIR, canonicalEncoded);
      
      // Ensure target directory exists
      if (!DRY_RUN && !await exists(targetDir)) {
        await fs.mkdir(targetDir, { recursive: true });
      }
      
      // Merge all other projects into the target
      for (const project of projects) {
        if (project.encoded === canonicalEncoded) continue;
        
        const sourceDir = path.join(CLAUDE_PROJECTS_DIR, project.encoded);
        
        console.log(`  Migrating: ${project.decoded} -> ${project.canonical}`);
        
        try {
          const mergedSessions = await mergeSessionFiles(sourceDir, targetDir);
          
          // Remove the source directory if empty
          if (!DRY_RUN) {
            const remaining = await fs.readdir(sourceDir);
            if (remaining.length === 0) {
              await fs.rmdir(sourceDir);
              console.log(`    Removed empty directory: ${project.encoded}`);
            }
          }
          
          stats.migrated++;
          if (mergedSessions > 0) stats.merged++;
        } catch (error) {
          console.error(`    Error migrating ${project.encoded}:`, error.message);
          stats.errors++;
        }
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary:');
    console.log(`  Total projects: ${stats.total}`);
    console.log(`  Migrated: ${stats.migrated}`);
    console.log(`  Merged: ${stats.merged}`);
    console.log(`  Skipped (already canonical): ${stats.skipped}`);
    console.log(`  Errors: ${stats.errors}`);
    console.log('='.repeat(60));
    
    if (DRY_RUN) {
      console.log('\nThis was a DRY RUN. No changes were made.');
      console.log('Run without --dry-run to apply changes.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateProjects().catch(console.error);