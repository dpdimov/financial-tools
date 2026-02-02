import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/financial-tools/cap-table/',
  build: {
    outDir: '../../cap-table',
    emptyOutDir: true
  }
})
