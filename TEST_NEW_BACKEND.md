# Testing the New TypeScript Backend with Frontend

## Quick Start

### 1. Build node-pty (Required for terminal functionality)

First, we need to build the native module:

```bash
# Option A: Using npm directly in the backend
cd apps/backend
npm install

# Option B: Rebuild node-pty manually
cd node_modules/.pnpm/node-pty@1.0.0/node_modules/node-pty
npm run rebuild
```

### 2. Start the New Backend

```bash
# From project root
cd apps/backend
PORT=8765 npm run dev
```

The backend should start on port 8765 with output like:
```
Server running on http://localhost:8765
```

### 3. Start the Frontend

In a new terminal:

```bash
# From project root
npm run dev
```

The frontend will start on port 8766 and proxy API requests to the backend on 8765.

### 4. Access the Application

Open http://localhost:8766 in your browser

## What to Test

1. **Basic Functionality**
   - Projects list loads correctly
   - Can create new projects
   - Sessions are displayed
   - File browser works

2. **Git Integration**
   - Git status shows correctly
   - Can commit changes
   - Branch operations work

3. **Terminal**
   - Shell terminal opens
   - Commands execute properly
   - Output is displayed correctly

4. **WebSocket Connection**
   - Real-time updates work
   - No connection errors in console

## Troubleshooting

### Backend Won't Start

1. **Module not found errors**
   ```bash
   # Reinstall dependencies
   pnpm install --force
   ```

2. **node-pty errors**
   ```bash
   # Install node-pty with npm
   cd apps/backend
   npm install node-pty
   ```

3. **Port already in use**
   ```bash
   # Kill existing process on port 8765
   lsof -ti:8765 | xargs kill -9
   ```

### Frontend Connection Issues

1. **Check backend is running**
   ```bash
   curl http://localhost:8765/api/config
   ```

2. **Check proxy configuration**
   - Verify VITE_API_PORT=8765 in .env
   - Check vite.config.js proxy settings

3. **WebSocket connection fails**
   - Check browser console for errors
   - Ensure /ws endpoint is accessible

## Comparing Old vs New Backend

### Current Backend (CommonJS)
- Location: `/server`
- Start: `cd server && node index.js`
- Technology: Express, CommonJS, JavaScript

### New Backend (TypeScript)
- Location: `/apps/backend`
- Start: `cd apps/backend && npm run dev`
- Technology: Express, TypeScript, ESM modules

Both should provide identical API responses. You can switch between them by stopping one and starting the other.

## API Endpoints to Verify

Test these endpoints to ensure compatibility:

```bash
# Get config
curl http://localhost:8765/api/config

# Get projects
curl http://localhost:8765/api/projects

# Get slash commands
curl http://localhost:8765/api/slash-commands
```

## Known Issues

1. **node-pty build**: Requires native compilation
2. **Workspace dependencies**: Need proper pnpm setup
3. **TypeScript paths**: Must use .js extensions in imports

## Development Tips

1. **Watch mode**: The new backend runs with `tsx watch` for auto-reload
2. **Logging**: Set LOG_LEVEL=debug in .env for detailed logs
3. **TypeScript**: Run `npm run typecheck` to verify types