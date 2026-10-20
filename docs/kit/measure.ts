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
