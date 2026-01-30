import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/risk-visualizer/',
  build: {
    outDir: '../../risk-visualizer',
    emptyOutDir: true
  }
})
