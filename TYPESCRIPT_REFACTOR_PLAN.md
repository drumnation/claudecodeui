I have created the following plan after thorough exploration and analysis of the codebase. Follow the below plan verbatim. Trust the files and references. Do not re-verify what's written in the plan. Explore only when absolutely necessary. First implement all the proposed file changes and then I'll review all the changes together at the end. Make sure you fix all the linting, compilation or validation issues after successful implementation of the plan.

### Observations

I analyzed the current frontend codebase structure and found it's a comprehensive React application in \`/src\` using JavaScript with Vite, Storybook, emotion/styled components, and twin.macro. The backend has already been migrated to \`/apps/backend\` with TypeScript. The monorepo has established tooling packages for ESLint, Prettier, TypeScript, and testing configurations. All frontend dependencies are TypeScript-compatible, and the current build/dev setup is well-configured with proper API/WebSocket connectivity to the backend.

### Approach

This plan uses a **wholesale copy approach** to minimize risk of breaking functionality or styling. The strategy is to:

1. **Bootstrap** the new frontend app structure in \`/apps/frontend\`
2. **Copy** the entire \`/src\` directory and related config files to preserve all functionality
3. **Update** configuration files to work with the new location and TypeScript
4. **Configure** TypeScript with \`allowJs: true\` for zero-friction initial migration
5. **Connect** to the existing backend through updated proxy and environment variables
6. **Validate** that everything works identically before cleaning up the old structure

This approach ensures no functionality or styling changes while establishing the foundation for incremental TypeScript adoption.

### Reasoning

I examined the current monorepo structure and found the backend already migrated to TypeScript in \`/apps/backend\`. I analyzed the root package.json to understand frontend dependencies and their TypeScript compatibility. I reviewed all configuration files (Vite, Tailwind, PostCSS, Storybook) to understand path dependencies and required updates. I examined the backend connection patterns through API configuration and WebSocket setup. I analyzed the frontend source structure to understand the features-based organization and file naming patterns that will need TypeScript conversion.

## Mermaid Diagram

sequenceDiagram
    participant Dev as Developer
    participant Root as Root Package
    participant Frontend as Frontend App
    participant Backend as Backend App
    participant Tooling as Tooling Packages

    Note over Dev,Tooling: Phase 1: Bootstrap Structure
    Dev->>Frontend: Create apps/frontend directory
    Dev->>Frontend: Create package.json with @claude-code-ui/frontend
    Dev->>Frontend: Setup TypeScript config extending @kit/tsconfig/react

    Note over Dev,Tooling: Phase 2: Wholesale Copy
    Dev->>Root: Copy entire /src to apps/frontend/src
    Dev->>Frontend: Copy config files (vite, tailwind, postcss, etc.)
    Dev->>Frontend: Copy .storybook directory
    Dev->>Frontend: Copy public directory and index.html

    Note over Dev,Tooling: Phase 3: Configuration Updates
    Dev->>Frontend: Update vite.config.ts with new paths
    Dev->>Frontend: Update tailwind.config.js content paths
    Dev->>Frontend: Update .storybook configs for new location
    Dev->>Frontend: Update api.js to use VITE_BACKEND_URL

    Note over Dev,Tooling: Phase 4: Toolchain Integration
    Frontend->>Tooling: Import @kit/testing for vitest config
    Frontend->>Tooling: Extend @kit/eslint-config/react
    Frontend->>Tooling: Use @kit/prettier-config
    Frontend->>Tooling: Use @kit/tsconfig/react

    Note over Dev,Tooling: Phase 5: Backend Connectivity
    Frontend->>Backend: Proxy /api requests to port 8765
    Frontend->>Backend: Proxy /ws WebSocket to port 8765
    Frontend->>Backend: Use VITE_BACKEND_URL environment variable

    Note over Dev,Tooling: Phase 6: Validation & Cleanup
    Dev->>Frontend: Test dev server starts correctly
    Dev->>Frontend: Verify Storybook works
    Dev->>Frontend: Run tests and linting
    Dev->>Root: Remove old /src and config files
    Dev->>Root: Update root package.json scripts

## Proposed File Changes

### apps/frontend(NEW)

Create the new frontend application directory following monorepo structure conventions.

### apps/frontend/src(NEW)

References: 

- src

Create the source directory that will contain the copied frontend source code.
Copy the entire contents of \`/Users/dmieloch/Dev/experiments/cc-ui/claudecodeui/src/\` to this directory using \`rsync -a\` or similar to preserve timestamps and permissions. This wholesale copy ensures no functionality is lost during the migration. All subdirectories and files should be copied exactly as they are: \`app/\`, \`components/\`, \`config/\`, \`contexts/\`, \`features/\`, \`hooks/\`, \`layouts/\`, \`lib/\`, \`logger/\`, \`shared-components/\`, \`utils/\`, and \`index.css\`.

### apps/frontend/package.json(NEW)

References: 

- package.json(MODIFY)
- apps/backend/package.json

Create the frontend application package.json following monorepo conventions. Set \`name\` to \`@claude-code-ui/frontend\`, \`version\` to \`1.0.0\`, \`private\` to true, and \`type\` to \`module\`. Include scripts for \`dev\` (vite dev), \`build\` (vite build), \`preview\` (vite preview), \`storybook\` (storybook dev -p 6006), \`build-storybook\` (storybook build), \`clean\` (rimraf node_modules .turbo dist), \`lint\` (eslint . --ext .ts,.tsx,.js,.jsx), \`format\` (prettier --check), \`typecheck\` (tsc --noEmit), \`test\` (vitest run), \`test:watch\` (vitest watch), \`test:ui\` (vitest --ui), and \`test:coverage\` (vitest run --coverage). Move all frontend runtime dependencies from the root package.json including React, emotion, CodeMirror, DnD Kit, Tailwind, Lucide, twin.macro, Vite plugins, and xterm packages. Include workspace dependencies \`@kit/logger\` and \`@kit/brain-monitor\`. Add devDependencies for Storybook, Vite, TypeScript tooling, testing, and workspace packages \`@kit/eslint-config\`, \`@kit/prettier-config\`, \`@kit/tsconfig\`, and \`@kit/testing\`. Configure eslintConfig to extend \`@kit/eslint-config/react\` and prettier to use \`@kit/prettier-config\`.

### apps/frontend/tsconfig.json(NEW)

References: 

- tooling/typescript/react.json
- apps/backend/tsconfig.json

Create TypeScript configuration extending \`@kit/tsconfig/react\` from the tooling package. Set \`rootDir\` to \`./src\`, \`baseUrl\` to \`./src\`, and configure path mapping with \`paths: { \"@/*\": [\"*\"] }\` to maintain the existing alias. Enable \`allowJs: true\` and set \`checkJs: false\` to allow JavaScript files to compile without type checking during the migration phase. Set \`noEmit: true\` since Vite handles compilation. Include \`src\`, \`vite.config.ts\`, \`.storybook\`, and \`vitest.config.ts\` in the compilation. Add types for \`vite/client\`, \`vitest/globals\`, and \`node\`.

### apps/frontend/vite.config.ts(NEW)

References: 

- vite.config.js(DELETE)

Copy and convert the existing vite.config.js to TypeScript. Update imports to use proper TypeScript syntax and import types from 'vite/config'. Update the path alias resolution to use \`import.meta.dirname\` instead of \`__dirname\` for ESM compatibility. Maintain all existing configuration including the ngrok detection, HMR settings, server configuration with port 8766, proxy settings for \`/api\`, \`/ws\`, and \`/shell\` to the backend on port 8765, CORS enablement, and Storybook integration. Update the Storybook config path to point to the local \`.storybook\` directory and setup files. Preserve all plugins including React with emotion Babel plugin, Babel macros, and console forward plugin.

### apps/frontend/tailwind.config.js(NEW)

References: 

- tailwind.config.js(DELETE)

Copy the existing tailwind.config.js and update the content paths to scan for TypeScript files. Change the content array to include \`./index.html\` and \`./src/**/*.{js,ts,jsx,tsx,mdx}\` to ensure Tailwind processes both JavaScript and TypeScript files. Maintain all existing theme customizations, color variables, spacing, border radius, and plugin configurations to preserve the current styling.

### apps/frontend/postcss.config.js(NEW)

References: 

- postcss.config.js(DELETE)

Copy the existing postcss.config.js exactly as it is. The configuration with \`tailwindcss\` and \`autoprefixer\` plugins requires no changes and will work in the new location.

### apps/frontend/index.html(NEW)

References: 

- index.html(DELETE)

Copy the existing index.html and initially keep the script src pointing to \`/src/app/main.jsx\`. All PWA manifest, meta tags, icons, and service worker configuration should be preserved exactly to maintain mobile and PWA functionality. The entry point can be updated to \`/src/app/main.tsx\` later during the TypeScript conversion phase.

### apps/frontend/.storybook(NEW)

Copy the entire \`.storybook\` directory from the root to maintain Storybook configuration and setup.

### apps/frontend/.storybook/main.js(NEW)

References: 

- .storybook/main.js

Update the stories paths to include TypeScript extensions. Change the stories array to \`['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)']\` to support both JavaScript and TypeScript story files. Maintain all existing addons (Chromatic, Docs, A11y, Vitest) and the React Vite framework configuration. Preserve the viteFinal function that ensures Babel macros plugin is included for twin.macro support.

### apps/frontend/.storybook/preview.js(NEW)

References: 

- .storybook/preview.js

Update the CSS import path to \`../src/index.css\` to match the new relative location. Preserve all existing configuration including theme wrapper, API mocking for stories, viewport settings, accessibility configuration, global types for theme/outline/measure toggles, and decorators. This ensures Storybook continues to work with the same visual and functional behavior.

### apps/frontend/.storybook/vitest.setup.js(NEW)

References: 

- .storybook/vitest.setup.js

Copy the existing vitest.setup.js and update any relative imports if needed. Preserve the Storybook project annotations setup, global CSS import, and mocks for ResizeObserver and IntersectionObserver that are required for component testing.

### apps/frontend/vitest.config.ts(NEW)

References: 

- tooling/testing/package.json
- vitest-unit.config.js(DELETE)

Create a new Vitest configuration using the unified testing configuration from the tooling package. Import \`configs\` from \`@kit/testing\` and export \`await configs.vitest.unit()\` as the default configuration. This leverages the monorepo's centralized testing setup while allowing for frontend-specific overrides if needed.

### apps/frontend/public(NEW)

Copy the entire \`public\` directory from the root to the frontend app to maintain all static assets, icons, manifest, and service worker files that are required for PWA functionality.

### apps/frontend/.env.example(NEW)

References: 

- .env.example

Create an environment variables example file for the frontend app. Include \`VITE_BACKEND_URL=http://localhost:8765\` (replacing the old REACT_APP_BACKEND_URL), \`VITE_LOG_LEVEL=info\`, \`VITE_LOG_THEME=Classic\`, \`VITE_PORT=8766\`, and \`VITE_API_PORT=8765\`. This documents the required environment variables for the frontend application.

### apps/frontend/src/config/api.js(NEW)

References: 

- src/config/api.js

Update the environment variable usage to use Vite conventions. Change \`process.env.REACT_APP_BACKEND_URL\` to \`import.meta.env.VITE_BACKEND_URL\` while keeping the same default value of \`http://localhost:8765\`. This maintains backend connectivity while following Vite environment variable naming conventions. All endpoint definitions and helper functions remain unchanged.

### package.json(MODIFY)

Remove frontend-specific scripts and dependencies that have been moved to the frontend app. Remove scripts: \`build\`, \`client:dev\`, \`client\`, \`preview\`, \`storybook\`, \`build-storybook\`. Update the \`dev\` script to only run the backend: \`cd apps/backend && npm run dev\`. Remove frontend dependencies: React, emotion, CodeMirror, DnD Kit, Tailwind, Lucide, twin.macro, Vite plugins, xterm packages, and Storybook packages. Keep backend/server dependencies and shared tooling. Remove frontend devDependencies but keep shared ones like \`@types/node\`, \`vitest\`, and \`concurrently\`. This cleans up the root package.json to focus on monorepo-level concerns.

### src(DELETE)

Delete the original frontend source directory after verifying that the new frontend app works correctly. This should only be done after successful testing of the migrated frontend.

### vite.config.js(DELETE)

Delete the root Vite configuration file as it has been moved to the frontend app.

### tailwind.config.js(DELETE)

Delete the root Tailwind configuration file as it has been moved to the frontend app.

### postcss.config.js(DELETE)

Delete the root PostCSS configuration file as it has been moved to the frontend app.

### index.html(DELETE)

Delete the root HTML file as it has been moved to the frontend app.

### vitest-unit.config.js(DELETE)

Delete the root Vitest configuration file as testing is now handled by the frontend app's configuration.

### .storybook(DELETE)

Delete the root Storybook directory as it has been moved to the frontend app.

### public(DELETE)

Delete the root public directory as it has been moved to the frontend app.

# TypeScript Frontend Refactor Plan - Enhanced

## Overview
This plan combines Traycer's risk-free migration strategy with cherry-picked configurations from the previous TypeScript refactor attempt. The approach is **RISK FREE** - no structural changes, just adding TypeScript support through wholesale copying and configuration updates.

## Pre-Execution Checklist
- [ ] Git working tree is clean
- [ ] Current branch: `fix/restore-core-functionality`
- [ ] Backend is working at `apps/backend`
- [ ] Ports 8765 (backend) and 8766 (frontend) are available

## Phase 1: Bootstrap Frontend App Structure

### Create apps/frontend/package.json
```json
{
  "name": "@claude-code-ui/frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Frontend app for Claude Code UI",
  "scripts": {
    "dev": "vite --host --port 8766",
    "build": "vite build",
    "preview": "vite preview",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "clean": "rimraf node_modules .turbo dist",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format": "prettier --check \"**/*.{ts,tsx,js,jsx}\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@anthropic-ai/claude-code": "^1.0.24",
    "@codemirror/lang-css": "^6.3.1",
    "@codemirror/lang-html": "^6.4.9",
    "@codemirror/lang-javascript": "^6.2.4",
    "@codemirror/lang-json": "^6.0.1",
    "@codemirror/lang-markdown": "^6.3.3",
    "@codemirror/lang-python": "^6.2.1",
    "@codemirror/state": "^6.5.2",
    "@codemirror/theme-one-dark": "^6.1.2",
    "@codemirror/view": "^6.38.0",
    "@dnd-kit/core": "^6.2.0",
    "@dnd-kit/sortable": "^9.0.0",
    "@emotion/css": "^11.13.5",
    "@emotion/react": "^11.13.5",
    "@emotion/styled": "^11.13.5",
    "@kit/brain-monitor": "workspace:*",
    "@kit/logger": "workspace:*",
    "@tailwindcss/typography": "^0.5.16",
    "@uiw/react-codemirror": "^4.23.13",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.515.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-markdown": "^10.1.0",
    "react-router-dom": "^6.8.1",
    "tailwind-merge": "^3.3.1",
    "twin.macro": "^3.4.1"
  },
  "devDependencies": {
    "@chromatic-com/storybook": "^4.0.1",
    "@emotion/babel-plugin": "^11.13.5",
    "@kit/eslint-config": "workspace:*",
    "@kit/prettier-config": "workspace:*",
    "@kit/testing": "workspace:*",
    "@kit/tsconfig": "workspace:*",
    "@storybook/addon-a11y": "^9.0.15",
    "@storybook/addon-docs": "^9.0.15",
    "@storybook/addon-vitest": "^9.0.15",
    "@storybook/react-vite": "^9.0.15",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitest/browser": "^3.2.4",
    "@vitest/coverage-v8": "^3.2.4",
    "autoprefixer": "^10.4.16",
    "jsdom": "^26.1.0",
    "playwright": "^1.53.2",
    "postcss": "^8.4.32",
    "storybook": "^9.0.15",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.8",
    "vite-plugin-babel-macros": "^1.0.6",
    "vitest": "^3.2.4"
  },
  "eslintConfig": {
    "root": true,
    "extends": ["@kit/eslint-config/react"]
  },
  "prettier": "@kit/prettier-config",
  "babelMacros": {
    "twin": {
      "preset": "emotion"
    }
  }
}
```

### Create apps/frontend/tsconfig.json
```json
{
  "extends": "@kit/tsconfig/react",
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    },
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "types": ["vite/client", "vitest/globals", "node"]
  },
  "include": [
    "src",
    "vite.config.ts",
    ".storybook",
    "vitest.config.ts"
  ],
  "exclude": ["node_modules", "dist"]
}
```

## Phase 2: Wholesale Copy Source and Configs

### Copy Commands (execute in order)
```bash
# Create directory structure
mkdir -p apps/frontend/src
mkdir -p apps/frontend/.storybook
mkdir -p apps/frontend/public

