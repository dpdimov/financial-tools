import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/j-curve-explorer/',
  build: {
    outDir: '../../j-curve-explorer',
    emptyOutDir: true
  }
})
