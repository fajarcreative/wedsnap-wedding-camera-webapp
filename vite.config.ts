import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: ['es2015', 'chrome64', 'safari12'],
    cssTarget: 'chrome61',
    minify: 'esbuild'
  },
  server: {
    port: 3000,
    host: true
  }
});

