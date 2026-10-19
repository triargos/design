import { execFile } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createServer, defineConfig, type Plugin } from 'vite';

const exec = promisify(execFile);
const rootDir = fileURLToPath(new URL('.', import.meta.url));
const storybookDir = fileURLToPath(new URL('./storybook', import.meta.url));
const alias = { '~': fileURLToPath(new URL('./src', import.meta.url)) };

// Runs `shadcn build` so registry JSON lands in public/r before Vite copies public/ into the build output. In dev,
// rebuilds when registry sources change.
const shadcnRegistry = (): Plugin => {
  const build = () => exec('pnpm', ['exec', 'shadcn', 'build', '--output', 'public/r']);
  return {
    name: 'shadcn-registry',
    async buildStart() {
      if (this.environment.name !== 'client') return;
      await build();
    },
    configureServer(server) {
      server.watcher.on('change', (file) => {
        if (file.endsWith('registry.json') && !file.includes('/public/r/')) {
          build().catch((error) => server.config.logger.error(String(error)));
        }
      });
    },
  };
};

// Storybook's sidebar order: Foundations in reading order, then Components and Patterns A–Z
// (`.storybook/preview.tsx`, `storySort`; Storybook evals that one as plain JS, so it cannot import this).
const GROUPS = ['foundations', 'components', 'patterns'] as const;
const FOUNDATIONS = ['Color', 'Typography', 'Spacing', 'Surfaces', 'Shape', 'Loading', 'Interaction', 'Motion'];

// `virtual:docs-index`: one page per story file, titled by its `meta.title`, so the docs nav matches Storybook's.
const docsIndex = (): Plugin => {
  const id = 'virtual:docs-index';
  return {
    name: 'docs-index',
    resolveId: (source) => (source === id ? '\0' + id : undefined),
    load(resolved) {
      if (resolved !== '\0' + id) return;
      const pages = GROUPS.flatMap((group) =>
        readdirSync(`${storybookDir}/${group}`)
          .filter((file) => file.endsWith('.stories.tsx'))
          .map((file) => {
            const path = `${storybookDir}/${group}/${file}`;
            this.addWatchFile(path);
            const title = /title:\s*'([^']+)'/.exec(readFileSync(path, 'utf8'))?.[1] ?? file;
            const [groupName = '', name = title] = title.split('/');
            return {
              group: groupName,
              name,
              slug: file.replace('.stories.tsx', ''),
              module: `../storybook/${group}/${file}`,
            };
          })
          .sort((a, b) =>
            group === 'foundations'
              ? FOUNDATIONS.indexOf(a.name) - FOUNDATIONS.indexOf(b.name)
              : a.name.localeCompare(b.name, 'en'),
          ),
      );
      return `export default ${JSON.stringify(pages)};`;
    },
  };
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char);

/**
 * Static HTML for every docs route, after the client build: renders `site/entry-server.tsx` through an SSR dev server
 * (so `import.meta.glob`, `?raw` and `virtual:docs-index` resolve as in the browser) and writes each route into the built
 * `index.html`: `/button` → `button.html`, which Cloudflare serves at `/button`.
 */
const prerender = (): Plugin => ({
  name: 'prerender',
  apply: 'build',
  applyToEnvironment: (environment) => environment.name === 'client',
  async closeBundle() {
    const outDir = join(this.environment.config.root, this.environment.config.build.outDir);
    const server = await createServer({
      configFile: false,
      root: rootDir,
      logLevel: 'error',
      appType: 'custom',
      server: { middlewareMode: true, hmr: false, ws: false },
      plugins: [docsIndex(), react()],
      resolve: { alias },
    });
    try {
      const entry = (await server.ssrLoadModule('/site/entry-server.tsx')) as typeof import('./site/entry-server');
      const template = await readFile(join(outDir, 'index.html'), 'utf8');
      for (const path of entry.paths) {
        const { html, title } = await entry.render(path);
        const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`;
        const page = template
          .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
          .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
        await writeFile(join(outDir, file), page);
      }
      this.environment.logger.info(`Prerendered ${entry.paths.length} pages`);
    } finally {
      await server.close();
    }
  },
});

export default defineConfig({
  plugins: [shadcnRegistry(), docsIndex(), tailwindcss(), react(), prerender()],
  resolve: { alias },
});
