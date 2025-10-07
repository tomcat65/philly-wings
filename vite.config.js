import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    {
      name: 'copy-firebase-config',
      buildStart() {
        const platformConfigPath = 'menu/platform/firebase-config.js';

        if (!existsSync(platformConfigPath)) {
          const config = {
            apiKey: process.env.VITE_FIREBASE_API_KEY || '',
            authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
            projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
            messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
            appId: process.env.VITE_FIREBASE_APP_ID || ''
          };

          const fileContents = `// Auto-generated during build.\nwindow.__PHILLY_WINGS_FIREBASE_CONFIG__ = ${JSON.stringify(config, null, 2)};\n`;

          mkdirSync('menu/platform', { recursive: true });
          writeFileSync(platformConfigPath, fileContents, 'utf-8');
          console.log('✓ Generated menu/platform/firebase-config.js from environment variables');
        }
      },
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
        publicMenu: 'admin/public-menu.html',
        menuPlatform: 'menu/platform/index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
