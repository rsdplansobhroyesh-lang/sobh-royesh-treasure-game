import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: ['es2022', 'chrome109', 'safari16.4', 'firefox115'],
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
  },
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
})
