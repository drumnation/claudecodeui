# Frontend Logging and Debugging Guide

This guide explains the comprehensive logging strategy implemented in the React frontend application, following bulletproof architecture patterns and atomic design principles.

## Overview

The frontend uses `@kit/logger` for structured logging across all components, providing consistent observability for:
- User interactions and behavior patterns
- Component lifecycle and performance
- API calls and WebSocket communications
- Error tracking and recovery actions
- File system operations and project management

## Architecture Integration

### Atomic Design Logging Strategy

```
atoms/          # Basic interaction logging (clicks, focus, validation)
molecules/      # Complex interaction patterns (audio recording, file selection)
organisms/      # Session-scoped logging (chat sessions, project management)
layouts/        # Page-level performance and navigation logging
```

### Component Scope Hierarchy

Each component maintains its own logging scope:

```typescript
// Atoms
const logger = useLogger({ scope: 'Button' });
const logger = useLogger({ scope: 'Input' });

// Molecules  
const logger = useLogger({ scope: 'MicButton' });
const logger = useLogger({ scope: 'MessageBubble' });

// Organisms
const logger = useLogger({ scope: 'ChatInterface' });
const logger = useLogger({ scope: 'Sidebar' });
```

## Implementation Patterns

### 1. Basic Component Logging (Atoms)

#### Button Component
```typescript
import { useLogger } from "@kit/logger/react";

const Button = ({ variant, size, onClick, disabled, children }) => {
  const logger = useLogger({ scope: 'Button' });

  const handleClick = (event) => {
    if (disabled) {
      logger.debug('Button click attempted while disabled', { variant, size });
      return;
    }

    logger.debug('Button clicked', {
      variant,
      size,
      disabled,
      hasChildren: !!children
    });

    onClick?.(event);
  };

  return <button onClick={handleClick}>{children}</button>;
};
```

#### Input Component
```typescript
const Input = ({ type, label, error, onChange, onFocus, onBlur }) => {
  const logger = useLogger({ scope: 'Input' });

  const handleChange = (event) => {
    const newValue = event.target.value;
    logger.debug('Input value changed', { 
      type, 
      valueLength: newValue.length,
      label: label || 'unlabeled',
      isEmpty: !newValue
    });
    onChange?.(event);
  };

  useEffect(() => {
    if (error) {
      logger.warn('Input validation error', { 
        error, 
        type, 
        label: label || 'unlabeled'
      });
    }
  }, [error, type, label, logger]);
};
```

### 2. Complex Component Logging (Molecules)

#### MicButton Component
```typescript
const MicButton = ({ onTranscript }) => {
  const logger = useLogger({ scope: 'MicButton' });

  const startRecording = async () => {
    try {
      logger.info("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // ... recording logic
      
      logger.info("Recording started successfully", { mimeType });
    } catch (err) {
      logger.error("Failed to start recording", {
        error: err.message,
        stack: err.stack
      });
    }
  };

  const handleTranscription = async (blob) => {
    const startTime = performance.now();
    
    try {
      const text = await transcribeWithWhisper(blob);
      const transcriptionTime = performance.now() - startTime;
      
      logger.info('Transcription completed', {
        transcriptionTime: Math.round(transcriptionTime),
        textLength: text.length,
        wordsCount: text.split(' ').length,
        whisperMode: localStorage.getItem('whisperMode') || 'default'
      });
      
      onTranscript?.(text);
    } catch (error) {
      logger.error('Transcription failed', {
        error: error.message,
        transcriptionTime: Math.round(performance.now() - startTime)
      });
    }
  };
};
```

### 3. Organism-Level Logging

