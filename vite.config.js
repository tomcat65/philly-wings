import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        dashboard: 'dashboard.html',
        badges: 'badges.html',
        admin: 'admin/index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});