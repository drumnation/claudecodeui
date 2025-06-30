import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.VITE_PORT || 8766,
    hmr: {
      // Use different HMR settings based on whether ngrok is being used
      ...(process.env.NGROK_URL ? {
        clientPort: 443,
        protocol: 'wss'
      } : {
        // For local development, use the same port as the dev server
        port: process.env.VITE_PORT || 8766
      })
    },
    allowedHosts: [
      'localhost',
      '.ngrok.app',
      '.ngrok-free.app',
      '.ngrok.io',
      'claude-code.ngrok.io'
    ],
    proxy: {
      '/api': `http://localhost:${process.env.VITE_API_PORT || 8765}`,
      '/ws': {
        target: `ws://localhost:${process.env.VITE_API_PORT || 8765}`,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})