#### ChatInterface Component
```typescript
const ChatInterface = ({ sessionId, projectName }) => {
  const logger = useLogger({ scope: 'ChatInterface' });
  const sessionLogger = logger.child({ sessionId });

  useEffect(() => {
    sessionLogger.info('Chat session started', {
      projectName,
      timestamp: Date.now(),
      sessionType: 'new'
    });
  }, [sessionId, projectName]);

  const handleWebSocketMessage = (message) => {
    sessionLogger.debug('WebSocket message received', {
      messageType: message.type,
      messageSize: JSON.stringify(message).length,
      timestamp: Date.now()
    });
  };

  const handleUserMessage = (message) => {
    sessionLogger.info('User message sent', {
      messageLength: message.length,
      timestamp: Date.now(),
      hasAttachments: message.includes('attachment:')
    });
  };
};
```

#### Sidebar Component
```typescript
const Sidebar = () => {
  const logger = useLogger({ scope: 'Sidebar' });

  const loadProjects = async () => {
    const startTime = performance.now();
    
    try {
      const projects = await fetchProjects();
      const loadTime = performance.now() - startTime;
      
      logger.info('Projects loaded', {
        projectCount: projects.length,
        loadTime: Math.round(loadTime),
        performanceCategory: loadTime > 2000 ? 'slow' : 'fast'
      });
    } catch (error) {
      logger.error('Failed to load projects', {
        error: error.message,
        loadTime: Math.round(performance.now() - startTime)
      });
    }
  };

  const handleProjectOperation = (operation, projectName, success, error) => {
    const logLevel = success ? 'info' : 'error';
    logger[logLevel]('Project operation', {
      operation,
      projectName,
      success,
      error,
      timestamp: Date.now(),
      operationCategory: 'project-management'
    });
  };
};
```

## Log Levels and Usage

### Debug Level
Used for development insights and detailed user interactions:
```typescript
logger.debug('Directory toggled', {
  path,
  isExpanding,
  totalExpanded: newExpanded.size
});
```

### Info Level  
Used for significant events and successful operations:
```typescript
logger.info('File saved successfully', {
  fileName: file.name,
  filePath: file.path,
  contentLength: content.length
});
```

### Warn Level
Used for recoverable issues and performance problems:
```typescript
logger.warn('File fetch failed', {
  projectName: selectedProject.name,
  status: response.status,
  errorText,
  dirPath
});
```

### Error Level
Used for failures and critical issues:
```typescript
logger.error('Error fetching files', {
  projectName: selectedProject.name,
  error: error instanceof Error ? error.message : String(error),
  dirPath
});
```

## Performance Monitoring

### Component Render Tracking
```typescript
const ComponentWithPerformanceLogging = () => {
  const logger = useLogger({ scope: 'PerformanceMonitor' });
  
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      logger.debug('Component render metrics', {
        componentName: 'ComponentWithPerformanceLogging',
        renderTime: Math.round(renderTime),
        performanceCategory: renderTime > 16 ? 'slow-render' : 'fast-render'
      });
    };
  });
};
```

### API Call Performance
```typescript
const fetchWithLogging = async (url, context) => {
  const logger = useLogger({ scope: 'ApiClient' });
  const startTime = performance.now();
  
  try {
    const response = await fetch(url);
    const responseTime = performance.now() - startTime;
    
    logger.info('API request completed', {
      url,
      status: response.status,
      responseTime: Math.round(responseTime),
      performanceCategory: responseTime > 1000 ? 'slow' : 'fast',
      ...context
    });
    
    return response;
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    logger.error('API request failed', {
      url,
      error: error.message,
      responseTime: Math.round(responseTime),
      ...context
    });
    
    throw error;
  }
};
```

## Error Handling and Recovery

### Component Error Boundaries
```typescript
const ErrorBoundaryWithLogging = ({ children, componentName }) => {
  const logger = useLogger({ scope: 'ErrorBoundary' });
  
  const handleError = (error, errorInfo) => {
    logger.error('Component error boundary triggered', {
      componentName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now()
    });
  };
  
  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};
```

