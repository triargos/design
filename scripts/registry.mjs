// Writes `registry.json` from the source: one item per file in `src/components/ui`, plus `utils`, the hooks and the
// theme. Package dependencies and the other items a file needs come from its imports, so the registry cannot drift.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const versions = { ...pkg.devDependencies, ...pkg.dependencies };
const PEERS = new Set(['react', 'react-dom']);

const sourceFiles = (dir) =>
  readdirSync(join(root, dir))
    .filter((file) => ['.ts', '.tsx'].includes(extname(file)))
    .sort()
    .map((file) => `${dir}/${file}`);

/** Imports of a module, or a stylesheet's `@import`s (Tailwind itself is the app's). */
const specifiers = (path) => {
  const source = readFileSync(join(root, path), 'utf8');
  const pattern = path.endsWith('.css') ? /^@import ['"]([^'"]+)['"]/gm : /^import[^'"]*['"]([^'"]+)['"]/gm;
  return [...source.matchAll(pattern)].map((match) => match[1]).filter((specifier) => specifier !== 'tailwindcss');
};

const packageName = (specifier) =>
  specifier
    .split('/')
    .slice(0, specifier.startsWith('@') ? 2 : 1)
    .join('/');

/** The registry item a `~/…` import lives in. */
const localItem = (specifier) => {
  if (specifier.startsWith('~/components/ui/')) return basename(specifier);
  if (specifier.startsWith('~/hooks/')) return basename(specifier);
  if (specifier === '~/lib/utils') return 'utils';
  if (specifier.startsWith('~/lib/theme/')) return 'theme';
  throw new Error(`No registry item for ${specifier}`);
};

const item = (name, type, files, extra = {}) => {
  const imports = files.flatMap((file) => specifiers(file.path));
  const packages = [...new Set(imports.filter((s) => !s.startsWith('~/') && !s.startsWith('.')).map(packageName))]
    .filter((name) => !PEERS.has(name))
    .sort();
  for (const name of packages) if (!versions[name]) throw new Error(`${name} is not in package.json`);
  const local = [...new Set(imports.filter((s) => s.startsWith('~/')).map(localItem))].filter((dep) => dep !== name);
  const registryDependencies = [...new Set([...local, ...(extra.registryDependencies ?? [])])]
    .sort()
    .map((dep) => `@triargos/${dep}`);
  return {
    name,
    type,
    ...(packages.length > 0 && { dependencies: packages.map((name) => `${name}@${versions[name]}`) }),
    ...(registryDependencies.length > 0 && { registryDependencies }),
    files,
  };
};

const items = [
  item('theme', 'registry:lib', [
    ...sourceFiles('src/lib/theme').map((path) => ({ path, type: 'registry:lib' })),
    { path: 'src/tailwind.css', type: 'registry:file', target: 'src/styles/triargos.css' },
  ]),
  item('utils', 'registry:lib', [{ path: 'src/lib/utils.ts', type: 'registry:lib' }]),
  ...sourceFiles('src/hooks').map((path) =>
    item(basename(path, extname(path)), 'registry:hook', [{ path, type: 'registry:hook' }]),
  ),
  // Every component paints with the theme's tokens.
  ...sourceFiles('src/components/ui').map((path) =>
    item(basename(path, extname(path)), 'registry:ui', [{ path, type: 'registry:ui' }], {
      registryDependencies: ['theme'],
    }),
  ),
];

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'triargos',
  homepage: 'https://design.triargos.de',
  items,
};

writeFileSync(join(root, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
