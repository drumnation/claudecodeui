# Step-by-Step Guide to Test New TypeScript Backend

## Option 1: Test with Minimal Backend (No Terminal)

This is the easiest way to test the new TypeScript architecture without dealing with node-pty issues.

### Step 1: Start the Minimal Backend

```bash
cd apps/backend
PORT=8765 npx tsx src/main-minimal.ts
```

You should see:
```
Minimal TypeScript backend running on http://localhost:8765
```

### Step 2: In a New Terminal, Start the Frontend

```bash
npm run dev
```

The frontend will start on http://localhost:8766

### Step 3: Test Basic Functionality

1. Open http://localhost:8766 in your browser
2. Check browser console for any errors
3. The UI should load (though projects list will be empty)

### Step 4: Verify API Connections

In another terminal:

```bash
# Test health endpoint
curl http://localhost:8765/health

# Test config endpoint
curl http://localhost:8765/api/config

# Test projects endpoint  
curl http://localhost:8765/api/projects
```

## Option 2: Fix node-pty and Run Full Backend

### Step 1: Install node-pty Globally

```bash
npm install -g node-pty
```

### Step 2: Link it to the Backend

```bash
cd apps/backend
npm link node-pty
```

### Step 3: Start the Full Backend

```bash
cd apps/backend
PORT=8765 pnpm run dev
```

## Option 3: Use the Current Backend for Comparison

### Step 1: Start Current Backend

```bash
cd server
PORT=8765 node index.js
```

### Step 2: Start Frontend

```bash
npm run dev
```

### Step 3: Use the Application

Visit http://localhost:8766 and test all features

## What Success Looks Like

1. **Backend starts without errors** on port 8765
2. **Frontend connects successfully** - no WebSocket errors in console
3. **API requests work** - Network tab shows successful API calls
4. **UI is responsive** - Can navigate between sections

## Common Issues and Solutions

### Issue: "Cannot find module" errors

**Solution**: The backend uses workspace dependencies. Either:
- Use the minimal backend (Option 1)
- Install dependencies directly with npm

### Issue: Port already in use

**Solution**: Kill existing process
```bash
lsof -ti:8765 | xargs kill -9
```

### Issue: WebSocket connection fails

**Solution**: Check that backend returns correct wsUrl in /api/config:
```bash
curl http://localhost:8765/api/config
```

## Next Steps

Once basic connection is working:

1. **Implement missing endpoints** in the TypeScript backend
2. **Port project detection logic** from /server to /apps/backend
3. **Run contract tests** to ensure API compatibility
4. **Gradually migrate** from old to new backend

## Quick Test Commands

```bash
# Terminal 1: Start backend
cd apps/backend && PORT=8765 npx tsx src/main-minimal.ts

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Test API
curl http://localhost:8765/health
curl http://localhost:8766/api/config  # Through proxy
```

The goal is to verify that the TypeScript backend architecture works with the existing frontend before investing time in fixing all dependencies.