import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { copyFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    {
      name: 'copy-firebase-config',
      closeBundle() {
        try {
          mkdirSync('dist/menu/platform', { recursive: true });
          copyFileSync('menu/platform/firebase-config.js', 'dist/menu/platform/firebase-config.js');
          console.log('✓ Copied Firebase config to dist/menu/platform/');
        } catch (error) {
          console.warn('⚠️ Could not copy firebase-config.js:', error.message);
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin/index.html',
        platformMenu: 'admin/platform-menu.html',
        menuPlatform: 'menu/platform/index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});