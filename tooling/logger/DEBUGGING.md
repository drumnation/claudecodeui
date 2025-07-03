# 🔍 Debugging with Temporary Logs - Agent Instructions

This guide provides **agentic instructions** for AI assistants debugging the Claude Code UI application. Follow these patterns to add temporary debugging logs and clean them up systematically.

## 📋 Quick Reference

| Log Type | When to Use | Example | Auto-Removed |
|----------|-------------|---------|--------------|
| `logTrace()` | Investigating specific interactions | `logTrace('Button click flow', {step: 'validation'})` | ✅ Yes |
| `logTemp()` | Very temporary debugging | `logTemp('Testing new feature', {enabled: true})` | ✅ Yes |
| `logger.debug()` | Permanent debugging info | `logger.debug('Cache hit', {key: 'user-123'})` | ❌ No |
| `logger.info()` | Important events | `logger.info('User logged in', {userId})` | ❌ No |

## 🎯 Step-by-Step Debugging Workflow

### 1. Add Temporary Logs

```typescript
// Import the user action logger in your component
import { useUserActionLogger } from '@/utils/userActionLogger';

function MyComponent() {
  const { logTrace, logTemp, logClick } = useUserActionLogger('MyComponent');
  
  const handleClick = () => {
    // Add temporary debugging
    logTrace('Investigating click behavior', { 
      timestamp: Date.now(),
      userAgent: navigator.userAgent 
    });
    
    // Your existing logic
    doSomething();
    
    // More temporary debugging
    logTemp('After doSomething execution', { 
      result: 'success',
      step: 'post-action' 
    });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### 2. Add Component-Level Debugging

```typescript
// For debugging component lifecycle and state changes
function DebugComponent() {
  const { logTrace } = useUserActionLogger('DebugComponent');
  const [state, setState] = useState(null);
  
  useEffect(() => {
    logTrace('Component mounted', { 
      initialState: state,
      props: Object.keys(props) 
    });
    
    return () => {
      logTrace('Component unmounting', { 
        finalState: state 
      });
    };
  }, []);
  
  useEffect(() => {
    logTrace('State changed', { 
      previousState: previousValue,
      newState: state,
      timestamp: Date.now()
    });
  }, [state]);
}
```

### 3. Add Flow-Based Debugging

```typescript
// For debugging complex user flows
const handleComplexFlow = async () => {
  const { logTrace } = useUserActionLogger('ComplexFlow');
  
  logTrace('Flow started', { step: 'initialization' });
  
  try {
    const result1 = await step1();
    logTrace('Step 1 complete', { result: result1, step: 'step1' });
    
    const result2 = await step2(result1);
    logTrace('Step 2 complete', { result: result2, step: 'step2' });
    
    const final = await step3(result2);
    logTrace('Flow completed successfully', { 
      finalResult: final, 
      step: 'completion',
      totalTime: Date.now() - startTime 
    });
    
  } catch (error) {
    logTrace('Flow failed', { 
      error: error.message, 
      step: 'error_handling',
      stack: error.stack 
    });
  }
};
```

### 4. Debugging Event Handlers

```typescript
// For debugging user interactions
const MyInteractiveComponent = () => {
  const { logTrace, logTemp } = useUserActionLogger('Interactive');
  
  const handleMouseMove = (e) => {
    logTrace('Mouse movement', { 
      x: e.clientX, 
      y: e.clientY,
      target: e.target.tagName 
    });
  };
  
  const handleKeyPress = (e) => {
    logTemp('Key pressed', { 
      key: e.key, 
      code: e.code,
      modifiers: {
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey
      }
    });
  };
  
  return (
    <div 
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyPress}
    >
      Interactive content
    </div>
  );
};
```

## 🧹 Cleanup Process

### Automatic Cleanup

Run this command when debugging is complete:

```bash
# Remove all temporary logs automatically
pnpm logs:clean-temp
```

This script will remove:
- All `logTrace()` calls
- All `logTemp()` calls  
- Comments with `// TRACE:` or `// TEMP:`
- Debug statements containing `TRACE` or `TEMP`

