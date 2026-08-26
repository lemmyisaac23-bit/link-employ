import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom domain: https://worklinkus.com
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Avoid GitHub Pages quirks with a top-level /assets path
    assetsDir: 'static',
  },
})
