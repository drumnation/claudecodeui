import { EventEmitter } from 'events';
import { Readable, Writable } from 'stream';

interface MockProcess extends EventEmitter {
  stdout: Readable;
  stderr: Readable;
  stdin: Writable;
  pid: number;
  kill: (signal?: string) => void;
}

interface StubResponse {
  delay?: number;
  response: any;
}

const STUB_RESPONSES: Record<string, StubResponse[]> & {default: StubResponse[]} = {
  default: [
    {
      delay: 100,
      response: {
        type: 'session-created',
        id: 'test-session-001',
        createdAt: new Date().toISOString()
      }
    },
    {
      delay: 200,
      response: {
        type: 'message',
        role: 'assistant',
        content: 'Hello! I\'m Claude, your AI assistant. How can I help you today?'
      }
    }
  ],
  'test message': [
    {
      delay: 100,
      response: {
        type: 'status',
        status: 'thinking'
      }
    },
    {
      delay: 500,
      response: {
        type: 'message',
        role: 'assistant',
        content: 'This is a test response from the stubbed Claude CLI.'
      }
    }
  ],
  'use tool': [
    {
      delay: 100,
      response: {
        type: 'tool-use',
        name: 'Read',
        parameters: {
          file_path: '/test/file.txt'
        }
      }
    },
    {
      delay: 200,
      response: {
        type: 'tool-result',
        result: 'File contents: Hello World'
      }
    },
    {
      delay: 300,
      response: {
        type: 'message',
        role: 'assistant',
        content: 'I\'ve read the file. It contains: "Hello World"'
      }
    }
  ],
  'error test': [
    {
      delay: 100,
      response: {
        type: 'error',
        error: 'Simulated error for testing'
      }
    }
  ]
};

export function createStubClaudeProcess(): MockProcess {
  const stdout = new Readable({
    read() {}
  });
  
  const stderr = new Readable({
    read() {}
  });
  
  const stdin = new Writable({
    write(chunk, encoding, callback) {
      const input = chunk.toString().trim();
      const responses = getResponsesForInput(input);
      
      // Emit responses with delays
      responses.forEach((stubResponse, index) => {
        setTimeout(() => {
          stdout.push(JSON.stringify(stubResponse.response) + '\n');
          
          // End session after last response
          if (index === responses.length - 1) {
            setTimeout(() => {
              stdout.push(JSON.stringify({ type: 'session-ended' }) + '\n');
              mockProcess.emit('exit', 0);
            }, 100);
          }
        }, stubResponse.delay || 0);
      });
      
      callback();
    }
  });
  
  const mockProcess = new EventEmitter() as MockProcess;
  mockProcess.stdout = stdout;
  mockProcess.stderr = stderr;
  mockProcess.stdin = stdin;
  mockProcess.pid = Math.floor(Math.random() * 10000);
  
  mockProcess.kill = (signal?: string) => {
    stdout.push(JSON.stringify({ type: 'session-aborted' }) + '\n');
    mockProcess.emit('exit', signal === 'SIGKILL' ? 137 : 0);
  };
  
  // Emit initial session created event
  setTimeout(() => {
    stdout.push(JSON.stringify({
      type: 'session-created',
      id: `test-session-${Date.now()}`,
      createdAt: new Date().toISOString()
    }) + '\n');
  }, 50);
  
  return mockProcess;
}

function getResponsesForInput(input: string): StubResponse[] {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('test')) {
    return STUB_RESPONSES['test message'] || STUB_RESPONSES.default;
  }
  
  if (lowerInput.includes('tool') || lowerInput.includes('read') || lowerInput.includes('file')) {
    return STUB_RESPONSES['use tool'] || STUB_RESPONSES.default;
  }
  
  if (lowerInput.includes('error') || lowerInput.includes('fail')) {
    return STUB_RESPONSES['error test'] || STUB_RESPONSES.default;
  }
  
  return STUB_RESPONSES.default;
}

export function stubSlashCommands(): string[] {
  return [
    '/help - Show available commands',
    '/clear - Clear the conversation',
    '/exit - Exit the session',
    '/save - Save the conversation',
    '/load - Load a saved conversation',
    '/model - Change the model',
    '/context - Manage context',
    '/tools - Manage available tools'
  ];
}

export async function stubSessionSummary(messages: any[]): Promise<string> {
  // Return deterministic summaries based on message content
  if (messages.length === 0) {
    return 'Empty session';
  }
  
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (firstUserMessage) {
    const content = firstUserMessage.content.toLowerCase();
    
    if (content.includes('test')) {
      return 'Testing Claude CLI integration';
    }
    
    if (content.includes('file') || content.includes('read')) {
      return 'File operations testing';
    }
    
    if (content.includes('git')) {
      return 'Git workflow testing';
    }
    
    if (content.includes('build') || content.includes('dev')) {
      return 'Development server testing';
    }
    
    // Default: use first 50 chars of the message
    return firstUserMessage.content.substring(0, 50) + '...';
  }
  
  return 'Claude conversation';
}

// Export a function to replace the real service methods when in test mode
export function applyTestModeStubs(app: any): void {
  if (process.env.TEST_MODE !== '1') {
    return;
  }
  
  // Override the Claude CLI service
  const claudeCliService = {
    createClaudeProcess: createStubClaudeProcess,
    getSlashCommands: stubSlashCommands,
    generateSessionSummary: stubSessionSummary
  };
  
  // Apply the stubs (this will be integrated with the actual service injection)
  app.locals.claudeCliService = claudeCliService;
}