/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import macrosPlugin from 'vite-plugin-babel-macros';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(async () => {
  const { consoleForwardPlugin } = await import('vite-console-forward-plugin');
  
  return {
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src')
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [
          [
            '@emotion/babel-plugin',
            {
              sourceMap: true,
              autoLabel: 'dev-only',
              labelFormat: '[local]',
              cssPropOptimization: true
            }
          ]
        ]
      }
    }),
    macrosPlugin(),
    consoleForwardPlugin()
  ],
  server: {
    port: process.env.VITE_PORT || 8766,
    strictPort: true,
    host: true,
    hmr: {
      // Use different HMR settings based on whether ngrok is being used
      ...(process.env.NGROK_URL ? {
        clientPort: 443,
        protocol: 'wss'
      } : {
        // For local development, use the same port as the dev server
        port: process.env.VITE_PORT || 8766,
        host: 'localhost'
      })
    },
    watch: {
      // Force polling in case native fs events aren't working
      usePolling: true,
      interval: 100
    },
    allowedHosts: ['localhost', '.ngrok.app', '.ngrok-free.app', '.ngrok.io', 'claude-code.ngrok.io'],
    proxy: {
      '/api': `http://localhost:${process.env.VITE_API_PORT || 8765}`,
      '/ws': {
        target: `ws://localhost:${process.env.VITE_API_PORT || 8765}`,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    // Clear output directory before build
    emptyOutDir: true
  },
  // Ensure we're not caching aggressively
  optimizeDeps: {
    force: true
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: 'playwright',
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.js']
      }
    }]
  }
  };
});