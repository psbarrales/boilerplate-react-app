/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import path from 'path';
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
    react(),
    legacy(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // Activa el Service Worker en desarrollo
      },
      manifest: {
        name: 'Nombre de tu App',
        short_name: 'App',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3f51b5',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@application': path.resolve(__dirname, './src/application'),
      '@components': path.resolve(__dirname, './src/theme/components'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@providers': path.resolve(__dirname, './src/providers'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@theme': path.resolve(__dirname, './src/theme'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
