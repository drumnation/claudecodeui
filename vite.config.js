import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.VITE_PORT || 8766,
    hmr: {
      clientPort: 443
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