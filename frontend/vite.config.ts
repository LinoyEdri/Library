import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Libraries every page needs, in their own long-cached chunks (pages load on demand)
const vendorChunkGroups = [
  {
    name: 'react-vendor',
    test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
    priority: 30,
  },
  {
    name: 'mui-vendor',
    test: /node_modules[\\/](@mui|@emotion|stylis|stylis-plugin-rtl)[\\/]/,
    priority: 20,
  },
  {
    name: 'vendor',
    test: /node_modules[\\/]/,
    priority: 10,
  },
];

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: vendorChunkGroups,
        },
      },
    },
  },
  server: {
    port: 3000,
    // Fail loudly if 3000 is taken, instead of moving to 3001 (the backend port)
    strictPort: true,
    // Proxy API calls to the backend so the browser only ever talks to
    // one origin. This keeps requests same-origin and avoids CORS entirely.
    proxy: {
      '/api': {
        // E2E tests point the proxy at their own backend (port 3101)
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
