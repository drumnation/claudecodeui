#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fetch = require('node-fetch');

console.log('🧪 Git Endpoint Test Suite\n');

// Test configuration
const API_URL = 'http://localhost:8765';
const PROJECT_PATH = process.cwd();
const PROJECT_NAME = PROJECT_PATH.replace(/^\//, '').replace(/\//g, '-');

console.log('📍 Current directory:', PROJECT_PATH);
console.log('📦 Encoded project name:', PROJECT_NAME);

// Test 1: Verify git status locally
console.log('\n1️⃣ Local Git Status Check:');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  const lines = gitStatus.split('\n').filter(line => line.trim());
  console.log(`   ✅ Found ${lines.length} changed files`);
  
  // Show first 5 files
  console.log('   Sample files:');
  lines.slice(0, 5).forEach(line => {
    const status = line.substring(0, 2);
    const file = line.substring(3);
    console.log(`     ${status} ${file}`);
  });
} catch (error) {
  console.log('   ❌ Error running git status:', error.message);
}

// Test 2: Test various project name encodings
console.log('\n2️⃣ Testing Different Project Encodings:');
const encodings = [
  { name: 'Standard', value: PROJECT_NAME },
  { name: 'With leading dash', value: '-' + PROJECT_NAME },
  { name: 'URL encoded', value: encodeURIComponent(PROJECT_NAME) },
  { name: 'Lowercase', value: PROJECT_NAME.toLowerCase() },
  { name: 'Mixed case (dev)', value: PROJECT_NAME.replace('Dev', 'dev') }
];

async function testEncoding(encoding) {
  const url = `${API_URL}/api/git/status?project=${encoding.value}`;
  console.log(`\n   Testing ${encoding.name}: ${encoding.value}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    // Count total files
    const fileCount = (data.modified?.length || 0) + 
                     (data.added?.length || 0) + 
                     (data.deleted?.length || 0) + 
                     (data.untracked?.length || 0) +
                     (data.staged?.length || 0);
    
    console.log(`   📊 Total files found: ${fileCount}`);
    
    return { encoding: encoding.name, success: fileCount > 0, data };
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
    return { encoding: encoding.name, success: false, error: error.message };
  }
}

// Test 3: Direct backend health check
console.log('\n3️⃣ Backend Health Check:');
async function checkBackend() {
  try {
    // Check if we can reach the backend
    const response = await fetch(`${API_URL}/api/projects`);
    if (response.ok) {
      const projects = await response.json();
      console.log(`   ✅ Backend is responding`);
      console.log(`   📁 Found ${projects.length} projects`);
      
      // Find current project
      const currentProject = projects.find(p => 
        p.fullPath === PROJECT_PATH || 
        p.name === PROJECT_NAME ||
        p.name === PROJECT_NAME.replace('Dev', 'dev')
      );
      
      if (currentProject) {
        console.log(`   ✅ Current project found:`, currentProject.name);
        console.log(`      Full path:`, currentProject.fullPath);
      } else {
        console.log(`   ⚠️  Current project not found in projects list`);
        console.log(`   Available project names:`);
        projects.slice(0, 5).forEach(p => {
          console.log(`     - ${p.name} -> ${p.fullPath}`);
        });
      }
    } else {
      console.log(`   ❌ Backend returned status ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Cannot reach backend:`, error.message);
  }
}

// Test 4: Check git executable directly
console.log('\n4️⃣ Git Executable Test:');
async function testGitExecutable() {
  try {
    // Test if git is accessible
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    console.log(`   ✅ Git found: ${gitVersion}`);
    
    // Test git status in project directory
    const statusInProject = execSync('git status --porcelain', { 
      cwd: PROJECT_PATH,
      encoding: 'utf8' 
    });
    const filesInProject = statusInProject.split('\n').filter(line => line.trim()).length;
    console.log(`   ✅ Git status in project: ${filesInProject} files`);
    
    // Test with the resolved path that backend might use
    const resolvedPath = path.resolve(PROJECT_PATH);
    const statusInResolved = execSync('git status --porcelain', { 
      cwd: resolvedPath,
      encoding: 'utf8' 
    });
    const filesInResolved = statusInResolved.split('\n').filter(line => line.trim()).length;
    console.log(`   ✅ Git status in resolved path (${resolvedPath}): ${filesInResolved} files`);
    
  } catch (error) {
    console.log(`   ❌ Git test failed:`, error.message);
  }
}

// Run all tests
async function runTests() {
  await checkBackend();
  await testGitExecutable();
  
  console.log('\n📋 Testing endpoint with different encodings...');
  const results = [];
  for (const encoding of encodings) {
    const result = await testEncoding(encoding);
    results.push(result);
  }
  
  console.log('\n📊 Summary:');
  console.log('==================');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.encoding}: ${result.success ? 'Found files' : 'No files found'}`);
  });
  
  // Test 5: Raw HTTP request to debug
  console.log('\n5️⃣ Raw HTTP Request Test:');
  const http = require('http');
  const url = new URL(`${API_URL}/api/git/status?project=${PROJECT_NAME}`);
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: 'GET'
  };
  
  console.log(`   Request URL: ${url.toString()}`);
  console.log(`   Request options:`, options);
  
  const req = http.request(options, (res) => {
    console.log(`   Response status: ${res.statusCode}`);
    console.log(`   Response headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`   Response body:`, data);
    });
  });
  
  req.on('error', (error) => {
    console.log(`   ❌ Request error:`, error.message);
  });
  
  req.end();
}

runTests().catch(console.error);