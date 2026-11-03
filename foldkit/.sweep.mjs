import { readdirSync } from 'node:fs';
import { chromium } from 'playwright';
const slugs = readdirSync('src/pages').map((f) => f.replace('.ts', ''));
const browser = await chromium.launch();
for (const slug of slugs) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const logs = [];
  page.on('pageerror', (e) => logs.push('pageerror ' + e.message.slice(0, 200)));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ' ' + m.text().slice(0, 200));
  });
  const t = Date.now();
  await page.goto('http://localhost:5391/' + slug, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const h1 = await page
    .locator('h1')
    .first()
    .textContent()
    .catch(() => '?');
  console.log(slug.padEnd(18), String(Date.now() - t).padStart(5) + 'ms', h1, logs.length ? JSON.stringify(logs) : '');
  await page.close();
}
await browser.close();
