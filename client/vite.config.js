import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: path.resolve(__dirname, '../server/public'),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:16888',
        changeOrigin: true,
      },
    },
  },
});
