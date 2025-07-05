import { LogsPanel } from '@/features/preview/LogsPanel/LogsPanel';

export default {
  title: 'Features/Preview/LogsPanel',
  component: LogsPanel,
  parameters: {
    layout: 'padded'
  }
};

const mockLogs = [
  { message: 'Server starting...', type: 'info' },
  { message: 'Listening on port 3000', type: 'info' },
  { message: 'Compiled successfully!', type: 'info' }
];

const manyLogs = Array(50).fill(null).map((_, i) => ({
  message: `[${new Date().toISOString()}] Log entry ${i + 1}: This is a sample log message with some content that might be quite long and wrap to multiple lines`,
  type: i % 10 === 0 ? 'error' : 'info'
}));

export const Default = {
  args: {
    serverLogs: mockLogs,
    onClearLogs: () => console.log('Clear logs')
  }
};

export const Empty = {
  args: {
    serverLogs: [],
    onClearLogs: () => console.log('Clear logs')
  }
};

export const WithErrors = {
  args: {
    serverLogs: [
      { message: 'Server starting...', type: 'info' },
      { message: 'ERROR: Failed to compile', type: 'error' },
      { message: 'Module not found: Can\'t resolve \'./missing-module\'', type: 'error' },
      { message: 'Compilation failed', type: 'error' }
    ],
    onClearLogs: () => console.log('Clear logs')
  }
};

export const ManyLogs = {
  args: {
    serverLogs: manyLogs,
    onClearLogs: () => console.log('Clear logs')
  }
};

export const LongMessages = {
  args: {
    serverLogs: [
      { 
        message: 'This is a very long log message that contains a lot of information and will definitely wrap to multiple lines. It might contain stack traces, detailed error information, or just verbose output from the development server.',
        type: 'info' 
      },
      { 
        message: `Error: Cannot find module './missing-module'
  at Function.Module._resolveFilename (internal/modules/cjs/loader.js:880:15)
  at Function.Module._load (internal/modules/cjs/loader.js:725:27)
  at Module.require (internal/modules/cjs/loader.js:952:19)
  at require (internal/modules/cjs/helpers.js:88:18)
  at Object.<anonymous> (/path/to/project/src/index.js:1:1)
  at Module._compile (internal/modules/cjs/loader.js:1063:30)
  at Object.Module._extensions..js (internal/modules/cjs/loader.js:1092:10)
  at Module.load (internal/modules/cjs/loader.js:928:32)
  at Function.Module._load (internal/modules/cjs/loader.js:769:14)
  at Function.executeUserEntryPoint [as runMain] (internal/modules/run_main.js:72:12)`,
        type: 'error' 
      }
    ],
    onClearLogs: () => console.log('Clear logs')
  }
};