import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Inject LOG_LEVEL environment variable for pino
    'process.env.LOG_LEVEL': JSON.stringify(process.env.VITE_LOG_LEVEL || 'info'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  resolve: {
    alias: {
      // Ensure pino uses the browser version
      'pino': 'pino/browser',
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
      // Force polling in case native fs events aren't working
      usePolling: true,
      interval: 100,
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
  // Ensure we're not caching aggressively
  optimizeDeps: {
    force: true,
    include: ['pino', 'pino/browser'],
  },
});
