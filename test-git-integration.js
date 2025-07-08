#!/usr/bin/env node

const { execSync } = require('child_process');
const fetch = require('node-fetch');

console.log('🧪 Git Integration Test\n');

const API_URL = 'http://localhost:8765';
const PROJECT_PATH = process.cwd();
const PROJECT_NAME = PROJECT_PATH.replace(/^\//, '').replace(/\//g, '-');

async function runTest() {
  console.log('1. Getting actual git status from command line...');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  const gitFiles = gitStatus.split('\n').filter(line => line.trim());
  console.log(`   ✅ Found ${gitFiles.length} changed files locally\n`);

  console.log('2. Calling git status API endpoint...');
  const response = await fetch(`${API_URL}/api/git/status?project=${PROJECT_NAME}`);
  const data = await response.json();
  
  const apiFileCount = 
    (data.modified?.length || 0) +
    (data.added?.length || 0) +
    (data.deleted?.length || 0) +
    (data.untracked?.length || 0) +
    (data.staged?.length || 0);

  console.log(`   📡 API returned ${apiFileCount} files`);
  console.log(`   Response:`, JSON.stringify(data, null, 2), '\n');

  console.log('3. Test Results:');
  console.log('   ' + '='.repeat(50));
  
  if (gitFiles.length === apiFileCount) {
    console.log(`   ✅ PASS: API returns correct number of files (${apiFileCount})`);
  } else {
    console.log(`   ❌ FAIL: File count mismatch!`);
    console.log(`      Expected: ${gitFiles.length} files (from git status)`);
    console.log(`      Actual: ${apiFileCount} files (from API)`);
    console.log(`\n   🐛 This indicates the backend is not properly implementing git status!`);
  }

  if (apiFileCount === 0 && gitFiles.length > 0) {
    console.log(`\n   ⚠️  WARNING: The backend appears to be returning hardcoded empty arrays!`);
    console.log(`      Check: apps/backend/src/main.ts line ~151`);
    console.log(`      The git routes are marked as "placeholder" and always return empty data.`);
  }

  console.log('\n4. Implementation Status Check:');
  
  // Check if the backend source has placeholder implementation
  try {
    const mainTs = require('fs').readFileSync('apps/backend/src/main.ts', 'utf8');
    if (mainTs.includes('// Git routes (placeholder for now)')) {
      console.log('   ⚠️  Found placeholder comment in backend code');
      console.log('   📍 Location: apps/backend/src/main.ts around line 150');
      console.log('   💡 The git functionality needs to be properly implemented');
    }
  } catch (e) {
    console.log('   Could not check backend source');
  }

  return apiFileCount === gitFiles.length;
}

runTest()
  .then(passed => {
    console.log('\n' + (passed ? '✅ Test passed!' : '❌ Test failed!'));
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  });