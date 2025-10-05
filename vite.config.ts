import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    hmr: {
      clientPort: 443,
      host: process.env.REPLIT_DEV_DOMAIN,
    },
  },
});