### Recovery Actions
```typescript
const handleRecoveryAction = (action, context) => {
  const logger = useLogger({ scope: 'Recovery' });
  
  try {
    // Attempt recovery
    performRecoveryAction(action);
    
    logger.info('Recovery action successful', {
      action,
      context,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.warn('Recovery action failed', {
      action,
      context,
      error: error.message,
      timestamp: Date.now()
    });
  }
};
```

## Privacy and Security

### Data Sanitization
```typescript
// ✅ Good - Log metadata without sensitive content
logger.debug('Message processed', {
  messageLength: message.length,
  messageType: 'user',
  hasAttachments: message.includes('attachment:')
});

// ❌ Bad - Don't log actual message content
logger.debug('Message processed', {
  messageContent: message // Potential PII exposure
});
```

### Safe Error Logging
```typescript
const logSafeError = (error, context) => {
  logger.error('Operation failed', {
    error: error.message, // Safe - error message only
    // stack: error.stack,  // Consider excluding in production
    context: sanitizeContext(context),
    timestamp: Date.now()
  });
};

const sanitizeContext = (context) => {
  const { password, token, apiKey, ...safeContext } = context;
  return safeContext;
};
```

## Debugging Workflow

### 1. Component Development
```typescript
// Enable debug logging in development
const logger = useLogger({ 
  scope: 'ComponentName',
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});
```

### 2. Issue Investigation
```typescript
// Add temporary detailed logging for debugging
if (logger.isLevelEnabled('debug')) {
  logger.debug('Detailed debugging info', {
    state: JSON.stringify(componentState),
    props: JSON.stringify(props),
    timestamp: Date.now()
  });
}
```

### 3. Performance Profiling
```typescript
const profileOperation = async (operationName, operation) => {
  const logger = useLogger({ scope: 'Profiler' });
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    logger.info('Operation profiled', {
      operationName,
      duration: Math.round(duration),
      success: true,
      performanceCategory: duration > 1000 ? 'slow' : 'fast'
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logger.error('Operation failed during profiling', {
      operationName,
      duration: Math.round(duration),
      error: error.message,
      success: false
    });
    
    throw error;
  }
};
```

## Configuration

### Log Level Configuration
Set via environment variables:
```bash
# Development
LOG_LEVEL=debug

# Production  
LOG_LEVEL=info
```

### Browser Console Integration
The logger automatically outputs to browser console in development with proper formatting and filtering capabilities.

### Production Considerations
- Log sensitive operations without exposing data
- Monitor performance impact of logging
- Consider log aggregation services for production monitoring
- Implement log filtering and sampling for high-traffic applications

## Session Loading Performance Guidelines

### Problem: Session Loading Storm

Session loading storms occur when frontend components repeatedly request the same session history, causing performance degradation and backend overload.

#### Common Symptoms
- Repeated `📜 Loading session history` logs for the same session
- High-frequency brain-monitor requests (< 1 second intervals)
- WebSocket message processing loops
- UI freezing or slow session switching

#### Root Causes

1. **Infinite Effect Loops**: useEffect dependencies causing unnecessary re-runs
2. **Missing State Tracking**: Not tracking if session is already loaded/loading
3. **Duplicate Requests**: Multiple components requesting same session data
4. **Poor Rate Limiting**: No protection against rapid successive requests

#### Prevention Strategies

##### 1. Proper Session State Management

