// Captures docs examples as static HTML for the Doop design-system board (`node scripts/doop-capture.mjs card badge`).
// Needs the docs dev server (`pnpm exec vite`, default http://localhost:5173; `DOCS_URL` overrides). For each page it
// opens `/<page>` in light mode, takes every example stage (`[data-slot=preview]`'s first child) as rendered, and writes
// `<out>/<page>/<slug>.html` with its measured size in `<out>/manifest.json`. Each frame inlines its own CSS: the rules
// of the page's stylesheets that match the stage, the root or the body (a selector the browser cannot test is kept),
// `@font-face` dropped (frames load Inter from Google Fonts). Static: no script, so a frame shows an example's first
// state.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from 'playwright';

const base = process.env.DOCS_URL ?? 'http://localhost:5173';
const out = process.env.OUT ?? '/tmp/doop';
const pages = process.argv.slice(2);
if (pages.length === 0) {
  console.error('usage: node scripts/doop-capture.mjs <page>...');
  process.exit(1);
}

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const frame = (title, body, css, width) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap">
<style>
${css}
</style>
<style>
  * { margin: 0; box-sizing: border-box; }
  html, body { background: var(--background); }
  body { width: ${width}px; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
</style>
</head>
<body>
${body}
</body>
</html>
`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, colorScheme: 'light' });
const manifest = [];

for (const name of pages) {
  await page.goto(`${base}/${name}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const examples = await page.evaluate(() =>
    [...document.querySelectorAll('[data-slot=preview]')].map((preview, index) => {
      const stage = preview.firstElementChild;
      const rect = stage.getBoundingClientRect();
      const roots = [document.documentElement, document.body];
      // Pseudo-elements and state pseudo-classes never match at rest; test the element they hang on.
      const atRest = (selector) =>
        selector
          .replace(/::?(before|after|placeholder|marker|selection|file-selector-button|backdrop)\b/g, '')
          .replace(
            /:(hover|focus|focus-visible|focus-within|active|visited|checked|disabled|enabled|indeterminate|invalid|required|read-only|placeholder-shown|autofill|open|popover-open|target|empty|first-child|last-child|only-child|first-of-type|last-of-type|nth-child\([^)]*\)|nth-last-child\([^)]*\))/g,
            '',
          );
      const used = (selector) => {
        try {
          const test = atRest(selector).trim() || '*';
          return roots.some((root) => root.matches(test)) || stage.matches(test) || stage.querySelector(test) !== null;
        } catch {
          return true;
        }
      };
      const keep = (rules) =>
        [...rules].flatMap((rule) => {
          if (rule instanceof CSSFontFaceRule) return [];
          if (rule instanceof CSSStyleRule) {
            if (!used(rule.selectorText)) return [];
            return rule.cssRules?.length
              ? [`${rule.selectorText}{${rule.style.cssText}${keep(rule.cssRules).join('')}}`]
              : [rule.cssText];
          }
          if (rule instanceof CSSGroupingRule) {
            const inner = keep(rule.cssRules);
            if (inner.length === 0) return [];
            const head = rule.cssText.slice(0, rule.cssText.indexOf('{'));
            return [`${head}{${inner.join('\n')}}`];
          }
          return [rule.cssText];
        });
      const css = [...document.styleSheets]
        .flatMap((sheet) => {
          try {
            return keep(sheet.cssRules);
          } catch {
            return [];
          }
        })
        .join('\n');
      const heading = preview.closest('section')?.querySelector('h2, h3')?.textContent?.trim();
      return {
        title: preview.getAttribute('data-title') || heading || `Example ${index + 1}`,
        html: stage.outerHTML,
        css,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
      };
    }),
  );
  mkdirSync(join(out, name), { recursive: true });
  const seen = new Set();
  for (const example of examples) {
    let file = slug(example.title) || 'example';
    while (seen.has(file)) file += '-2';
    seen.add(file);
    const path = join(out, name, `${file}.html`);
    writeFileSync(path, frame(`${name} · ${example.title}`, example.html, example.css, example.width));
    manifest.push({ page: name, title: example.title, path, width: example.width, height: example.height });
  }
  console.log(`${name}: ${examples.length} examples`);
}

writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`${manifest.length} frames → ${out}`);
await browser.close();
