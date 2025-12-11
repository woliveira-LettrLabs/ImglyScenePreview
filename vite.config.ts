import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages (set via VITE_BASE_PATH env var, defaults to '/')
  // For GitHub Pages with custom domain, use '/'
  // For GitHub Pages with repository name, use '/repository-name/'
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 3002,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})