```typescript
// ✅ Good - Track session loading state properly
const [isLoadingHistory, setIsLoadingHistory] = useState(false);
const sessionHistoryLoaded = useRef<string | null>(null);

useEffect(() => {
  const sessionKey = `${selectedProject?.name}_${selectedSession?.id}`;
  
  // Only reset if the session ID actually changed
  if (sessionHistoryLoaded.current !== sessionKey) {
    lastProcessedIndex.current = -1;
  }
  
  // Check if already loaded or loading
  if (sessionHistoryLoaded.current === sessionKey || isLoadingHistory) {
    logger.debug('Session history already loaded or loading, skipping', {
      sessionKey,
      alreadyLoaded: sessionHistoryLoaded.current === sessionKey,
      currentlyLoading: isLoadingHistory
    });
    return;
  }
  
  // Proceed with loading...
}, [selectedSession?.id, selectedProject?.name, ws, sendMessage, isLoadingHistory]);

// ❌ Bad - Resetting state on every render
useEffect(() => {
  sessionHistoryLoaded.current = null; // This causes infinite loops!
  // Loading logic...
}, [selectedSession, selectedProject, ws, sendMessage]);
```

##### 2. Request Deduplication

```typescript
// ✅ Good - API-level deduplication
class ChatAPI {
  private loadingSessionsMap = new Map<string, { timestamp: number; timeout: NodeJS.Timeout }>();
  
  loadSessionHistory(ws, projectName, sessionId, sendMessage) {
    const sessionKey = `${projectName}_${sessionId}`;
    
    // Check if already loading
    if (this.loadingSessionsMap.has(sessionKey)) {
      logger.debug('Session already being loaded, ignoring duplicate request');
      return;
    }
    
    // Mark as loading with timeout
    const timeout = setTimeout(() => {
      this.loadingSessionsMap.delete(sessionKey);
    }, 30000);
    
    this.loadingSessionsMap.set(sessionKey, { timestamp: Date.now(), timeout });
    
    // Send request...
  }
  
  markSessionLoaded(projectName, sessionId) {
    const sessionKey = `${projectName}_${sessionId}`;
    const loadingState = this.loadingSessionsMap.get(sessionKey);
    if (loadingState) {
      clearTimeout(loadingState.timeout);
      this.loadingSessionsMap.delete(sessionKey);
    }
  }
}
```

##### 3. Backend Rate Limiting

```typescript
// Backend WebSocket handler with rate limiting
const sessionLoadingMap = new Map<string, { timestamp: number; attempts: number }>();
const SESSION_RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_SESSION_REQUESTS_PER_WINDOW = 1;

// In WebSocket message handler
if (data.type === 'load_session') {
  const sessionKey = `${data.projectName}_${data.sessionId}`;
  const now = Date.now();
  
  // Rate limiting check
  const rateLimitData = sessionLoadingMap.get(sessionKey);
  if (rateLimitData) {
    const timeSinceLastRequest = now - rateLimitData.timestamp;
    
    if (timeSinceLastRequest < SESSION_RATE_LIMIT_WINDOW) {
      if (rateLimitData.attempts >= MAX_SESSION_REQUESTS_PER_WINDOW) {
        logger.warn('Session load rate limit exceeded', { sessionKey });
        return; // Silently ignore rate-limited requests
      }
    }
  }
  
  // Proceed with loading...
}
```

#### Brain-Monitor Configuration

##### Frontend Configuration

```typescript
// Optimized brain-monitor settings
const isDevelopment = import.meta.env.DEV;
const brainMonitorConfig = {
  endpoint: "/api/brain-monitor/browser-logs",
  flushInterval: isDevelopment ? 10000 : 30000, // 10s dev, 30s prod
  maxBufferSize: 50,
};

// Singleton protection
if (!window.__brainMonitorInstance) {
  const instance = initBrowserConsoleCapture(brainMonitorConfig);
  window.__brainMonitorInstance = instance;
} else {
  console.warn("Brain monitor already initialized, skipping duplicate");
}
```

##### Backend Rate Limiting

```typescript
// Brain-monitor controller with rate limiting
const clientRateLimits = new Map<string, { 
  requests: Array<number>, 
  blockedUntil?: number 
}>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_REQUESTS_PER_WINDOW = 1;

export const handleBrowserLogs = (req: Request, res: Response): void => {
  const clientKey = `${req.ip}_${sessionInfo.userAgent}`;
  const now = Date.now();
  
  // Check rate limiting
  let rateLimitData = clientRateLimits.get(clientKey);
  if (rateLimitData && rateLimitData.requests.length >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({ error: 'Rate limit exceeded' });
    return;
  }
  
  // Process logs...
};
```

