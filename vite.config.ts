import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
    exclude: ['onnxruntime-web']
  },
  build: {
    rollupOptions: {
      external: ['onnxruntime-web/webgpu'],
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist']
        }
      }
    }
  },
  worker: {
    format: 'es'
  }
})