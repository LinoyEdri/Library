import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Fail loudly if 3000 is taken, instead of moving to 3001 (the backend port)
    strictPort: true,
    // Proxy API calls to the backend so the browser only ever talks to
    // one origin. This keeps requests same-origin and avoids CORS entirely.
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
