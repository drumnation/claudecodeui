#!/usr/bin/env tsx
/**
 * Verification script to ensure shared @kit/testing configurations work
 * across all packages in the monorepo
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { readdirSync, statSync, existsSync } from 'fs';

interface TestResult {
  package: string;
  testType: string;
  success: boolean;
  output?: string;
  error?: string;
}

const ROOT_DIR = join(__dirname, '..');
const results: TestResult[] = [];

// Recursively find all package.json files
function findPackageJsons(dir: string, ignore: string[] = ['node_modules', 'dist', '.turbo']): string[] {
  const files: string[] = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      if (ignore.includes(entry)) continue;
      
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findPackageJsons(fullPath, ignore));
      } else if (entry === 'package.json') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return files;
}

// Find all packages with test scripts
function findTestablePackages(): string[] {
  const packageJsons = findPackageJsons(ROOT_DIR);

  return packageJsons
    .filter(packagePath => {
      const content = readFileSync(packagePath, 'utf-8');
      const pkg = JSON.parse(content);
      return pkg.scripts && Object.keys(pkg.scripts).some(s => s.includes('test'));
    })
    .map(p => p.replace('/package.json', ''));
}

// Check if package has local vitest config
function hasLocalVitestConfig(packageDir: string): boolean {
  const configFiles = ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mjs'];
  return configFiles.some(file => existsSync(join(packageDir, file)));
}

// Run test command and capture result
function runTest(packageDir: string, command: string, testType: string): TestResult {
  const packageName = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf-8')).name;
  
  console.log(`\n📦 Testing ${packageName} - ${testType}`);
  
  try {
    const output = execSync(command, {
      cwd: packageDir,
      encoding: 'utf-8',
      env: { ...process.env, FORCE_COLOR: '0' },
    });
    
    console.log(`✅ ${testType} passed`);
    return { package: packageName, testType, success: true, output };
  } catch (error: any) {
    console.error(`❌ ${testType} failed`);
    return { 
      package: packageName, 
      testType, 
      success: false, 
      error: error.message || error.toString() 
    };
  }
}

// Main verification
async function verify() {
  console.log('🔍 Finding testable packages...\n');
  
  const packages = findTestablePackages();
  console.log(`Found ${packages.length} packages with tests:\n`);
  
  for (const packageDir of packages) {
    const packageJson = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf-8'));
    const { name, scripts = {} } = packageJson;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Package: ${name}`);
    console.log(`Path: ${packageDir.replace(ROOT_DIR, '.')}`);
    
    // Check for local config
    if (hasLocalVitestConfig(packageDir)) {
      console.log('⚠️  Has local vitest.config.ts - should be removed!');
    } else {
      console.log('✅ Using shared @kit/testing configuration');
    }
    
    // Test each test script
    const testScripts = Object.entries(scripts)
      .filter(([key]) => key.includes('test') && !key.includes('watch'));
    
    for (const [scriptName, scriptCommand] of testScripts) {
      // Skip if it's just a turbo command
      if (typeof scriptCommand === 'string' && scriptCommand.includes('turbo run')) {
        continue;
      }
      
      results.push(runTest(packageDir, `pnpm run ${scriptName}`, scriptName));
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY\n');
  
  const byPackage = results.reduce((acc, r) => {
    if (!acc[r.package]) acc[r.package] = { passed: 0, failed: 0 };
    if (r.success) acc[r.package].passed++;
    else acc[r.package].failed++;
    return acc;
  }, {} as Record<string, { passed: number; failed: number }>);
  
  Object.entries(byPackage).forEach(([pkg, stats]) => {
    const icon = stats.failed === 0 ? '✅' : '❌';
    console.log(`${icon} ${pkg}: ${stats.passed} passed, ${stats.failed} failed`);
  });
  
  const totalPassed = results.filter(r => r.success).length;
  const totalFailed = results.filter(r => !r.success).length;
  
  console.log(`\n📈 Total: ${totalPassed} passed, ${totalFailed} failed`);
  
  // Show failures
  if (totalFailed > 0) {
    console.log('\n❌ FAILURES:\n');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`${r.package} - ${r.testType}:`);
        console.log(r.error?.split('\n').slice(0, 5).join('\n'));
        console.log('...\n');
      });
  }
  
  // Check for remaining vitest configs
  const remainingConfigs: string[] = [];
  
  function findVitestConfigs(dir: string): void {
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (['node_modules', 'dist', '.turbo'].includes(entry)) continue;
        
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          findVitestConfigs(fullPath);
        } else if (entry.match(/^vitest\.config\.(ts|js|mjs)$/)) {
          remainingConfigs.push(fullPath.replace(ROOT_DIR + '/', ''));
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }
  
  findVitestConfigs(ROOT_DIR);
  
  if (remainingConfigs.length > 0) {
    console.log('\n⚠️  REMAINING VITEST CONFIGS TO REMOVE:\n');
    remainingConfigs.forEach(config => {
      console.log(`  - ${config}`);
    });
  }
  
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Run verification
verify().catch(console.error);