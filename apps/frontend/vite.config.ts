/// <reference types="vitest/config" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import macrosPlugin from 'vite-plugin-babel-macros';
import {consoleForwardPlugin} from 'vite-console-forward-plugin';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig(() => {
  // Enhanced ngrok detection and configuration
  const isNgrokMode = process.env.NGROK_URL || process.env.NODE_ENV === 'ngrok';
  const ngrokHost = process.env.NGROK_URL
    ? new URL(process.env.NGROK_URL).hostname
    : null;

  console.log('🔧 Vite HMR Configuration:');
  console.log(`   - NGROK_URL: ${process.env.NGROK_URL || 'Not set'}`);
  console.log(`   - Detected ngrok mode: ${isNgrokMode}`);
  console.log(`   - Ngrok host: ${ngrokHost || 'N/A'}`);

  return {
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
      },
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
                cssPropOptimization: true,
              },
            ],
          ],
        },
      }),
      macrosPlugin(),
      consoleForwardPlugin(),
    ],
    server: {
      port: Number(process.env.VITE_PORT) || 8766,
      strictPort: true,
      host: '0.0.0.0', // Listen on all interfaces for ngrok
      hmr: {
        // Use different HMR settings based on whether ngrok is being used
        ...(isNgrokMode
          ? {
              clientPort: 443,
              protocol: 'wss',
              host: ngrokHost || 'localhost',
            }
          : {
              // For local development, use the same port as the dev server
              port: Number(process.env.VITE_PORT) || 8766,
              host: 'localhost',
            }),
      },
      watch: {
        // Force polling in case native fs events aren't working
        usePolling: true,
        interval: 100,
      },
      cors: true, // Enable CORS for mobile access
      proxy: {
        '/api': {
          target: `http://localhost:${Number(process.env.VITE_API_PORT) || 8765}`,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: `ws://localhost:${Number(process.env.VITE_API_PORT) || 8765}`,
          ws: true,
          changeOrigin: true,
          secure: false,
        },
        '/shell': {
          target: `ws://localhost:${Number(process.env.VITE_API_PORT) || 8765}`,
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
      // Enable code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            codemirror: [
              '@codemirror/state',
              '@codemirror/view',
              '@codemirror/lang-javascript',
              '@codemirror/lang-python',
              '@codemirror/lang-json',
              '@codemirror/lang-html',
              '@codemirror/lang-css',
              '@codemirror/lang-markdown',
              '@codemirror/theme-one-dark',
              '@uiw/react-codemirror',
            ],
            terminal: [
              '@xterm/xterm',
              '@xterm/addon-webgl',
              '@xterm/addon-clipboard',
              'xterm',
              'xterm-addon-fit',
            ],
            dnd: ['@dnd-kit/core', '@dnd-kit/sortable'],
            emotion: ['@emotion/react', '@emotion/styled', '@emotion/css'],
          },
        },
      },
      // Optimize chunks
      chunkSizeWarningLimit: 1000,
      // Enable source maps for better debugging
      sourcemap: true,
      // Enable minification
      minify: 'terser' as const,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        '@xterm/xterm',
        '@xterm/addon-webgl',
        '@xterm/addon-clipboard',
        'xterm',
        'xterm-addon-fit',
      ],
      exclude: [
        '@codemirror/lang-javascript',
        '@codemirror/lang-python',
        '@codemirror/lang-json',
        '@codemirror/lang-html',
        '@codemirror/lang-css',
        '@codemirror/lang-markdown',
      ],
    },
  };
});
