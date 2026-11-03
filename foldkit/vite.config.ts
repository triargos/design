import { foldkit } from '@foldkit/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), foldkit()],
  publicDir: '../public',
  resolve: { alias: { '~': fileURLToPath(new URL('../src', import.meta.url)) } },
  optimizeDeps: { entries: ['src/entry.ts'] },
  server: { fs: { allow: ['..'] } },
});
