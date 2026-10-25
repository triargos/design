import { SPACING_STEPS } from './tokens';

/** A vertical gap between two stacked siblings, relative to the measured root, and the spacing step it matches. */
export interface GapBand {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
  /** The steps whose current value equals the gap, joined (`group/page` when tuned to the same value), if any. */
  readonly step: string | undefined;
}

/** Each spacing step's current value in px where `element` sits, so values tuned in Customize count. */
const currentSteps = (element: Element): ReadonlyArray<{ name: string; px: number }> => {
  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  element.append(probe);
  const steps = SPACING_STEPS.map((step) => {
    probe.style.height = `var(--spacing-${step.name})`;
    return { name: step.name, px: Math.round(probe.getBoundingClientRect().height * 100) / 100 };
  });
  probe.remove();
  return steps;
};

const stepFor = (steps: ReadonlyArray<{ name: string; px: number }>, px: number): string | undefined => {
  const names = steps.filter((step) => Math.abs(step.px - px) < 0.5).map((step) => step.name);
  return names.length === 0 ? undefined : names.join('/');
};

/** Children that take part in layout; `display: contents` wrappers are transparent. */
const layoutChildren = (element: Element): ReadonlyArray<Element> =>
  Array.from(element.children).flatMap((child) => {
    const style = getComputedStyle(child);
    if (style.display === 'contents') return layoutChildren(child);
    if (style.display === 'none' || style.position === 'absolute' || style.position === 'fixed') return [];
    return [child];
  });

/** Every vertical gap between two neighbouring stacked siblings in `root`, top to bottom. */
export const measureGaps = (root: Element): ReadonlyArray<GapBand> => {
  const steps = currentSteps(root);
  const origin = root.getBoundingClientRect();
  const bands = new Map<string, GapBand>();
  for (const parent of [root, ...root.querySelectorAll('*')]) {
    if (parent.closest('svg') !== null) continue;
    const boxes = layoutChildren(parent)
      .map((child) => child.getBoundingClientRect())
      .filter((box) => box.width > 0 && box.height > 0);
    for (let index = 1; index < boxes.length; index++) {
      const previous = boxes[index - 1]!;
      const next = boxes[index]!;
      const height = Math.round(next.top - previous.bottom);
      const left = Math.max(previous.left, next.left);
      const right = Math.min(previous.right, next.right);
      if (height <= 0 || right <= left) continue;
      const top = Math.round(previous.bottom - origin.top);
      const key = `${top}:${left}:${height}`;
      if (!bands.has(key)) {
        bands.set(key, { top, left: left - origin.left, width: right - left, height, step: stepFor(steps, height) });
      }
    }
  }
  return [...bands.values()].sort((a, b) => a.top - b.top || a.left - b.left);
};

/** A paint's top and bottom edge in px, from the top of the element's border box. */
export interface PaintedExtent {
  /** The border box height: what the element measures. */
  readonly box: number;
  readonly top: number;
  readonly bottom: number;
}

let alphaContext: CanvasRenderingContext2D | null | undefined;

/** A computed color's alpha, 0–255: drawn on a canvas, so every CSS color syntax counts. */
const alphaOf = (color: string): number => {
  alphaContext ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (alphaContext === null) return color === 'transparent' ? 0 : 255;
  alphaContext.clearRect(0, 0, 1, 1);
  alphaContext.fillStyle = 'transparent';
  alphaContext.fillStyle = color;
  alphaContext.fillRect(0, 0, 1, 1);
  return alphaContext.getImageData(0, 0, 1, 1).data[3]!;
};

const isVisible = (color: string): boolean => alphaOf(color) > 0;

/** Splits a computed `box-shadow` list at the commas between shadows, not those inside a color function. */
const splitShadows = (value: string): ReadonlyArray<string> => {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(value.slice(start));
  return parts.map((part) => part.trim()).filter((part) => part !== '' && part !== 'none');
};

/**
 * The rows `element` paints with a hard edge: a visible border, the fill (clipped where `background-clip` says), and
 * every unblurred shadow. An inset shadow paints inside the padding box, an outer one around the border box, grown by
 * its spread. Blurred drops have no edge and are left out. `undefined` when nothing paints (a ghost at rest).
 *
 * A translucent border around a fill that stops inside it takes the color of the surface behind, not the control's:
 * on a saturated surface it vanishes, and the control reads as its fill. Then the fill is the extent, not the border.
 */
export const paintedExtent = (element: HTMLElement): PaintedExtent | undefined => {
  const style = getComputedStyle(element);
  const box = element.offsetHeight;
  const borderTop = parseFloat(style.borderTopWidth);
  const borderBottom = parseFloat(style.borderBottomWidth);
  const spans: Array<readonly [number, number]> = [];

  const clip = style.backgroundClip;
  const hasFill = isVisible(style.backgroundColor) || style.backgroundImage !== 'none';
  const borderOnSurface = hasFill && clip !== 'border-box' && alphaOf(style.borderTopColor) < 255;
  const hasBorder =
    (borderTop > 0 && isVisible(style.borderTopColor)) || (borderBottom > 0 && isVisible(style.borderBottomColor));
  if (hasBorder && !borderOnSurface) {
    spans.push([borderTop > 0 && isVisible(style.borderTopColor) ? 0 : borderTop, box]);
  }
  if (hasFill) {
    if (clip === 'border-box') spans.push([0, box]);
    else if (clip === 'padding-box') spans.push([borderTop, box - borderBottom]);
    else spans.push([borderTop + parseFloat(style.paddingTop), box - borderBottom - parseFloat(style.paddingBottom)]);
  }
  for (const shadow of splitShadows(style.boxShadow)) {
    const color = /[a-z-]+\([^)]*\)|#[\da-f]+|\btransparent\b/i.exec(shadow)?.[0];
    if (color === undefined || !isVisible(color)) continue;
    const [offsetY = 0, blur = 0, spread = 0] = [...shadow.replace(color, '').matchAll(/-?[\d.]+px/g)]
      .map(([length]) => parseFloat(length))
      .slice(1);
    if (blur > 0) continue;
    if (shadow.includes('inset')) spans.push([borderTop, box - borderBottom]);
    else spans.push([Math.min(0, offsetY - spread), Math.max(box, box + offsetY + spread)]);
  }
  if (spans.length === 0) return undefined;
  return {
    box,
    top: Math.min(...spans.map(([top]) => top)),
    bottom: Math.max(...spans.map(([, bottom]) => bottom)),
  };
};
