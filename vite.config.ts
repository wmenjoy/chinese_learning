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
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'katex': ['katex'],
          'react-vendor': ['react', 'react-dom'],
          'markdown-vendor': ['react-markdown', 'remark-math', 'rehype-katex']
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['katex', 'react-markdown', 'remark-math', 'rehype-katex']
  },
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  }
})
