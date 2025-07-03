# Hot Module Reload (HMR) Troubleshooting Guide

This guide provides comprehensive steps for diagnosing and fixing Hot Module Reload issues in the Claude Code UI React application.

## Quick Diagnosis Checklist

### ✅ Step 1: Verify HMR is Enabled
```bash
# Check if Vite dev server is running with HMR
curl http://localhost:8766
# Should respond with the app HTML

# Check WebSocket connection
curl -H "Upgrade: websocket" -H "Connection: Upgrade" http://localhost:8766
```

### ✅ Step 2: Test Basic HMR Functionality
Create a simple test change in any component:
```tsx
// In any component file, add a comment
const TestComponent = () => {
  return <div>Test - Version 1</div>; // Change this to Version 2
};
```
**Expected:** Browser updates without page reload  
**If fails:** Continue to Step 3

### ✅ Step 3: Check TypeScript Compilation
```bash
# Run TypeScript check
pnpm typecheck

# Check error reports
cat _errors/errors.typecheck-failures.md
```
**If errors found:** Fix all TypeScript errors before proceeding

### ✅ Step 4: Check for Runtime Errors
Open browser console and look for:
- JavaScript errors
- React component errors
- WebSocket connection errors
- Module loading failures

## Common HMR Issues and Solutions

### Issue 1: TypeScript Compilation Errors

**Symptoms:**
- Changes don't reflect in browser
- Vite terminal shows compilation errors
- Red error overlay in browser

**Solution:**
```bash
# Fix TypeScript errors first
pnpm typecheck
# Review and fix all errors listed

# Then restart dev server
pnpm dev --force
```

**Prevention:**
- Enable TypeScript strict mode
- Use proper type annotations
- Fix import/export issues immediately

### Issue 2: Runtime Errors Breaking Fast Refresh

**Symptoms:**
- Full page reload instead of hot update
- "Fast Refresh had to perform a full reload" message
- Component boundaries broken

**Common Causes & Solutions:**

#### Unhandled Exceptions in Components
```tsx
// ❌ Bad - Can throw runtime errors
const BadComponent = ({ message }) => {
  return <div>{message.content.text}</div>; // Throws if any property is undefined
};

// ✅ Good - Safe with error handling
const GoodComponent = ({ message }) => {
  try {
    const content = message?.content?.text || '';
    return <div>{content}</div>;
  } catch (error) {
    console.error('Component error:', error);
    return <div>Error rendering content</div>;
  }
};
```

#### Anonymous Function Components
```tsx
// ❌ Bad - Breaks Fast Refresh
export default () => <div>Anonymous component</div>;

// ✅ Good - Named components work with Fast Refresh
const NamedComponent = () => <div>Named component</div>;
export default NamedComponent;
```

#### Component State Issues
```tsx
// ❌ Bad - Invalid state updates
const BadComponent = () => {
  const [state, setState] = useState();
  
  useEffect(() => {
    setState(undefined.someProperty); // Runtime error
  }, []);
};

// ✅ Good - Safe state updates
const GoodComponent = () => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    try {
      const newState = computeState();
      setState(newState);
    } catch (error) {
      console.error('State update error:', error);
      setState(null);
    }
  }, []);
};
```

### Issue 3: File Watching Problems

**Symptoms:**
- Changes detected but not applied
- Inconsistent HMR behavior
- Works sometimes, fails other times

**Common on:**
- WSL (Windows Subsystem for Linux)
- Docker containers
- Network filesystems (NFS, SMB)
- Virtual machines

**Solution:**
Enable polling in `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    watch: {
      usePolling: true,
      interval: 100,
      binaryInterval: 300,
    },
  },
});
```

**Alternative Solutions:**
- Use native development environment instead of WSL
- Increase file watcher limits on Linux:
  ```bash
  echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p
  ```

### Issue 4: WebSocket Connection Issues

**Symptoms:**
- HMR WebSocket disconnects frequently
- Browser shows connection errors
- Fallback to polling

**Solutions:**

#### For Local Development:
```javascript
// vite.config.js
export default defineConfig({
  server: {
    hmr: {
      port: 8766,
      host: 'localhost',
    },
  },
});
```

#### For Tunneled Development (ngrok, etc):
```javascript
// vite.config.js
export default defineConfig({
  server: {
    hmr: process.env.NGROK_URL ? {
      clientPort: 443,
      protocol: 'wss',
    } : {
      port: 8766,
      host: 'localhost',
    },
  },
});
```

## Advanced Troubleshooting

### Debug Vite HMR Process

Enable verbose Vite logging:
```bash
DEBUG=vite:* pnpm dev
```

Look for these log patterns:
- `vite:hmr` - HMR update events
- `vite:ws` - WebSocket communications
- `vite:deps` - Dependency processing