# Copy entire source directory
rsync -a src/ apps/frontend/src/

# Copy configuration files
cp vite.config.js apps/frontend/vite.config.ts
cp tailwind.config.js apps/frontend/
cp postcss.config.js apps/frontend/
cp index.html apps/frontend/

# Copy Storybook
rsync -a .storybook/ apps/frontend/.storybook/

# Copy public assets
rsync -a public/ apps/frontend/public/
```

## Phase 3: Update Configuration Files

### Update apps/frontend/vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import babel from 'vite-plugin-babel-macros'
import { createConsoleForwardPlugin } from 'vite-console-forward-plugin'

// Detect if running with ngrok
const NGROK_URL = process.env.NGROK_URL
const isNgrokMode = !!NGROK_URL

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    }),
    babel(),
    createConsoleForwardPlugin()
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src')
    }
  },
  server: {
    host: true,
    port: 8766,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8765',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:8765',
        ws: true,
        changeOrigin: true
      },
      '/shell': {
        target: 'http://localhost:8765',
        changeOrigin: true,
        secure: false
      }
    },
    cors: true,
    hmr: isNgrokMode ? {
      port: 8766,
      host: 'localhost'
    } : true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Update apps/frontend/tailwind.config.js
```javascript
// Update content paths for TypeScript
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  // ... rest of config stays the same
}
```

### Update apps/frontend/.storybook/main.js
```javascript
export default {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  // ... rest stays the same
}
```

### Update apps/frontend/.storybook/preview.js
```javascript
import '../src/index.css'
// ... rest stays the same
```

### Create apps/frontend/vitest.config.ts
```typescript
import { configs } from '@kit/testing'

