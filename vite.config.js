import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests starting with '/api' during development
      '/api': {
        target: 'http://localhost:3000', // Target port for Vercel Serverless Functions running via 'vercel dev'
        changeOrigin: true, // Recommended for virtual hosted sites
        // Path rewrite is not needed as the target expects the full path (e.g., /api/generate)
      },
    },
  },
  build: {
    outDir: 'dist', // Specify the output directory for production builds
  },
});