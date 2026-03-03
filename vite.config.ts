import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['pixi.js'],
          audio: ['howler']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pixi.js', 'howler']
  },
  server: {
    port: 3000,
    open: true
  }
});