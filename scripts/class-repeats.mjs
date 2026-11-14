// Reports each (part, class) pair that three or more call sites repeat (`pnpm class:repeats`). A class that every
// call site must remember belongs in the part as a default or a variant. A report, not a gate: it always exits 0.
// Scans the JSX of docs/ and src/ (not src/components/ui) for elements imported from `~/components/ui/*` and reads
// their `className='…'` string literals; a `cn(…)` or template className is not read.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const MIN_SITES = 3;
const root = join(import.meta.dirname, '..');
const partsFile = /\.tsx$/;
const partImport = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]~\/components\/ui\/[^'"]+['"]/g;
const classAttribute = /^className=(?:'([^']*)'|"([^"]*)")/;

const filesUnder = (directory) =>
  readdirSync(join(root, directory), { recursive: true })
    .map((path) => join(directory, path))
    .filter((path) => partsFile.test(path) && !path.startsWith(join('src', 'components', 'ui')));

const importedPartNames = (source) => {
  const names = new Map();
  for (const [, specifiers] of source.matchAll(partImport)) {
    for (const specifier of specifiers.split(',')) {
      const [imported, local = imported] = specifier
        .replace(/^\s*type\s+/, '')
        .trim()
        .split(/\s+as\s+/);
      if (imported) names.set(local, imported);
    }
  }
  return names;
};

/** The opening tag's attribute text after `<Name`, up to its closing `>`: braces and quotes inside `{…}` nest. */
const openingTagAttributes = (source, from) => {
  let depth = 0;
  let quote = null;
  for (let index = from; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === quote && source[index - 1] !== '\\') quote = null;
    } else if (depth > 0 && (char === "'" || char === '"' || char === '`')) quote = char;
    else if (char === '{') depth++;
    else if (char === '}') depth--;
    else if (char === '>' && depth === 0) return source.slice(from, index);
  }
  return '';
};

const classNameLiteral = (attributes) => {
  let depth = 0;
  for (let index = 0; index < attributes.length; index++) {
    const char = attributes[index];
    if (char === '{') depth++;
    else if (char === '}') depth--;
    else if (depth === 0 && attributes.startsWith('className=', index) && /\s/.test(attributes[index - 1] ?? ' ')) {
      const match = classAttribute.exec(attributes.slice(index));
      return match ? (match[1] ?? match[2]) : '';
    }
  }
  return '';
};

const sitesByPair = new Map();
for (const file of [...filesUnder('docs'), ...filesUnder('src')]) {
  const source = readFileSync(join(root, file), 'utf8');
  const parts = importedPartNames(source);
  if (parts.size === 0) continue;
  for (const tag of source.matchAll(/<([A-Z]\w*)(?=[\s/>])/g)) {
    const part = parts.get(tag[1]);
    if (!part) continue;
    const attributes = openingTagAttributes(source, tag.index + tag[0].length);
    const line = source.slice(0, tag.index).split('\n').length;
    for (const className of new Set(classNameLiteral(attributes).split(/\s+/).filter(Boolean))) {
      const pair = `${part}\0${className}`;
      sitesByPair.set(pair, [...(sitesByPair.get(pair) ?? []), `${relative(root, join(root, file))}:${line}`]);
    }
  }
}

const repeats = [...sitesByPair]
  .filter(([, sites]) => sites.length >= MIN_SITES)
  .sort(([pairA, a], [pairB, b]) => b.length - a.length || pairA.localeCompare(pairB));

if (repeats.length === 0) console.log(`No (part, class) pair at ${MIN_SITES} or more call sites.`);
for (const [pair, sites] of repeats) {
  const [part, className] = pair.split('\0');
  console.log(`${String(sites.length).padStart(3)}  ${part}  ${className}`);
  for (const site of sites) console.log(`       ${site}`);
}
