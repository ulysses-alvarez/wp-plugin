import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  build: {
    outDir: 'wordpress-plugin/dist',
    emptyOutDir: true,

    rollupOptions: {
      output: {
        // Nombres de archivos sin hash para facilitar la carga en WordPress
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',

        // Separar vendor para optimización
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    },

    // Minificación con esbuild (más rápido)
    minify: 'esbuild',

    // Source maps para debugging
    sourcemap: false
  },

  // Para desarrollo local
  server: {
    port: 3000,
    open: true
  }
})
