// Keeps `src/lib/theme/sizing.ts` in step with `src/tailwind.css` (`pnpm sizing:check`). Fails when a token in the
// `@theme` Sizing section or the Component sizing block is missing from `SIZING_TOKENS`, or when a default differs.
// Node strips the types from `sizing.ts`.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const { SIZING_TOKENS } = await import(join(root, 'src/lib/theme/sizing.ts'));
const css = readFileSync(join(root, 'src/tailwind.css'), 'utf8');

/** The declarations between two markers of `tailwind.css`. */
const section = (from, to) => {
  const start = css.indexOf(from);
  if (start === -1) throw new Error(`tailwind.css: no "${from}"`);
  const end = css.indexOf(to, start + from.length);
  return new Map(
    [...css.slice(start, end).matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)].map(([, name, value]) => [name, value.trim()]),
  );
};

const all = new Map([...css.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)].map(([, name, value]) => [name, value.trim()]));
const themed = new Map([
  ...section('/* Sizing (DESIGN.md', '/* Motion (DESIGN.md'),
  ...section('/* Component sizing', '\n}\n'),
]);

/** A CSS length in px; `calc(infinity * 1px)` is a full round (9999px). */
const px = (value) => {
  if (value.startsWith('calc(infinity')) return 9999;
  const number = Number.parseFloat(value);
  return value.endsWith('rem') ? number * 16 : number;
};

const errors = [];
for (const [name, value] of themed) {
  if (!(name in SIZING_TOKENS)) errors.push(`${name}: in tailwind.css, missing from SIZING_TOKENS`);
  else if (px(value) !== px(SIZING_TOKENS[name].value))
    errors.push(`${name}: tailwind.css ${value}, SIZING_TOKENS ${SIZING_TOKENS[name].value}`);
}
for (const [name, spec] of Object.entries(SIZING_TOKENS)) {
  const value = all.get(name);
  if (value === undefined) errors.push(`${name}: in SIZING_TOKENS, not declared in tailwind.css`);
  else if (!themed.has(name) && px(value) !== px(spec.value))
    errors.push(`${name}: tailwind.css ${value}, SIZING_TOKENS ${spec.value}`);
  if (!/^\d+px$/.test(spec.value)) errors.push(`${name}: default ${spec.value} is not whole px`);
}

if (errors.length > 0) {
  console.error(`sizing.ts and tailwind.css differ:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`sizing: ${Object.keys(SIZING_TOKENS).length} tokens match tailwind.css`);
