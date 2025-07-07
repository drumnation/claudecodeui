import { BASE_URL } from './setup.js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Create axios instance with defaults
export const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true // Don't throw on any status
});

// Test data directory
export const TEST_DATA_DIR = path.join(os.tmpdir(), 'claude-contract-tests');

// Backup of original Claude data
let claudeBackup = null;

// Initialize test environment
export async function initTestEnvironment() {
  // Create test data directory
  await fs.mkdir(TEST_DATA_DIR, { recursive: true });
  
  // Backup existing Claude data
  const claudeDir = path.join(os.homedir(), '.claude');
  const backupDir = path.join(TEST_DATA_DIR, '.claude-backup');
  
  try {
    // Check if .claude exists and back it up
    await fs.access(claudeDir);
    await fs.cp(claudeDir, backupDir, { recursive: true });
    claudeBackup = backupDir;
  } catch (e) {
    // No existing .claude directory
  }
  
  // Create test Claude directory structure
  await fs.mkdir(claudeDir, { recursive: true });
  await fs.mkdir(path.join(claudeDir, 'projects'), { recursive: true });
}

// Cleanup test environment
export async function cleanupTestEnvironment() {
  try {
    // Clean test Claude directory
    const claudeDir = path.join(os.homedir(), '.claude');
    await fs.rm(claudeDir, { recursive: true, force: true });
    
    // Restore backup if exists
    if (claudeBackup) {
      await fs.cp(claudeBackup, claudeDir, { recursive: true });
    }
    
    // Clean test data directory
    await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
    console.error('Cleanup error:', error);
  }
}

// Create a test project directory
export async function createTestProject(name, options = {}) {
  const projectPath = path.join(TEST_DATA_DIR, name);
  await fs.mkdir(projectPath, { recursive: true });
  
  // Add package.json if requested
  if (options.language === 'javascript' || options.packageJson) {
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify({
        name: options.displayName || name,
        version: '1.0.0',
        description: 'Test project'
      }, null, 2)
    );
  }
  
  // Add other language files
  if (options.language === 'python') {
    await fs.writeFile(
      path.join(projectPath, 'pyproject.toml'),
      `[tool.poetry]\nname = "${options.displayName || name}"\nversion = "0.1.0"\n`
    );
  }
  
  if (options.language === 'rust') {
    await fs.writeFile(
      path.join(projectPath, 'Cargo.toml'),
      `[package]\nname = "${options.displayName || name}"\nversion = "0.1.0"\n`
    );
  }
  
  // Initialize git if requested
  if (options.git) {
    const { execSync } = await import('child_process');
    execSync('git init', { cwd: projectPath });
    execSync('git config user.email "test@example.com"', { cwd: projectPath });
    execSync('git config user.name "Test User"', { cwd: projectPath });
  }
  
  return projectPath;
}

// Create a test session
export async function createTestSession(projectName, sessionId, messages = []) {
  const claudeDir = path.join(os.homedir(), '.claude');
  const projectDir = path.join(claudeDir, 'projects', projectName.replace(/\//g, '-'));
  const sessionsDir = path.join(projectDir, 'sessions', sessionId);
  
  await fs.mkdir(sessionsDir, { recursive: true });
  
  // Write conversation file
  if (messages.length > 0) {
    const conversationPath = path.join(sessionsDir, 'conversation.jsonl');
    const content = messages.map(msg => JSON.stringify(msg)).join('\n');
    await fs.writeFile(conversationPath, content);
  }
  
  // Add to sessions.jsonl
  const sessionsFile = path.join(projectDir, 'sessions.jsonl');
  const sessionData = {
    id: sessionId,
    summary: `Test session ${sessionId}`,
    messageCount: messages.length,
    created: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
  
  try {
    const existing = await fs.readFile(sessionsFile, 'utf8');
    await fs.writeFile(sessionsFile, existing + '\n' + JSON.stringify(sessionData));
  } catch {
    await fs.writeFile(sessionsFile, JSON.stringify(sessionData));
  }
  
  return sessionData;
}

// Compare responses for compatibility
export function compareResponses(expected, actual, path = '') {
  const differences = [];
  
  // Handle null/undefined
  if (expected === null || expected === undefined) {
    if (actual !== expected) {
      differences.push({
        path,
        expected,
        actual,
        type: 'value'
      });
    }
    return differences;
  }
  
  // Handle arrays
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      differences.push({
        path,
        expected: 'array',
        actual: typeof actual,
        type: 'type'
      });
      return differences;
    }
    
    // Don't check array length for dynamic data
    if (!path.includes('sessions') && expected.length !== actual.length) {
      differences.push({
        path: `${path}.length`,
        expected: expected.length,
        actual: actual.length,
        type: 'length'
      });
    }
    
    // Check each element
    const minLength = Math.min(expected.length, actual.length);
    for (let i = 0; i < minLength; i++) {
      differences.push(...compareResponses(expected[i], actual[i], `${path}[${i}]`));
    }
    
    return differences;
  }
  
  // Handle objects
  if (typeof expected === 'object') {
    if (typeof actual !== 'object' || actual === null) {
      differences.push({
        path,
        expected: 'object',
        actual: typeof actual,
        type: 'type'
      });
      return differences;
    }
    
    // Check all expected keys exist
    for (const key of Object.keys(expected)) {
      if (!(key in actual)) {
        differences.push({
          path: `${path}.${key}`,
          expected: 'exists',
          actual: 'missing',
          type: 'key'
        });
      } else {
        differences.push(...compareResponses(expected[key], actual[key], `${path}.${key}`));
      }
    }
    
    // Check for unexpected keys (warning only)
    for (const key of Object.keys(actual)) {
      if (!(key in expected)) {
        differences.push({
          path: `${path}.${key}`,
          expected: 'not present',
          actual: 'exists',
          type: 'extra_key',
          severity: 'warning'
        });
      }
    }
    
    return differences;
  }
  
  // Handle primitives
  if (expected !== actual) {
    // Special handling for dynamic values
    if (path.includes('lastActivity') || path.includes('created')) {
      // Just check it's a valid date
      if (!isNaN(Date.parse(actual))) {
        return differences;
      }
    }
    
    differences.push({
      path,
      expected,
      actual,
      type: 'value'
    });
  }
  
  return differences;
}

// Record test results
export async function recordTestResult(testName, endpoint, expected, actual, differences) {
  const resultDir = path.join('./results', process.env.SERVER_TYPE || 'current');
  await fs.mkdir(resultDir, { recursive: true });
  
  const result = {
    testName,
    endpoint,
    timestamp: new Date().toISOString(),
    serverType: process.env.SERVER_TYPE || 'current',
    passed: differences.filter(d => d.severity !== 'warning').length === 0,
    differences,
    expected,
    actual
  };
  
  const filename = path.join(resultDir, `${testName.replace(/\s+/g, '-')}.json`);
  await fs.writeFile(filename, JSON.stringify(result, null, 2));
  
  return result;
}