import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const outDir = join(root, 'public/llms');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
const origin = pkg.homepage.replace(/\/$/, '');
const itemNames = new Set(registry.items.map((item) => item.name));
const GROUPS = ['foundations', 'components', 'patterns'];

const stringField = (source, name) => source.match(new RegExp(`\\b${name}:\\s*(['"])(.*?)\\1`))?.[2];

const exampleImports = (source) =>
  new Map(
    [...source.matchAll(/import \{ (\w+) \} from '\.\.\/examples\/([\w/-]+)';/g)].map(([, name, path]) => [name, path]),
  );

const sectionsOf = (source) => {
  const imports = exampleImports(source);
  return [...source.matchAll(/<ExampleSection\b([\s\S]*?)>\s*<(\w+) \/>/g)]
    .filter(([, , name]) => imports.has(name))
    .map(([, attributes, name]) => ({
      title: attributes.match(/title=(['"])(.*?)\1/)?.[2] ?? name,
      description: attributes.match(/description=(['"])(.*?)\1/)?.[2],
      path: imports.get(name),
    }));
};

const exampleSource = (path) => readFileSync(join(root, 'docs/examples', `${path}.tsx`), 'utf8').trim();

const pages = GROUPS.flatMap((group) =>
  readdirSync(join(root, 'docs', group))
    .filter((file) => file.endsWith('.tsx'))
    .sort()
    .map((file) => {
      const slug = file.replace('.tsx', '');
      const source = readFileSync(join(root, 'docs', group, file), 'utf8');
      const header = source.slice(source.indexOf('export default defineDocs('));
      return {
        slug,
        group,
        title: stringField(header, 'title') ?? slug,
        description: stringField(header, 'description') ?? '',
        sections: sectionsOf(source),
      };
    }),
);

const design = readFileSync(join(root, 'DESIGN.md'), 'utf8');
const designSections = design
  .split(/^(?=## )/m)
  .filter((section) => section.startsWith('## '))
  .map((section) => ({
    heading: section.slice(3, section.indexOf('\n')).trim(),
    body: section.slice(section.indexOf('\n') + 1).trim(),
  }));

const pageMarkdown = (page) => {
  const lines = [`# ${page.title}`, '', `> ${page.description}`, ''];
  if (itemNames.has(page.slug)) {
    lines.push(
      '```sh',
      `pnpm dlx shadcn@latest registry add @pavo=${origin}/r/{name}.json`,
      `pnpm dlx shadcn@latest add @pavo/${page.slug}`,
      '```',
      '',
      `Source and dependencies: ${origin}/r/${page.slug}.json`,
      '',
    );
  }
  const rules =
    page.group === 'foundations' && designSections.find((section) => section.heading.startsWith(page.title));
  if (rules) lines.push(`## Rules (DESIGN.md, ${rules.heading})`, '', rules.body, '');
  for (const section of page.sections) {
    lines.push(`## ${section.title}`, '');
    if (section.description) lines.push(section.description, '');
    lines.push('```tsx', exampleSource(section.path), '```', '');
  }
  lines.push(`Live: ${origin}/${page.slug}`);
  return `${lines.join('\n')}\n`;
};

const groupTitle = { foundations: 'Foundations', components: 'Components', patterns: 'Patterns' };
const index = [
  `# ${registry.name === 'pavo' ? 'Pavo' : registry.name}`,
  '',
  `> ${pkg.description}`,
  '',
  'Components are copied into the app with the shadcn CLI from the registry below, then owned by the app. DESIGN.md holds the rules every prop and token follows: read it before writing UI.',
  '',
  `- [DESIGN.md](${origin}/llms/design.md): the axes (intent × emphasis, size, surface, type role, spacing, radius, elevation, motion), the tokens and the API rules`,
  `- [Registry](${origin}/r/registry.json): every item, its files and dependencies`,
  `- [Everything in one file](${origin}/llms-full.txt)`,
  '',
  ...GROUPS.flatMap((group) => [
    `## ${groupTitle[group]}`,
    '',
    ...pages
      .filter((page) => page.group === group)
      .map((page) => `- [${page.title}](${origin}/llms/${page.slug}.md): ${page.description}`),
    '',
  ]),
].join('\n');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const page of pages) writeFileSync(join(outDir, `${page.slug}.md`), pageMarkdown(page));
writeFileSync(join(outDir, 'design.md'), design);
writeFileSync(join(root, 'public/llms.txt'), index);
writeFileSync(join(root, 'public/llms-full.txt'), [index, design, ...pages.map(pageMarkdown)].join('\n\n---\n\n'));