export default await configs.vitest.unit()
```

### Update apps/frontend/src/config/api.js
```javascript
// Change environment variable to Vite convention
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8765'
// ... rest stays the same
```

### Create apps/frontend/.env.example
```
VITE_BACKEND_URL=http://localhost:8765
VITE_LOG_LEVEL=info
VITE_LOG_THEME=Classic
VITE_PORT=8766
VITE_API_PORT=8765
```

## Phase 4: Update Root Package.json

### Remove from root package.json
- Remove scripts: `build`, `client:dev`, `client`, `preview`, `storybook`, `build-storybook`
- Update `dev` script to: `concurrently --kill-others --names \"API,WEB\" --name-color \"bgBlue.bold,bgGreen.bold\" --prefix \"{name}\" --prefix-color \"auto\" \"npm run backend:dev\" \"cd apps/frontend && npm run dev\"`
- Remove frontend dependencies (move them to apps/frontend/package.json)

## Phase 5: Validation Steps

### Test Each Phase
```bash
# After Phase 2 - Test basic setup
cd apps/frontend
npm install

# After Phase 3 - Test dev server
npm run dev
# Should start on http://localhost:8766

# Test Storybook
npm run storybook
# Should start on http://localhost:6006

# Test API connectivity
# Visit http://localhost:8766 and verify backend connection

# Test build
npm run build

# Test linting/formatting
npm run lint
npm run format
npm run typecheck
```

## Phase 6: Cleanup (Only After Validation)

### Delete Old Files (ONLY after confirming everything works)
```bash
rm -rf src/
rm -f vite.config.js
rm -f tailwind.config.js
rm -f postcss.config.js
rm -f index.html
rm -f vitest-unit.config.js
rm -rf .storybook/
rm -rf public/
```

## Cherry-Picked Enhancements (Future)

From the previous TypeScript refactor attempt, these can be added later:
- Advanced testing configurations (visual, e2e, Playwright)
- Strict TypeScript mode (`strict: true`)
- Comprehensive Storybook testing
- Visual regression testing

## Success Criteria

- [ ] Frontend starts on http://localhost:8766
- [ ] Backend API calls work correctly
- [ ] Storybook loads and displays components
- [ ] No console errors in browser
- [ ] All existing functionality preserved
- [ ] TypeScript compilation passes
- [ ] Tests run successfully

## Rollback Plan

If anything fails:
```bash
git checkout -- .
git clean -fd
```

The wholesale copy approach ensures original functionality is never lost.