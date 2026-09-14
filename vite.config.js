import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    emptyOutDir: true,

    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/background.js'),
        content: resolve(__dirname, 'src/content/content.js'),
        sidebar: resolve(__dirname, 'sidepanel.html'),
      },

      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      },
    },

    sourcemap: mode !== 'production'
  },
}));