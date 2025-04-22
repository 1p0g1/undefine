/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { configDefaults, defineConfig as defineVitestConfig } from 'vitest/config'
// @ts-ignore - The module works but TypeScript doesn't recognize its exports correctly
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../packages/shared-types/dist'),
      'shared-types': path.resolve(__dirname, '../packages/shared-types/dist')
    }
  },
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  preview: {
    strictPort: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    force: true,
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001')
  },
  test: {
    ...configDefaults,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    includeSource: ['src/**/*.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/test/**']
    }
  }
})
