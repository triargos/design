import { foldkit } from '@foldkit/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), foldkit()],
  publicDir: '../public',
  optimizeDeps: { entries: ['src/entry.ts'] },
  server: { fs: { allow: ['..'] } },
});
