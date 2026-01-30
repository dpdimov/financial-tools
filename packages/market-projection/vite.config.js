import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/market-projection/',
  build: {
    outDir: '../../market-projection',
    emptyOutDir: true
  }
})
