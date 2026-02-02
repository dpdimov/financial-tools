import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/financial-tools/market-projection/',
  build: {
    outDir: '../../market-projection',
    emptyOutDir: true
  }
})
