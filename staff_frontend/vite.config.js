import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api is proxied to the deployed backend; in production nginx does the same.
export default defineConfig({
  plugins: [react()],
  // /order-agent/staff/ behind the shared nginx/ngrok path router on 192.168.1.100; VITE_BASE=/ for Vercel.
  base: process.env.VITE_BASE || '/order-agent/staff/',
  server: {
    port: 5174,
    proxy: {
      '/order-agent/staff/api': {
        target: 'http://192.168.1.100:30881',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/order-agent\/staff/, ''),
      },
    },
  },
})
