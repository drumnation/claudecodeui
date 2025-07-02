# @kit/logger

A universal, lightweight logging library for the monorepo with automatic environment detection, structured logging, and React integration.

## Features

- 🌍 **Universal**: Works in both Node.js and browser environments
- 🎯 **Scoped Logging**: Create child loggers with specific scopes
- 📊 **Structured Data**: Log with metadata and context
- ⚛️ **React Integration**: Hooks and context for React apps
- 🎨 **Pretty Formatting**: Colored output in development
- 🔌 **Extensible**: Custom transports for different outputs
- 🚀 **Zero Dependencies**: Lightweight and fast
- 📝 **TypeScript**: Full type safety

## Installation

```bash
pnpm add @kit/logger
```

## Quick Start

### Node.js

```typescript
import { defaultLogger, createLogger } from '@kit/logger';

// Use the default logger
defaultLogger.info('Server started', { port: 3000 });

// Or create a custom logger
const logger = createLogger({
  level: 'debug',
  isDevelopment: true,
});

// Create scoped loggers
const dbLogger = logger.child('database');
dbLogger.debug('Connecting to database', { host: 'localhost' });
```

### Browser

```typescript
import { defaultLogger } from '@kit/logger';

// Automatically uses browser-appropriate formatting
defaultLogger.info('App initialized');
defaultLogger.error('API request failed', { 
  endpoint: '/api/users',
  status: 500 
});
```

### React

```tsx
import { LoggerProvider, useLogger } from '@kit/logger';

// Wrap your app
function App() {
  return (
    <LoggerProvider level="debug" isDevelopment={import.meta.env.DEV}>
      <YourApp />
    </LoggerProvider>
  );
}

// Use in components
function TodoList() {
  const logger = useLogger('TodoList');
  
  const handleAdd = (todo: Todo) => {
    logger.info('Adding todo', { id: todo.id });
  };
  
  return <div>...</div>;
}
```

## Configuration

### Environment Variables

The logger automatically reads log levels from environment variables:

```bash
# Node.js
LOG_LEVEL=debug

# Browser (Vite)
VITE_LOG_LEVEL=debug
```

### Log Levels

Available log levels (from highest to lowest priority):
- `error`: Error messages
- `warn`: Warning messages
- `info`: Informational messages
- `debug`: Debug messages

Only messages at or above the configured level will be logged.

### Logger Options

```typescript
interface LoggerOptions {
  level?: LogLevel;        // Minimum log level (default: 'info')
  isDevelopment?: boolean; // Enable pretty formatting (default: auto-detected)
  scope?: string;          // Logger scope/namespace
  transports?: LoggerTransport[]; // Custom output handlers
}
```

## API Reference

### Core Methods

```typescript
// Log at different levels
logger.error('Error message', { code: 'ERR_001' });
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug message', { details: { ... } });

// Create scoped logger
const apiLogger = logger.child('api');

// Check if level is enabled
if (logger.isLevelEnabled('debug')) {
  // Expensive debug operation
}

// Change log level at runtime
logger.setLevel('warn');
```

### React Hooks

```typescript
// Get scoped logger
const logger = useLogger('ComponentName');

// Access root logger
const { logger } = useLoggerContext();
```

### Error Boundary

```tsx
<LoggerBoundary fallback={<ErrorFallback />} scope="AppErrors">
  <YourApp />
</LoggerBoundary>
```

## Migration Guide

### From console.log

```typescript
// Before
console.log('User logged in', userId);
console.error('Failed to save', error);

// After
logger.info('User logged in', { userId });
logger.error('Failed to save', { error });
```

### Benefits of Migration

1. **Structured Data**: Metadata is properly formatted
2. **Filtering**: Control what gets logged via levels
3. **Consistency**: Same API in all environments
4. **Performance**: Logs can be disabled in production
5. **Searchability**: Scoped logs are easier to find

## Advanced Usage

### Custom Transports

```typescript
const customTransport: LoggerTransport = {
  name: 'sentry',
  log(entry: LogEntry) {
    if (entry.level === 'error') {
      Sentry.captureException(new Error(entry.message), {
        extra: entry.data,
      });
    }
  },
};

const logger = createLogger({
  transports: [customTransport],
});
```

### Production Considerations

```typescript
// Disable debug logs in production
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  isDevelopment: process.env.NODE_ENV !== 'production',
});
```

### Performance Tips

1. **Check Level First**: For expensive operations
   ```typescript
   if (logger.isLevelEnabled('debug')) {
     const debugData = computeExpensiveDebugInfo();
     logger.debug('Debug info', debugData);
   }
   ```

2. **Use Scoped Loggers**: Easier filtering and debugging
   ```typescript
   const logger = defaultLogger.child('MyModule');
   ```

3. **Avoid Large Objects**: In production environments
   ```typescript
   // Good
   logger.info('User action', { userId, action });
   
   // Avoid in production
   logger.debug('Full state', { entireReduxState });
   ```

## Examples

### API Server

```typescript
import { createLogger } from '@kit/logger';

const logger = createLogger({ scope: 'api-server' });
const dbLogger = logger.child('database');
const authLogger = logger.child('auth');

// Database operations
dbLogger.info('Connected to database');
dbLogger.debug('Executing query', { sql: 'SELECT * FROM users' });

// Authentication
authLogger.info('User authenticated', { userId: '123' });
authLogger.warn('Invalid token attempt', { ip: '192.168.1.1' });
```

### React Error Handling

```tsx
function MyApp() {
  const logger = useLogger('App');
  
  const handleError = (error: Error) => {
    logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
    });
  };
  
  return (
    <ErrorBoundary onError={handleError}>
      <Routes />
    </ErrorBoundary>
  );
}
```

### Development Debugging

```typescript
// Temporarily increase log level for debugging
logger.setLevel('debug');

// Log component lifecycle
function TodoItem({ todo }: Props) {
  const logger = useLogger('TodoItem');
  
  useEffect(() => {
    logger.debug('Todo mounted', { id: todo.id });
    return () => logger.debug('Todo unmounted', { id: todo.id });
  }, [todo.id]);
  
  logger.debug('Rendering', { todo });
  return <div>...</div>;
}
```

## Best Practices

1. **Use Appropriate Levels**
   - `error`: Things that need immediate attention
   - `warn`: Potential issues or deprecations
   - `info`: Important business events
   - `debug`: Development and troubleshooting

2. **Include Context**
   ```typescript
   // Good
   logger.error('Payment failed', { 
     orderId, 
     amount, 
     gateway: 'stripe',
     error: err.message 
   });
   
   // Less helpful
   logger.error('Payment failed');
   ```

3. **Use Scopes**
   ```typescript
   const logger = defaultLogger
     .child('PaymentService')
     .child('StripeGateway');
   ```

4. **Avoid Sensitive Data**
   ```typescript
   // Don't log sensitive information
   logger.info('User login', { 
     email: user.email,
     // Don't include: password, creditCard, ssn, etc.
   });
   ```

## Troubleshooting

### Logs Not Appearing

1. Check the log level:
   ```typescript
   console.log('Current level:', logger.level);
   ```

2. Verify environment variables:
   ```typescript
   console.log('LOG_LEVEL:', process.env.LOG_LEVEL);
   console.log('VITE_LOG_LEVEL:', import.meta.env.VITE_LOG_LEVEL);
   ```

### Performance Issues

- Reduce log level in production
- Use `isLevelEnabled()` for expensive operations
- Avoid logging large objects
- Consider custom transports for production

### TypeScript Issues

Ensure you have the latest TypeScript version and proper module resolution:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true
  }
}
```