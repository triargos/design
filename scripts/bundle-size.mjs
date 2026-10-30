import { build } from 'esbuild';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { gzipSync } from 'node:zlib';

const { values: options } = parseArgs({
  options: {
    root: { type: 'string', default: join(import.meta.dirname, '..') },
    json: { type: 'string' },
    compare: { type: 'string' },
    markdown: { type: 'string' },
  },
});

const root = resolve(options.root);
const uiDir = join(root, 'src/components/ui');
const hooksDir = join(root, 'src/hooks');
const exportAll = (path) => `export * from '${path}';`;

const typicalApp = [
  'button',
  'dialog',
  'select',
  'input',
  'tooltip',
  'dropdown-menu',
  'field',
  'badge',
  'card',
  'table',
  'tabs',
  'toast',
  'sidebar',
];

const listModules = (dir, extensions) =>
  readdirSync(dir)
    .filter((file) => extensions.some((extension) => file.endsWith(extension)))
    .map((file) => ({ name: file.replace(/\.tsx?$/, ''), path: join(dir, file) }));

const components = listModules(uiDir, ['.tsx']);
const hooks = listModules(hooksDir, ['.ts', '.tsx']);

const fixtures = [
  { name: 'everything', group: 'total', code: components.map((module) => exportAll(module.path)).join('\n') },
  {
    name: 'typical app',
    group: 'total',
    code: typicalApp.map((name) => exportAll(join(uiDir, `${name}.tsx`))).join('\n'),
  },
  ...components.map((module) => ({ name: module.name, group: 'component', code: exportAll(module.path) })),
  ...hooks.map((module) => ({ name: module.name, group: 'hook', code: exportAll(module.path) })),
];

const packageOf = (input) => {
  const match = input.match(/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?((?:@[^/]+\/)?[^/]+)/);
  return match ? match[1] : 'own';
};

const fixtureDir = mkdtempSync(join(tmpdir(), 'bundle-size-'));

const gzipSize = (contents) => gzipSync(contents, { level: 9 }).length;

const measure = async ({ name, group, code }) => {
  const entry = join(fixtureDir, `${name.replaceAll(' ', '-')}.tsx`);
  writeFileSync(entry, code);
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    splitting: true,
    outdir: join(fixtureDir, 'out'),
    minify: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    nodePaths: [join(root, 'node_modules')],
    alias: { '~': join(root, 'src') },
    define: { 'process.env.NODE_ENV': '"production"' },
    metafile: true,
    logLevel: 'silent',
  });
  const contentsOf = new Map(result.outputFiles.map((file) => [relative(process.cwd(), file.path), file.contents]));
  const outputs = result.metafile.outputs;
  const entryOutput = Object.keys(outputs).find((path) => outputs[path].entryPoint);
  const initial = new Set();
  const visit = (path) => {
    if (initial.has(path)) return;
    initial.add(path);
    for (const imported of outputs[path].imports)
      if (imported.kind === 'import-statement' && !imported.external) visit(imported.path);
  };
  visit(entryOutput);
  const packages = {};
  let gzip = 0;
  let lazyGzip = 0;
  for (const [path, output] of Object.entries(outputs)) {
    if (!path.endsWith('.js')) continue;
    const size = gzipSize(contentsOf.get(path));
    if (initial.has(path)) gzip += size;
    else lazyGzip += size;
    if (!initial.has(path)) continue;
    for (const [input, { bytesInOutput }] of Object.entries(output.inputs)) {
      const name = packageOf(input);
      packages[name] = (packages[name] ?? 0) + bytesInOutput;
    }
  }
  const largest = Object.entries(packages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);
  return { name, group, gzip, lazyGzip, largest };
};

const results = [];
for (const fixture of fixtures) results.push(await measure(fixture));
rmSync(fixtureDir, { recursive: true, force: true });

const kilobytes = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
const signedKilobytes = (bytes) =>
  `${bytes > 0 ? '+' : bytes < 0 ? '−' : '±'}${(Math.abs(bytes) / 1024).toFixed(1)} kB`;
const noticeableBytes = 102;

const table = (rows, base) => {
  const byName = new Map(base?.map((row) => [row.name, row]));
  const header = base
    ? ['| Import | gzip | Δ | Lazy | Largest parts |', '| --- | ---: | ---: | ---: | --- |']
    : ['| Import | gzip | Lazy | Largest parts |', '| --- | ---: | ---: | --- |'];
  const lines = rows.map((row) => {
    const before = byName.get(row.name);
    const delta = before ? signedKilobytes(row.gzip - before.gzip) : 'new';
    const lazy = row.lazyGzip ? kilobytes(row.lazyGzip) : '–';
    const cells = [`\`${row.name}\``, kilobytes(row.gzip), ...(base ? [delta] : []), lazy, row.largest.join(', ')];
    return `| ${cells.join(' | ')} |`;
  });
  return [...header, ...lines].join('\n');
};

const report = (rows, base) => {
  const sorted = (group) => rows.filter((row) => row.group === group).sort((a, b) => b.gzip - a.gzip);
  const totals = sorted('total');
  const changed = base
    ? rows.filter((row) => {
        const before = base.find((entry) => entry.name === row.name);
        return row.group !== 'total' && (!before || Math.abs(row.gzip - before.gzip) >= noticeableBytes);
      })
    : [];
  const removed = base ? base.filter((entry) => !rows.some((row) => row.name === entry.name)) : [];
  const sections = ['<!-- bundle-size -->', '## Bundle size', '', table(totals, base)];
  if (base) {
    sections.push(
      '',
      changed.length
        ? `**Changed by 0.1 kB or more**\n\n${table(
            changed.sort((a, b) => b.gzip - a.gzip),
            base,
          )}`
        : 'No component moved 0.1 kB or more.',
    );
    if (removed.length) sections.push('', `Removed: ${removed.map((entry) => `\`${entry.name}\``).join(', ')}`);
  }
  sections.push(
    '',
    '<details><summary>Every component and hook</summary>',
    '',
    table([...sorted('component'), ...sorted('hook')], base),
    '',
    '</details>',
    '',
    'Each import bundled alone by esbuild, minified, React external, gzip level 9 (`pnpm bundle-size`). gzip: what loads with the import. Lazy: chunks it loads later through `import()`.',
  );
  return sections.join('\n');
};

if (options.json) writeFileSync(options.json, `${JSON.stringify(results, null, 2)}\n`);
const base = options.compare ? JSON.parse(readFileSync(options.compare, 'utf8')) : undefined;
const markdown = report(results, base);
if (options.markdown) writeFileSync(options.markdown, `${markdown}\n`);
if (!options.json && !options.markdown) {
  for (const row of [...results].sort((a, b) => b.gzip - a.gzip)) {
    console.log(`${kilobytes(row.gzip).padStart(9)}  ${row.name.padEnd(18)} ${row.largest.join(', ')}`);
  }
}
