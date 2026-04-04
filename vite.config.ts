import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    css: true,
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts'
  }
});
