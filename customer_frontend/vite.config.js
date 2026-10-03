import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api is proxied to the deployed backend; in production nginx does the same.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    proxy: { '/api': { target: 'http://192.168.1.100:30881', changeOrigin: true } },
  },
})
