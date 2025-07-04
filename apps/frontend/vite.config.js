/// <reference types="vitest/config" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath, URL} from 'node:url';
import path from 'node:path';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  define: {
    // Inject LOG_LEVEL environment variable for pino
    'process.env.LOG_LEVEL': JSON.stringify(
      process.env.VITE_LOG_LEVEL || 'info',
    ),
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development',
    ),
  },
  resolve: {
    alias: {
      // Path alias for clean imports
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Use pino browser version for client-side code
      pino: 'pino/browser',
    },
  },
  server: {
    port: process.env.VITE_PORT || 8766,
    strictPort: true,
    host: true,
    hmr: {
      // Use different HMR settings based on whether ngrok is being used
      ...(process.env.NGROK_URL
        ? {
            clientPort: 443,
            protocol: 'wss',
          }
        : {
            // For local development, use the same port as the dev server
            port: process.env.VITE_PORT || 8766,
            host: 'localhost',
          }),
    },
    watch: {
      // Use native fs events for better performance
      usePolling: false,
      // Fallback polling configuration for problematic filesystems
      // Enable if HMR fails on WSL, Docker, or network filesystems
      // usePolling: true,
      // interval: 100,
      // binaryInterval: 300,
    },
    fs: {
      // Ensure all source files are accessible for HMR
      allow: [
        // Allow access to the entire project
        '..',
        // Allow access to node_modules
        process.cwd(),
        // Allow access to workspace packages
        path.resolve(process.cwd(), '../..'),
      ],
    },
    allowedHosts: [
      'localhost',
      '.ngrok.app',
      '.ngrok-free.app',
      '.ngrok.io',
      'claude-code.ngrok.io',
    ],
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.VITE_API_PORT || 8767}`,
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: `ws://localhost:${process.env.VITE_API_PORT || 8767}`,
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Clear output directory before build
    emptyOutDir: true,
    // Configure tree-shaking for production builds
    rollupOptions: {
      treeshake: {
        // Remove unused pino code in production
        moduleSideEffects: false,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['pino', 'pino/browser'],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
