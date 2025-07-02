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
import {createLogger} from '@kit/logger/node';
import {setupRoutes} from './infra/http/routes.js';
import {createChatHandler} from './modules/claude-cli/index.js';
import {createShellHandler} from './modules/shell/index.js';
import {createProjectsWatcher} from './modules/projects/index.js';

// Test mode imports (lazy loaded)
let testEnvironment: any;
let claudeCliStub: any;

async function bootstrap() {
  // Load environment first
  const envResult = loadEnvironment({
    appName: 'claudecodeui-backend',
    debug: process.env['NODE_ENV'] === 'development',
  });

  // Create root logger after environment is loaded
  const logger = createLogger({
    scope: 'claudecodeui-backend',
    level: process.env.LOG_LEVEL || 'info',
  });

  logger.info('Bootstrap starting...');
  
  // Check for test mode
  if (process.env.TEST_MODE === '1') {
    logger.info('TEST MODE DETECTED - Loading test stubs...');
    testEnvironment = await import('./test-mode/test-environment.js');
    claudeCliStub = await import('./test-mode/claude-cli-stub.js');
  }

  logger.info('Environment loaded', { loadedPaths: envResult.loadedPaths });

  const PORT = parseInt(process.env['PORT'] || '8765', 10);
  const HOST = '0.0.0.0';
  logger.info('Configuration', { 
    port: PORT, 
    host: HOST, 
    testMode: process.env.TEST_MODE || 'disabled' 
  });

  // Create Express app
  const app = createExpressApp();
  logger.debug('Express app created');

  const corsOptions = createCorsOptions(logger);
  applyMiddleware(app, corsOptions, logger);
  logger.debug('Middleware applied');

  // Create HTTP server
  const server = createHttpServer(app);
  logger.debug('HTTP server created');

  // Create WebSocket server
  const wss = createWebSocketServer({server});
  const connectedClients = createConnectedClientsSet();
  logger.debug('WebSocket server created');

  // Setup WebSocket handlers
  const chatHandler = createChatHandler(connectedClients, logger.child({scope: 'chat-ws'}));
  const shellHandler = createShellHandler(logger.child({scope: 'shell-ws'}));
  
  // Apply test mode stubs if enabled
  if (process.env.TEST_MODE === '1' && claudeCliStub) {
    logger.info('Applying test mode stubs to handlers...');
    claudeCliStub.applyTestModeStubs(app);
  }
  
  const wsHandlers = new Map([
    ['/ws', chatHandler],
    ['/shell', shellHandler],
  ]);
  logger.debug('WebSocket handlers map created');

  const connectionRouter = createConnectionRouter(wsHandlers, logger);
  wss.on('connection', connectionRouter);
  logger.debug('WebSocket connection router attached');

  // Add a simple test route directly
  app.get('/test', (req, res) => {
    res.json({message: 'Server is working!'});
  });

  // Setup HTTP routes
  setupRoutes(app, {connectedClients});
  logger.debug('HTTP routes setup complete');

  // Start server
  logger.info('Starting server...');
  try {
    const serverInfo = await startServer(server, {
      port: PORT,
      host: HOST,
      corsOptions,
    }, logger);
    logger.info('Server started successfully', { ...serverInfo });

    logger.info(`Claude Code UI server running on http://${HOST}:${PORT}`);
    logger.info(`Network access: http://${serverInfo.networkIP}:${PORT}`);

    // Setup file system watcher (disabled in test mode)
    if (process.env.TEST_MODE !== '1') {
      logger.info('Setting up project watcher...');
      createProjectsWatcher(connectedClients, logger.child({scope: 'projects-watcher'}));
    } else {
      logger.info('Project watcher disabled in test mode');
    }
    logger.info('Bootstrap complete!');
  } catch (error) {
    logger.error('Failed to start server:', { error });
    throw error;
  }
}

// Start the application
bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
