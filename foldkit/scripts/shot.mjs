import { mkdirSync } from 'node:fs';

import { chromium } from 'playwright';

const args = process.argv.slice(2);
const path = args.find((arg) => !arg.startsWith('--')) ?? '/';
const isDark = args.includes('--dark');
const isReact = args.includes('--react');
const isFullPage = !args.includes('--viewport');
const origin = isReact ? 'http://localhost:5392' : 'http://localhost:5391';
const slug = path.replace(/^\//, '').replace(/[^a-z0-9-]/g, '-') || 'home';
const outDir = '/tmp/pavo-shots';
const out = `${outDir}/${slug}-${isReact ? 'react' : 'foldkit'}-${isDark ? 'dark' : 'light'}.png`;

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  colorScheme: isDark ? 'dark' : 'light',
});
const problems = [];
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
});
page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
await page.goto(origin + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.locator('#content').evaluate((main) => {
  main.style.height = 'auto';
  main.style.overflow = 'visible';
  for (let element = main.parentElement; element; element = element.parentElement) {
    element.style.height = 'auto';
    element.style.overflow = 'visible';
  }
});
await page.screenshot({ path: out, fullPage: isFullPage });
console.log(out);
console.log(problems.length === 0 ? 'no console errors' : problems.join('\n'));
await browser.close();
