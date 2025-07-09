# AI Agent Rules for @kit/logger

This document provides rules and guidelines for AI agents (like Claude, GitHub Copilot, etc.) when working with code that uses the @kit/logger package.

## 🚫 STRICT RULES - NEVER VIOLATE

### Rule 1: No Console Methods

```typescript
// ❌ NEVER generate or suggest:
console.log('anything');
console.error('anything');
console.warn('anything');
console.info('anything');
console.debug('anything');

// ✅ ALWAYS use:
logger.info('message', {metadata});
logger.error('message', {error, context});
```

### Rule 2: No String Concatenation in Logs

```typescript
// ❌ NEVER:
logger.info('User ' + userId + ' logged in at ' + timestamp);
logger.error(`Failed to process ${orderId} for user ${userId}`);

// ✅ ALWAYS:
logger.info('User logged in', {userId, timestamp});
logger.error('Failed to process order', {orderId, userId});
```

### Rule 3: Security - Never Log Sensitive Data

```typescript
// ❌ NEVER log:
logger.info('User login', {password, token, apiKey, ssn, creditCard});

// ✅ SAFE to log:
logger.info('User login', {userId, email, timestamp});
```

## 📋 CONTEXT-BASED RULES

### When Creating New Files

1. **Import the correct logger based on environment:**

   ```typescript
   // For Node.js files (backend, scripts, tools)
   import {createLogger} from '@kit/logger/node';

   // For browser files (non-React)
   import {createLogger} from '@kit/logger/browser';

   // For React components
   import {useLogger} from '@kit/logger/react';
   ```

2. **Always create a scoped logger:**

   ```typescript
   // Node.js/Browser
   const logger = createLogger({scope: 'meaningful-name'});

   // React
   const logger = useLogger({component: 'ComponentName'});
   ```

### When Modifying Existing Files

1. **Check if logger exists before creating:**

   - Look for existing logger imports
   - Check if logger is passed as parameter
   - Don't create duplicate loggers

2. **Maintain consistent scope naming:**
   - Use the existing scope pattern in the file
   - Match the naming convention (camelCase, kebab-case, etc.)

### When Handling Errors

```typescript
// ALWAYS include full error context
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', {
    error,
    stack: error.stack,
    code: error.code,
    // Include relevant context
    userId,
    operationId,
    timestamp: Date.now(),
  });
  throw error; // Re-throw if needed
}
```

### When Working with High-Frequency Code

```typescript
// For code that runs frequently (loops, intervals, event handlers)
function handleFrequentEvent(data) {
  // ✅ Use level check
  if (logger.isLevelEnabled('debug')) {
    logger.debug('Frequent event', {data});
  }

  // Or use trace level
  logger.trace('Very frequent event', {minimalData});
}
```

## 🎯 SITUATIONAL RULES

### In React Components

```typescript
// ✅ CORRECT React usage
import {useLogger} from '@kit/logger/react';

function MyComponent({userId}) {
  const logger = useLogger({component: 'MyComponent'});

  useEffect(() => {
    logger.info('Component mounted', {userId});
  }, []);

  const handleClick = () => {
    logger.debug('Button clicked', {userId, timestamp: Date.now()});
  };
}
```

### In API Routes/Controllers

```typescript
// ✅ Use request logger from middleware
function handleRequest(req, res) {
  req.log.info('Processing request', {
    body: req.body,
    params: req.params,
  });

  try {
    const result = await process(req.body);
    req.log.info('Request successful', {resultId: result.id});
  } catch (error) {
    req.log.error('Request failed', {error});
  }
}
```

### In WebSocket Handlers

```typescript
// ✅ Create session logger
ws.on('connection', (socket) => {
  const sessionLogger = logger.child({
    sessionId: generateId(),
    clientId: socket.id,
  });

  socket.log = sessionLogger;
  sessionLogger.info('Client connected');
});
```

## 🔍 DETECTION PATTERNS

When you see these patterns, apply the corresponding rule:

| Pattern                         | Action                                 |
| ------------------------------- | -------------------------------------- |
| `console.log/error/warn`        | Replace with appropriate logger method |
| String concatenation in logs    | Convert to structured metadata         |
| Logging in loops without guards | Add `isLevelEnabled` check             |
| Missing error context           | Add error object and stack trace       |
| Hardcoded log messages          | Add meaningful metadata                |
| No logger in error catch        | Add error logging before handling      |

## 📊 LOG LEVEL SELECTION GUIDE

Choose the appropriate level based on the scenario:

```typescript
// ERROR - Something failed that shouldn't have
logger.error('Database connection failed', {error, dbHost});

// WARN - Something unexpected but handled
logger.warn('API rate limit approaching', {remaining: 10, limit: 100});

// INFO - Important business events
logger.info('Order completed', {orderId, amount, userId});

// DEBUG - Development and troubleshooting
logger.debug('Cache miss', {key, reason: 'expired'});

// TRACE - Very detailed debugging
logger.trace('Function entered', {args, callStack});
```

## 🚀 PERFORMANCE RULES

1. **Always check level for expensive operations:**

   ```typescript
   if (logger.isLevelEnabled('debug')) {
     const metrics = calculateExpensiveMetrics();
     logger.debug('Performance metrics', metrics);
   }
   ```

2. **Use child loggers for context:**

   ```typescript
   // ❌ BAD - Adding context to every call
   logger.info('Step 1', {requestId, userId});
   logger.info('Step 2', {requestId, userId});

   // ✅ GOOD - Create child logger once
   const reqLogger = logger.child({requestId, userId});
   reqLogger.info('Step 1');
   reqLogger.info('Step 2');
   ```

3. **Minimize logged data in production:**
   ```typescript
   // Use environment checks
   const logData =
     process.env.NODE_ENV === 'production' ? {id: user.id} : {...user};
   logger.info('User action', logData);
   ```

## 🔧 COMMON FIXES

### Fix 1: Migration from console

```typescript
// Before
console.log('Starting server on port', port);
console.error('Failed to start:', err);

// After
logger.info('Starting server', {port});
logger.error('Failed to start server', {error: err, port});
```

### Fix 2: Adding logger to existing module

```typescript
// Add to function parameters
- export function processData(data) {
+ export function processData(data, logger) {
    logger.info('Processing data', { size: data.length });
}

// Or create at module level
const logger = createLogger({ scope: 'data-processor' });
```

### Fix 3: Async error handling

```typescript
// Ensure errors are logged before propagating
async function riskyOperation() {
  try {
    return await externalAPI.call();
  } catch (error) {
    logger.error('External API call failed', {
      error,
      api: 'externalAPI',
      method: 'call',
    });
    throw error;
  }
}
```

## 📝 METADATA PATTERNS

Always include relevant context as structured data:

```typescript
// User operations
logger.info('User action', {
  userId,
  action: 'login',
  ip: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: Date.now(),
});

// System operations
logger.info('Cache operation', {
  operation: 'set',
  key,
  ttl: 3600,
  size: value.length,
});

// Performance tracking
logger.debug('Operation completed', {
  duration: Date.now() - startTime,
  success: true,
  itemsProcessed: items.length,
});
```

Remember: The goal is structured, searchable, performant logging that provides clear insights into application behavior without compromising security or performance.