#### Debugging Session Loading Issues

##### 1. Enable Debug Logging

```typescript
const sessionLogger = logger.child({ 
  sessionId: selectedSession?.id,
  projectName: selectedProject?.name 
});

sessionLogger.debug('Session loading attempt', {
  sessionKey,
  loadCount: ++debugLoadCount,
  wsReadyState: ws?.readyState,
  callerInfo: {
    hook: 'useChatSession',
    timestamp: Date.now()
  }
});
```

##### 2. Monitor Request Patterns

```typescript
// Track session operations for debugging
const sessionOperationTracker = useRef<Map<string, {
  operations: Array<{ type: string, timestamp: number }>
}>>(new Map());

// Before loading
const operations = sessionOperationTracker.current.get(sessionKey) || { operations: [] };
operations.operations.push({ type: 'history_load', timestamp: Date.now() });
sessionOperationTracker.current.set(sessionKey, operations);
```

##### 3. Backend Monitoring

```typescript
// Enhanced session loading logging
logger.info('📜 Loading session history', {
  projectName: data.projectName,
  sessionId: data.sessionId,
  sessionKey,
  requestCount: ++globalRequestCount,
  timeSinceLastRequest: now - lastRequestTime
});

// Track loading duration
const loadStartTime = Date.now();
try {
  const messages = await getSessionMessages(/*...*/);
  const loadDuration = Date.now() - loadStartTime;
  
  logger.info('📜 Session history loaded successfully', {
    sessionKey,
    messageCount: messages.length,
    loadDuration
  });
} finally {
  currentlyLoadingSessions.delete(sessionKey);
}
```

#### Performance Monitoring

##### 1. Track Loading Metrics

```typescript
// Frontend performance tracking
const loadSessionHistoryWithMetrics = async (projectName, sessionId) => {
  const startTime = performance.now();
  
  try {
    await chatAPI.loadSessionHistory(ws, projectName, sessionId, sendMessage);
    const loadTime = performance.now() - startTime;
    
    logger.info('Session history load completed', {
      sessionKey: `${projectName}_${sessionId}`,
      loadTime: Math.round(loadTime),
      performanceCategory: loadTime > 2000 ? 'slow' : 'fast'
    });
  } catch (error) {
    logger.error('Session history load failed', {
      sessionKey: `${projectName}_${sessionId}`,
      loadTime: Math.round(performance.now() - startTime),
      error: error.message
    });
  }
};
```

##### 2. Detect Loading Storms

```typescript
// Automatic storm detection
const detectLoadingStorm = (sessionKey: string, operations: Array<{ timestamp: number }>) => {
  const recentOps = operations.filter(op => Date.now() - op.timestamp < 10000); // Last 10 seconds
  
  if (recentOps.length > 5) {
    logger.warn('🚨 Session loading storm detected', {
      sessionKey,
      recentOperations: recentOps.length,
      timeWindow: 10000,
      averageInterval: recentOps.length > 1 ? 
        (recentOps[recentOps.length - 1].timestamp - recentOps[0].timestamp) / (recentOps.length - 1) : 0
    });
    
    // Could trigger automatic throttling or circuit breaking
    return true;
  }
  
  return false;
};
```

## Best Practices Summary

1. **Consistent Scoping**: Use component name as logger scope
2. **Structured Metadata**: Include relevant context without sensitive data  
3. **Appropriate Levels**: Debug for development, info for significant events, warn for issues, error for failures
4. **Performance Awareness**: Use `logger.isLevelEnabled()` for expensive operations
5. **Privacy First**: Log metadata and metrics, not actual user data
6. **Error Context**: Include operation context and recovery information
7. **Session Tracking**: Use child loggers for request/session scoping
8. **Atomic Design**: Align logging granularity with component complexity
9. **Session Loading**: Implement proper state tracking and request deduplication to prevent loading storms
10. **Brain-Monitor**: Configure appropriate flush intervals and implement rate limiting to prevent spam
11. **Performance Monitoring**: Track session loading metrics and detect performance issues proactively

