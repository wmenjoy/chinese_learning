import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0'  // 允许局域网访问
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
