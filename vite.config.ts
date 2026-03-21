import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative asset URLs so CSS/JS still load when app is served from a sub-path.
  base: './',
  plugins: [react(), tsconfigPaths()],
  publicDir: './public',
  server: {
    // Telegram in-app webviews can loop reconnect/reload with Vite HMR.
    // Keep dev mode stable for demo testing.
    hmr: false,
    proxy: {
      '/shared-feed': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});

