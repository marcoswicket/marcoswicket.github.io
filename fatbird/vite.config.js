// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // This is important for GitHub Pages
  build: {
    outDir: 'dist',
  }
})