### Manual Cleanup Verification

After running the cleanup script, verify by searching for:

```bash
# Search for any remaining temporary logs
grep -r "logTrace\|logTemp\|TRACE:\|TEMP:" src/ --exclude-dir=node_modules
```

## 🎭 Debugging Patterns by Scenario

### User Interaction Debugging

```typescript
// For investigating clicks, navigation, form submissions
const { logTrace } = useUserActionLogger('UserInteraction');

const handleUserAction = (actionType, data) => {
  logTrace(`User action: ${actionType}`, {
    actionType,
    data,
    timestamp: Date.now(),
    sessionId: getCurrentSessionId(),
    userId: getCurrentUserId()
  });
};
```

### State Management Debugging

```typescript
// For Redux, Context, or local state issues
const { logTrace } = useUserActionLogger('StateDebug');

const reducer = (state, action) => {
  logTrace('State change', {
    actionType: action.type,
    previousState: state,
    actionPayload: action.payload,
    timestamp: Date.now()
  });
  
  const newState = handleAction(state, action);
  
  logTrace('New state computed', {
    newState,
    diff: getDiff(state, newState)
  });
  
  return newState;
};
```

### API/Network Debugging

```typescript
// For investigating API calls and responses
const { logTrace } = useUserActionLogger('API');

const apiCall = async (endpoint, options) => {
  logTrace('API call started', {
    endpoint,
    method: options.method,
    headers: options.headers,
    timestamp: Date.now()
  });
  
  try {
    const response = await fetch(endpoint, options);
    
    logTrace('API response received', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: Date.now()
    });
    
    return response;
  } catch (error) {
    logTrace('API call failed', {
      error: error.message,
      endpoint,
      timestamp: Date.now()
    });
    throw error;
  }
};
```

### Performance Debugging

```typescript
// For investigating rendering performance
const { logTrace } = useUserActionLogger('Performance');

const PerformanceDebugComponent = () => {
  const renderStart = performance.now();
  
  useLayoutEffect(() => {
    const renderEnd = performance.now();
    logTrace('Component render time', {
      renderTime: renderEnd - renderStart,
      componentName: 'PerformanceDebugComponent'
    });
  });
  
  const expensiveOperation = () => {
    const start = performance.now();
    
    // Your expensive operation
    const result = doExpensiveWork();
    
    const end = performance.now();
    logTrace('Expensive operation completed', {
      duration: end - start,
      operation: 'doExpensiveWork',
      result: typeof result
    });
    
    return result;
  };
};
```

## ⚠️ Important Guidelines

### DO:
- ✅ Use `logTrace()` for investigating specific bugs
- ✅ Use `logTemp()` for very temporary debugging
- ✅ Include relevant context in log details
- ✅ Add timestamps for timing-related debugging
- ✅ Clean up logs with `pnpm logs:clean-temp` when done

### DON'T:
- ❌ Use `logger.debug()` for temporary logs (use `logTrace`/`logTemp`)
- ❌ Leave temporary logs in production code
- ❌ Log sensitive data (passwords, tokens, PII)
- ❌ Add excessive logging that impacts performance
- ❌ Use `console.log()` instead of structured logging

## 🔧 Integration with Existing Logs

The temporary logs will appear in the brain monitor alongside permanent logs:

```
12:34:56 PM [MyComponent] DEBUG | 🔍 TRACE: Button click flow { "step": "validation", "timestamp": 1751560496000 }
12:34:56 PM [MyComponent] INFO  | USER_ACTION: click { "element": "save-button", "fileName": "test.js" }
12:34:56 PM [MyComponent] DEBUG | 🔍 TRACE: After save operation { "result": "success", "duration": 150 }
```

This allows you to see temporary debugging alongside permanent logs for full context.

---

**Remember**: Always run `pnpm logs:clean-temp` before committing changes to ensure no temporary logs make it to production!