### Monitor React Fast Refresh

Add HMR monitoring to components:
```tsx
const MyComponent = () => {
  // Development-only HMR tracking
  if (import.meta.env.DEV && import.meta.hot) {
    import.meta.hot.accept((newModule) => {
      console.log('HMR update applied to MyComponent');
    });
  }
  
  return <div>My Component</div>;
};
```

### Clear Vite Cache

If HMR starts behaving unexpectedly:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear browser cache and restart
pnpm dev --force
```

### Error Boundary for HMR Development

Wrap components in development-aware error boundaries:
```tsx
const HMRErrorBoundary = ({ children, componentName }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset error state on HMR updates in development
    if (import.meta.env.DEV && import.meta.hot) {
      import.meta.hot.accept(() => {
        setHasError(false);
      });
    }
  }, []);
  
  if (hasError) {
    return (
      <div style={{ padding: '20px', border: '1px solid red' }}>
        <h3>Error in {componentName}</h3>
        <button onClick={() => setHasError(false)}>
          Retry Component
        </button>
      </div>
    );
  }
  
  return children;
};
```

## Performance Optimization

### Optimize HMR for Large Codebases

```javascript
// vite.config.js
export default defineConfig({
  server: {
    watch: {
      // Ignore large directories that don't need watching
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.vscode/**',
      ],
    },
  },
  optimizeDeps: {
    // Include dependencies that need pre-bundling
    include: ['react', 'react-dom'],
  },
});
```

### Component-Level HMR Optimization

```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering logic
  return <div>{/* Complex UI */}</div>;
});

// Separate hot-reloadable logic from static logic
const useComponentLogic = () => {
  // This logic will hot-reload
  return useMemo(() => {
    return computeExpensiveValue();
  }, []);
};

const MyComponent = () => {
  const logic = useComponentLogic();
  return <ExpensiveComponent data={logic} />;
};
```

## Environment-Specific Configuration

### Development Environment
```javascript
// vite.config.js
export default defineConfig(({ mode }) => ({
  server: {
    hmr: mode === 'development' ? {
      overlay: true, // Show error overlay
      clientPort: 8766,
    } : false,
  },
}));
```

### Docker/Container Environment
```javascript
// vite.config.js for containers
export default defineConfig({
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 8766,
    watch: {
      usePolling: true, // Required for Docker
      interval: 1000,
    },
    hmr: {
      port: 8766,
      host: 'localhost',
    },
  },
});
```

## Testing HMR Functionality

### Manual HMR Test
1. Start dev server: `pnpm dev`
2. Open browser to localhost:8766
3. Open browser dev tools (Network tab)
4. Make a simple change to any component
5. Save the file
6. Verify:
   - No full page reload in Network tab
   - Component updates immediately
   - Console shows "Hot update" message

### Automated HMR Test
```bash
#!/bin/bash
# hmr-test.sh
echo "Testing HMR functionality..."

# Start dev server in background
pnpm dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Make a test change
echo "// HMR test $(date)" >> src/App.tsx

# Check if server is responsive
if curl -s http://localhost:8766 > /dev/null; then
  echo "✅ HMR test passed"
else
  echo "❌ HMR test failed"
fi

# Cleanup
kill $DEV_PID
```

## Fallback Development Workflow

If HMR cannot be resolved after following all steps:

### Option 1: Manual Refresh Workflow
```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Watch files and trigger refresh
npx chokidar "src/**/*.{ts,tsx}" -c "curl -X POST http://localhost:8766/__vite_ping"
```

### Option 2: Auto-Refresh Browser Extension
1. Install browser extension like "Live Reload"
2. Configure to watch localhost:8766
3. Extension will refresh browser on file changes

### Option 3: Build and Serve Workflow
```bash
# For immediate feedback on changes
pnpm build && pnpm preview
```

## Emergency Recovery

If the development environment becomes completely unusable:

```bash
# Nuclear option - reset everything
rm -rf node_modules
rm -rf .vite
rm -rf dist
pnpm install
pnpm dev --force
```

## Getting Help

If HMR issues persist after following this guide:

1. **Check Vite documentation** for version-specific issues
2. **Review browser console** for specific error messages
3. **Test in incognito mode** to rule out extension conflicts
4. **Try different browser** to isolate browser-specific issues
5. **Check system resources** - ensure sufficient RAM and CPU
6. **Review recent changes** that might have broken HMR

## Additional Resources

- [Vite HMR API Documentation](https://vitejs.dev/guide/api-hmr.html)
- [React Fast Refresh Documentation](https://reactnative.dev/docs/fast-refresh)
- [TypeScript and HMR Best Practices](https://vitejs.dev/guide/features.html#typescript)