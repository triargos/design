import { PNG } from 'pngjs';

import type { Rect, Size } from './model.ts';

/** Pixel operations on decoded PNGs: crops and padded rectangles, in image pixels. */

/** `rect` of `image`, scaled by `factor` with nearest-neighbour. */
export const crop = (image: PNG, rect: Rect, factor = 1): Buffer => {
  const out = new PNG({ width: rect.width * factor, height: rect.height * factor });
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const source = ((rect.y + Math.floor(y / factor)) * image.width + rect.x + Math.floor(x / factor)) * 4;
      const target = (y * out.width + x) * 4;
      out.data[target] = image.data[source]!;
      out.data[target + 1] = image.data[source + 1]!;
      out.data[target + 2] = image.data[source + 2]!;
      out.data[target + 3] = image.data[source + 3]!;
    }
  }
  return PNG.sync.write(out);
};

/** `rect` grown by `padding` on every side, clamped to `bounds`, on whole pixels. */
export const padRect = (rect: Rect, bounds: Size, padding = 16): Rect => {
  const x = Math.max(0, Math.floor(rect.x - padding));
  const y = Math.max(0, Math.floor(rect.y - padding));
  return {
    x,
    y,
    width: Math.min(bounds.width, Math.ceil(rect.x + rect.width + padding)) - x,
    height: Math.min(bounds.height, Math.ceil(rect.y + rect.height + padding)) - y,
  };
};