## Hot Module Reload (HMR) Troubleshooting

### Overview

HMR issues often stem from TypeScript compilation errors or runtime errors that break React Fast Refresh boundaries. This section provides systematic diagnosis and resolution steps.

### Common HMR Failure Scenarios

#### 1. TypeScript Compilation Errors
**Symptoms:**
- Changes don't appear in browser
- Vite shows "compilation failed" messages
- Browser console shows module loading errors

**Diagnosis Steps:**
```bash
# Check for TypeScript errors
pnpm typecheck

# Review error reports
cat _errors/errors.typecheck-failures.md

# Monitor Vite dev server output
pnpm dev
```

**Resolution:**
1. Fix all TypeScript compilation errors first
2. Ensure all imports are valid and resolvable
3. Check for missing type definitions
4. Verify all optional chaining has proper null checks

#### 2. Runtime Errors Breaking React Fast Refresh
**Symptoms:**
- Full page reload instead of hot reload
- React components don't update
- Browser console shows component boundary errors

**Common Causes:**
- Errors in render functions
- Unhandled exceptions in component effects
- Malformed JSX or component state

**Resolution:**
```typescript
// ✅ Good - Comprehensive error handling
const extractMessageContent = (content: any): string => {
  try {
    if (content === null || content === undefined) {
      return "";
    }
    
    if (typeof content === "string") {
      return content;
    }
    
    // Handle objects with error boundaries
    if (content && typeof content === "object") {
      // ... safe object processing
    }
    
    return String(content);
  } catch (error) {
    console.error('Content extraction error:', error);
    return "[Invalid content]";
  }
};

// ❌ Bad - Unhandled runtime errors
const extractMessageContent = (content: any): string => {
  return content.message.text; // Can throw if any property is undefined
};
```

#### 3. File Watching Issues
**Symptoms:**
- Changes detected but not applied
- Intermittent HMR failures
- Works on some filesystems but not others

**Common on:**
- WSL (Windows Subsystem for Linux)
- Docker containers
- Network filesystems
- Virtual machines

**Resolution:**
Enable polling mode in `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    watch: {
      // Enable polling for problematic filesystems
      usePolling: true,
      interval: 100,
      binaryInterval: 300,
    },
  },
});
```

### HMR Diagnostic Workflow

#### Step 1: Verify Base Configuration
```bash
# Check Vite config is correct
cat apps/frontend/vite.config.js

# Verify dev server is running
curl http://localhost:8766

# Check WebSocket connection
curl -H "Upgrade: websocket" http://localhost:8766
```

#### Step 2: Test HMR in Isolation
```typescript
// Create a simple test component
const HMRTest = () => {
  return <div>HMR Test - Version 1</div>;
};

// Make a change and save
const HMRTest = () => {
  return <div>HMR Test - Version 2</div>; // This should update without page reload
};
```

#### Step 3: Identify Breaking Components
```typescript
// Add error boundaries around suspect components
const ErrorBoundary = ({ children, componentName }) => {
  const logger = useLogger({ scope: 'HMR-ErrorBoundary' });
  
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      logger.error('Component error during HMR', {
        componentName,
        error: error.message,
        stack: error.stack
      });
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return <div>Error in {componentName} - check console</div>;
  }
  
  return children;
};

// Wrap components to identify problematic ones
<ErrorBoundary componentName="MessageComponent">
  <MessageComponent {...props} />
</ErrorBoundary>
```

