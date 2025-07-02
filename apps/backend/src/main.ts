import {
  createExpressApp,
  createHttpServer,
  startServer,
  applyMiddleware,
  createCorsOptions,
  getNetworkIP,
} from './infra/http/index.js';
import {
  createWebSocketServer,
  createConnectedClientsSet,
  createConnectionRouter,
} from './infra/websocket/index.js';
import {loadEnvironment} from '@kit/env-loader/node';
import {setupRoutes} from './infra/http/routes.js';
import {createChatHandler} from './modules/claude-cli/index.js';
import {createShellHandler} from './modules/shell/index.js';
import {createProjectsWatcher} from './modules/projects/index.js';

// Test mode imports (lazy loaded)
let testEnvironment: any;
let claudeCliStub: any;

async function bootstrap() {
  console.log('1. Bootstrap starting...');
  
  // Check for test mode
  if (process.env.TEST_MODE === '1') {
    console.log('TEST MODE DETECTED - Loading test stubs...');
    testEnvironment = await import('./test-mode/test-environment.js');
    claudeCliStub = await import('./test-mode/claude-cli-stub.js');
  }

  // Load environment
  const envResult = loadEnvironment({
    appName: 'claudecodeui-backend',
    debug: process.env['NODE_ENV'] === 'development',
  });
  console.log('2. Environment loaded', envResult.loadedPaths);

  const PORT = parseInt(process.env['PORT'] || '8765', 10);
  const HOST = '0.0.0.0';
  console.log(`3. Config: PORT=${PORT}, HOST=${HOST}, TEST_MODE=${process.env.TEST_MODE || 'disabled'}`);

  // Create Express app
  const app = createExpressApp();
  console.log('4. Express app created');

  const corsOptions = createCorsOptions();
  applyMiddleware(app, corsOptions);
  console.log('5. Middleware applied');

  // Create HTTP server
  const server = createHttpServer(app);
  console.log('6. HTTP server created');

  // Create WebSocket server
  const wss = createWebSocketServer({server});
  const connectedClients = createConnectedClientsSet();
  console.log('7. WebSocket server created');

  // Setup WebSocket handlers
  const chatHandler = createChatHandler(connectedClients);
  const shellHandler = createShellHandler();
  
  // Apply test mode stubs if enabled
  if (process.env.TEST_MODE === '1' && claudeCliStub) {
    console.log('Applying test mode stubs to handlers...');
    claudeCliStub.applyTestModeStubs(app);
  }
  
  const wsHandlers = new Map([
    ['/ws', chatHandler],
    ['/shell', shellHandler],
  ]);
  console.log('8. WebSocket handlers map created');

  const connectionRouter = createConnectionRouter(wsHandlers);
  wss.on('connection', connectionRouter);
  console.log('9. WebSocket connection router attached');

  // Add a simple test route directly
  app.get('/test', (req, res) => {
    res.json({message: 'Server is working!'});
  });

  // Setup HTTP routes
  setupRoutes(app, {connectedClients});
  console.log('10. HTTP routes setup complete');

  // Start server
  console.log('11. Starting server...');
  try {
    const serverInfo = await startServer(server, {
      port: PORT,
      host: HOST,
      corsOptions,
    });
    console.log('12. Server started successfully:', serverInfo);

    console.log(`Claude Code UI server running on http://${HOST}:${PORT}`);
    console.log(`Network access: http://${serverInfo.networkIP}:${PORT}`);

    // Setup file system watcher (disabled in test mode)
    if (process.env.TEST_MODE !== '1') {
      console.log('13. Setting up project watcher...');
      createProjectsWatcher(connectedClients);
    } else {
      console.log('13. Project watcher disabled in test mode');
    }
    console.log('14. Bootstrap complete!');
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
}

// Start the application
bootstrap().catch(console.error);
