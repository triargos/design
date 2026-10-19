import type { Browser, Page } from 'playwright';

import { fail } from './output.ts';

/** Ways of showing captured PNGs, rendered in a browser canvas: sheets of labelled cells, and the loupe. */

export interface Cell {
  readonly png: Buffer;
  readonly label: string;
}

const maxSheetWidth = 2000;
const maxLoupeSize = 2400;

let sheetPage: Promise<Page> | undefined;

const blankPage = (browser: Browser): Promise<Page> => {
  sheetPage ??= browser.newContext({ deviceScaleFactor: 1 }).then((context) => context.newPage());
  return sheetPage;
};

const dataUrl = (png: Buffer) => `data:image/png;base64,${png.toString('base64')}`;

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

/** Cells in a grid, as many per row as fit in 2000px (or `columns`), each with its label above it. */
export const composeSheet = async (
  browser: Browser,
  cells: ReadonlyArray<Cell>,
  options: { readonly columns?: number; readonly title?: string } = {},
): Promise<Buffer> => {
  const page = await blankPage(browser);
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#fff;font:12px/16px ui-monospace,Menlo,monospace;color:#111">
<div id="sheet" style="display:inline-flex;flex-direction:column;gap:8px;padding:12px">
${options.title === undefined ? '' : `<div style="font-weight:600">${escape(options.title)}</div>`}
<div id="grid" style="display:grid;gap:12px;align-items:start"></div></div></body></html>`);
  await page.evaluate(
    async ({ cells, columns, maxWidth }) => {
      const grid = document.querySelector<HTMLElement>('#grid')!;
      const images = await Promise.all(
        cells.map(
          (cell) =>
            new Promise<HTMLImageElement>((resolve) => {
              const image = new Image();
              image.onload = () => resolve(image);
              image.src = cell.src;
            }),
        ),
      );
      const widest = Math.max(...images.map((image) => image.naturalWidth));
      const perRow = columns ?? Math.max(1, Math.min(cells.length, Math.floor(maxWidth / (widest + 12))));
      grid.style.gridTemplateColumns = `repeat(${perRow}, max-content)`;
      cells.forEach((cell, index) => {
        const figure = document.createElement('div');
        figure.style.cssText = 'display:flex;flex-direction:column;gap:4px';
        const caption = document.createElement('div');
        caption.textContent = cell.label;
        const image = images[index]!;
        image.style.cssText = `width:${image.naturalWidth}px;height:${image.naturalHeight}px;outline:1px solid #ddd;image-rendering:pixelated`;
        figure.append(caption, image);
        grid.append(figure);
      });
    },
    {
      cells: cells.map((cell) => ({ src: dataUrl(cell.png), label: cell.label })),
      columns: options.columns,
      maxWidth: maxSheetWidth,
    },
  );
  return page.locator('#sheet').screenshot();
};

/** The PNG at `factor`×, nearest-neighbour; from 4× a line per source pixel. */
export const loupe = async (browser: Browser, png: Buffer, factor: number): Promise<Buffer> => {
  const page = await blankPage(browser);
  await page.setContent(
    '<!doctype html><html><body style="margin:0;background:#fff"><canvas id="loupe"></canvas></body></html>',
  );
  const size = await page.evaluate(
    async ({ src, factor }) => {
      const image = new Image();
      await new Promise((resolve) => {
        image.onload = resolve;
        image.src = src;
      });
      return { width: image.naturalWidth * factor, height: image.naturalHeight * factor };
    },
    { src: dataUrl(png), factor },
  );
  if (size.width > maxLoupeSize || size.height > maxLoupeSize) {
    fail(
      `--loupe ${factor}: ${size.width}×${size.height}px is over ${maxLoupeSize}px. Pick a smaller --select or a lower factor.`,
    );
  }
  await page.evaluate(
    async ({ src, factor }) => {
      const image = new Image();
      await new Promise((resolve) => {
        image.onload = resolve;
        image.src = src;
      });
      const canvas = document.querySelector<HTMLCanvasElement>('#loupe')!;
      canvas.width = image.naturalWidth * factor;
      canvas.height = image.naturalHeight * factor;
      const context = canvas.getContext('2d')!;
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (factor >= 4) {
        context.fillStyle = 'rgba(127,127,127,0.35)';
        for (let x = factor; x < canvas.width; x += factor) context.fillRect(x, 0, 1, canvas.height);
        for (let y = factor; y < canvas.height; y += factor) context.fillRect(0, y, canvas.width, 1);
      }
    },
    { src: dataUrl(png), factor },
  );
  return page.locator('#loupe').screenshot();
};

export const closeSheets = async () => {
  if (sheetPage !== undefined) await (await sheetPage).context().close();
  sheetPage = undefined;
};
