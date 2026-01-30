import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/j-curve-fund/',
  build: {
    outDir: '../../j-curve-fund',
    emptyOutDir: true
  }
})
