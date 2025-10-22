import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // Base path for GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/magic-agent-helix/' : '/',
  build: {
    // Relative to the root of the package
    outDir: 'dist',
  },
});