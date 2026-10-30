// Writes `registry.json` from the source: one item per file in `src/components/ui`, plus `utils`, the hooks and the
// theme. Package dependencies and the other items a file needs come from its imports, so the registry cannot drift.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const versions = { ...pkg.devDependencies, ...pkg.dependencies };
const PEERS = new Set(['react', 'react-dom']);
// The deploy build stamps each item with the commit it was built from, so an app can tell which version it carries.
// Unset locally, so the checked-in `registry.json` does not change with every commit.
const commit = process.env.GITHUB_SHA;

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
  if (specifier.startsWith('~/lib/theme/')) return 'theme';
  if (specifier.startsWith('~/lib/motion/')) return 'motion';
  if (specifier.startsWith('~/lib/')) return basename(specifier);
  throw new Error(`No registry item for ${specifier}`);
};

const item = (name, type, files, extra = {}) => {
  const imports = files.flatMap((file) => specifiers(file.path));
  const packages = [
    ...new Set([
      ...imports.filter((s) => !s.startsWith('~/') && !s.startsWith('.')).map(packageName),
      ...(extra.dependencies ?? []),
    ]),
  ]
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
    ...(commit && { meta: { commit } }),
  };
};

const items = [
  // The tokens land next to the generator, in the app's `lib` alias (`@lib/…` resolves through components.json), so
  // `src/` and `app/` layouts both get `<lib>/theme/triargos.css`. The app's own entry imports it after Tailwind and
  // tw-animate-css (README, Use the registry); the components' `animate-in` classes need the latter.
  item(
    'theme',
    'registry:lib',
    [
      ...sourceFiles('src/lib/theme').map((path) => ({ path, type: 'registry:lib' })),
      { path: 'src/tailwind.css', type: 'registry:file', target: '@lib/theme/triargos.css' },
    ],
    { dependencies: ['tw-animate-css'] },
  ),
  item(
    'motion',
    'registry:lib',
    sourceFiles('src/lib/motion').map((path) => ({ path, type: 'registry:lib' })),
    { dependencies: ['framer-motion'] },
  ),
  // `utils` and each other helper in `src/lib`, one item per file.
  ...sourceFiles('src/lib').map((path) =>
    item(basename(path, extname(path)), 'registry:lib', [{ path, type: 'registry:lib' }]),
  ),
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

// Each component docs page shows `shadcn add @triargos/<slug>` (`site/install.tsx`), so its slug must name an item.
for (const file of readdirSync(join(root, 'docs/components'))) {
  const slug = basename(file, extname(file));
  if (!items.some((entry) => entry.name === slug)) throw new Error(`docs/components/${file}: no registry item ${slug}`);
}

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'triargos',
  homepage: 'https://design.a-np.de',
  items,
};

writeFileSync(join(root, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
