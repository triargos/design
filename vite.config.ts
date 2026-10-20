import { execFile } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createServer, defineConfig, parseAst, type Plugin } from 'vite';

const exec = promisify(execFile);
const rootDir = fileURLToPath(new URL('.', import.meta.url));
const docsDir = fileURLToPath(new URL('./docs', import.meta.url));
const alias = { '~': fileURLToPath(new URL('./src', import.meta.url)) };

// Writes `registry.json` from the sources (`scripts/registry.mjs`) and runs `shadcn build`, so registry JSON lands in
// public/r before Vite copies public/ into the build output. In dev, rebuilds when a registry source changes.
const shadcnRegistry = (): Plugin => {
  const build = async () => {
    await exec('node', ['scripts/registry.mjs']);
    await exec('pnpm', ['exec', 'shadcn', 'build', '--output', 'public/r']);
  };
  const isSource = (file: string) => /\/src\/(components\/ui|lib|hooks)\/|\/src\/tailwind\.css$/.test(file);
  return {
    name: 'shadcn-registry',
    async buildStart() {
      if (this.environment.name !== 'client') return;
      await build();
    },
    configureServer(server) {
      server.watcher.on('change', (file) => {
        if (isSource(file)) {
          build().catch((error) => server.config.logger.error(String(error)));
        }
      });
    },
  };
};

// Nav order: Foundations in reading order, then Components and Patterns A–Z.
const GROUPS = ['foundations', 'components', 'patterns'] as const;
const FOUNDATIONS = ['Color', 'Typography', 'Spacing', 'Surfaces', 'Shape', 'Loading', 'Interaction', 'Motion'];

interface ObjectNode {
  readonly properties?: ReadonlyArray<{
    readonly key?: { readonly name?: string };
    readonly value?: { readonly value?: unknown };
  }>;
}

/** `title` and `group` of the module's `export default defineDocs({ … })`. */
const docsHeader = (path: string) => {
  const exported = parseAst(readFileSync(path, 'utf8'), { lang: 'tsx' }).body.find(
    (node) => node.type === 'ExportDefaultDeclaration',
  );
  const options = (exported as { declaration?: { arguments?: ReadonlyArray<ObjectNode> } } | undefined)?.declaration
    ?.arguments?.[0];
  const field = (name: string) => options?.properties?.find((property) => property.key?.name === name)?.value?.value;
  const [title, group] = [field('title'), field('group')];
  if (typeof title !== 'string' || typeof group !== 'string') {
    throw new Error(`${path}: expected \`export default defineDocs({ title, group, … })\``);
  }
  return { title, group };
};

// `virtual:docs-index`: one page per docs module (`docs/{foundations,components,patterns}/<slug>.tsx`).
const docsIndex = (): Plugin => {
  const id = 'virtual:docs-index';
  return {
    name: 'docs-index',
    resolveId: (source) => (source === id ? '\0' + id : undefined),
    load(resolved) {
      if (resolved !== '\0' + id) return;
      const pages = GROUPS.flatMap((folder) =>
        readdirSync(`${docsDir}/${folder}`)
          .filter((file) => file.endsWith('.tsx'))
          .map((file) => {
            const path = `${docsDir}/${folder}/${file}`;
            this.addWatchFile(path);
            const { title, group } = docsHeader(path);
            return { group, name: title, slug: file.replace('.tsx', ''), module: `../docs/${folder}/${file}` };
          })
          .sort((a, b) =>
            folder === 'foundations'
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
    const outDir = resolve(this.environment.config.root, this.environment.config.build.outDir);
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
