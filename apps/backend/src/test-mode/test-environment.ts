import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

export interface TestEnvironmentConfig {
  tempDir: string;
  projectsDir: string;
  httpPort: number;
  wsPort: number;
  projectName: string;
  sessionId: string;
}

export async function setupTestEnvironment(): Promise<TestEnvironmentConfig> {
  const uuid = randomUUID();
  const tempDir = join(tmpdir(), `claude-test-${uuid}`);
  const projectsDir = join(tempDir, '.claude', 'projects');
  
  // Create directory structure
  await fs.mkdir(projectsDir, { recursive: true });
  
  // Find available ports
  const { httpPort, wsPort } = await getTestPorts();
  
  // Set environment variables
  process.env.TEST_MODE = '1';
  process.env.HOME = tempDir;
  process.env.PORT = httpPort.toString();
  process.env.WS_PORT = wsPort.toString();
  process.env.CLAUDE_PROJECTS_DIR = projectsDir;
  
  // Seed test data
  const { projectName, sessionId } = await seedTestData(tempDir);
  
  return {
    tempDir,
    projectsDir,
    httpPort,
    wsPort,
    projectName,
    sessionId
  };
}

export async function cleanupTestEnvironment(config: TestEnvironmentConfig): Promise<void> {
  try {
    // Remove temporary directory
    await fs.rm(config.tempDir, { recursive: true, force: true });
    
    // Reset environment variables
    delete process.env.TEST_MODE;
    delete process.env.CLAUDE_PROJECTS_DIR;
    
    // Kill any lingering processes
    try {
      execSync(`lsof -ti:${config.httpPort} | xargs kill -9`, { stdio: 'ignore' });
      execSync(`lsof -ti:${config.wsPort} | xargs kill -9`, { stdio: 'ignore' });
    } catch {
      // Ignore errors if no processes found
    }
  } catch (error) {
    console.warn('Test cleanup warning:', error);
  }
}

export async function seedTestData(tempDir: string): Promise<{ projectName: string; sessionId: string }> {
  const projectName = 'test-project';
  const projectPath = join(tempDir, 'projects', projectName);
  const claudeDir = join(tempDir, '.claude');
  const projectsDir = join(claudeDir, 'projects');
  const sessionId = 'test-session-001';
  
  // Create project directory with sample files
  await fs.mkdir(projectPath, { recursive: true });
  await fs.mkdir(join(projectPath, 'src'), { recursive: true });
  await fs.mkdir(join(projectPath, '.git'), { recursive: true });
  
  // Create sample files
  await fs.writeFile(
    join(projectPath, 'package.json'),
    JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      scripts: {
        dev: 'echo "Running dev server"',
        test: 'echo "Running tests"',
        build: 'echo "Building project"'
      }
    }, null, 2)
  );
  
  await fs.writeFile(
    join(projectPath, 'README.md'),
    '# Test Project\n\nThis is a test project for automated testing.'
  );
  
  await fs.writeFile(
    join(projectPath, 'src', 'index.js'),
    'console.log("Hello from test project");'
  );
  
  // Initialize git repo
  execSync('git init', { cwd: projectPath, stdio: 'ignore' });
  execSync('git config user.email "test@example.com"', { cwd: projectPath, stdio: 'ignore' });
  execSync('git config user.name "Test User"', { cwd: projectPath, stdio: 'ignore' });
  execSync('git add .', { cwd: projectPath, stdio: 'ignore' });
  execSync('git commit -m "Initial commit"', { cwd: projectPath, stdio: 'ignore' });
  
  // Create Claude project metadata
  const metadataPath = join(projectsDir, 'metadata.json');
  await fs.writeFile(
    metadataPath,
    JSON.stringify({
      projects: {
        [projectName]: {
          path: projectPath,
          name: projectName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }, null, 2)
  );
  
  // Create sample session
  const sessionFile = join(projectsDir, `${projectName}.jsonl`);
  const sessionData = {
    id: sessionId,
    type: 'session-created',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    summary: 'Test session for automated testing',
    messages: []
  };
  
  await fs.writeFile(sessionFile, JSON.stringify(sessionData) + '\n');
  
  // Add a sample message
  const messageData = {
    id: 'msg-001',
    type: 'message',
    role: 'user',
    content: 'Hello, Claude! This is a test message.',
    timestamp: new Date().toISOString()
  };
  
  await fs.appendFile(sessionFile, JSON.stringify(messageData) + '\n');
  
  return { projectName, sessionId };
}

export async function getTestPorts(): Promise<{ httpPort: number; wsPort: number }> {
  // Find available ports in the 9000-9999 range for testing
  const basePort = 9000 + Math.floor(Math.random() * 900);
  
  const isPortAvailable = async (port: number): Promise<boolean> => {
    try {
      execSync(`lsof -i:${port}`, { stdio: 'ignore' });
      return false;
    } catch {
      return true;
    }
  };
  
  let httpPort = basePort;
  let wsPort = basePort + 1;
  
  // Find two consecutive available ports
  while (!(await isPortAvailable(httpPort) && await isPortAvailable(wsPort))) {
    httpPort += 2;
    wsPort += 2;
    if (httpPort > 9998) {
      httpPort = 9000;
      wsPort = 9001;
    }
  }
  
  return { httpPort, wsPort };
}