#### Step 4: Check React Fast Refresh Boundaries
```typescript
// Ensure components are properly exported
export const MyComponent = () => {
  // Component logic
};

// Avoid anonymous exports that break Fast Refresh
// ❌ Bad
export default () => {
  // Anonymous component breaks Fast Refresh
};

// ✅ Good
const MyComponent = () => {
  // Component logic
};
export default MyComponent;
```

### Performance Monitoring for HMR

#### Track HMR Performance
```typescript
// Monitor HMR update times
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.time('HMR Update');
  });
  
  import.meta.hot.on('vite:afterUpdate', () => {
    console.timeEnd('HMR Update');
  });
}
```

#### Component Update Tracking
```typescript
const ComponentWithHMRTracking = () => {
  const logger = useLogger({ scope: 'HMR-Tracking' });
  
  useEffect(() => {
    logger.debug('Component mounted/updated', {
      timestamp: Date.now(),
      hmrEnabled: !!import.meta.hot
    });
  });
  
  // Development-only HMR logging
  if (import.meta.env.DEV && import.meta.hot) {
    import.meta.hot.accept((newModule) => {
      logger.info('HMR update accepted', {
        componentName: 'ComponentWithHMRTracking',
        timestamp: Date.now()
      });
    });
  }
};
```

### Debugging Commands Reference

```bash
# TypeScript compilation check
pnpm typecheck

# Run with verbose logging
DEBUG=vite:* pnpm dev

# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server with clean state
pnpm dev --force

# Check for syntax errors
pnpm lint

# Test HMR with minimal changes
echo "/* HMR test */" >> src/App.tsx
```

### Advanced HMR Configuration

#### Custom HMR Handling
```typescript
// For components that need special HMR handling
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Custom update logic
    if (newModule?.MyComponent) {
      // Handle component replacement
      logger.info('Custom HMR update applied');
    }
  });
  
  // Prevent auto-reload for certain errors
  import.meta.hot.invalidate = (reason) => {
    logger.warn('HMR invalidation prevented', { reason });
    return false; // Prevent auto-reload
  };
}
```

#### Environment-Specific Settings
```javascript
// vite.config.js - Environment-specific HMR
export default defineConfig(({ mode }) => ({
  server: {
    hmr: mode === 'development' ? {
      overlay: true, // Show error overlay
      clientPort: process.env.VITE_HMR_PORT || 8766,
    } : false,
    
    watch: {
      // More aggressive watching in development
      usePolling: mode === 'development' && process.env.USE_POLLING === 'true',
      interval: 100,
    },
  },
}));
```

### Troubleshooting Checklist

1. **✅ TypeScript Compilation**: No TS errors in `_errors/errors.typecheck-failures.md`
2. **✅ Runtime Errors**: No component errors breaking React boundaries
3. **✅ File Watching**: Changes detected by Vite dev server
4. **✅ WebSocket Connection**: HMR WebSocket connected successfully
5. **✅ Component Exports**: All components properly exported for Fast Refresh
6. **✅ Error Boundaries**: Components wrapped in error boundaries for isolation
7. **✅ Cache State**: Vite cache cleared if persistent issues
8. **✅ Network/Filesystem**: Polling enabled if on problematic filesystem

### When HMR Still Fails

If HMR continues to fail after following these steps:

1. **Restart development server**: `pnpm dev --force`
2. **Clear all caches**: `rm -rf node_modules/.vite && pnpm dev`
3. **Test with minimal component**: Create isolated test case
4. **Check for conflicting tools**: Disable other dev tools temporarily
5. **Enable polling mode**: Set `usePolling: true` in Vite config
6. **Review browser console**: Look for WebSocket or module errors

### Fallback Development Workflow

If HMR cannot be resolved:

```bash
# Use file watcher with manual refresh
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Watch for changes and trigger browser refresh
npx chokidar "src/**/*.{ts,tsx}" -c "curl -X POST http://localhost:8766/__vite_ping"
```