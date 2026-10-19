import { RADIUS_ROLES, SPACING_STEPS, TYPE_ROLES } from './tokens';

/**
 * Measures rendered layout against the live tokens: values tuned in the Tokens panel count. Shared by `GapRuler`
 * (`blocks.tsx`) and the screenshot runtime (`.storybook/shot-runtime.ts`).
 */

export interface GapBand {
  /** `vertical`: a gap between stacked siblings; `horizontal`: between siblings side by side. */
  readonly axis: 'vertical' | 'horizontal';
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
  /** The gap in px: the band's height (vertical) or width (horizontal). */
  readonly size: number;
  /** The steps whose current value equals the gap, joined (`group/block` when tuned to the same value), if any. */
  readonly step: string | undefined;
  /**
   * `free`: wider than the parent's `gap` plus the margins, so alignment (`justify-between`, auto margins, track space)
   * made it; no token owns it.
   */
  readonly free: boolean;
}

/** `value` (a CSS length, `var(--x)` included) in px, resolved where `element` sits. */
const resolvePx = (element: Element, values: ReadonlyArray<string>): ReadonlyArray<number> => {
  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  element.append(probe);
  const resolved = values.map((value) => {
    probe.style.height = value;
    return Math.round(probe.getBoundingClientRect().height * 100) / 100;
  });
  probe.remove();
  return resolved;
};

/** Each step's current value in px where `element` sits. */
const currentSteps = (element: Element): ReadonlyArray<{ name: string; px: number }> => {
  const values = resolvePx(
    element,
    SPACING_STEPS.map((step) => `var(--spacing-${step.name})`),
  );
  return SPACING_STEPS.map((step, index) => ({ name: step.name, px: values[index]! }));
};

export const currentTypeRoles = (element: Element): ReadonlyArray<{ name: string; px: number; lineHeight: number }> => {
  const values = resolvePx(
    element,
    TYPE_ROLES.flatMap((role) => [`var(--text-${role.name})`, `var(--text-${role.name}--line-height)`]),
  );
  return TYPE_ROLES.map((role, index) => ({
    name: role.name,
    px: values[index * 2]!,
    lineHeight: values[index * 2 + 1]!,
  }));
};

export const currentRadii = (element: Element): ReadonlyArray<{ name: string; px: number }> => {
  const values = resolvePx(
    element,
    RADIUS_ROLES.map((role) => `var(--radius-${role.name})`),
  );
  return RADIUS_ROLES.map((role, index) => ({ name: role.name, px: values[index]! }));
};

export const stepFor = (steps: ReadonlyArray<{ name: string; px: number }>, px: number): string | undefined => {
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

const px = (value: string) => Number.parseFloat(value) || 0;

/** What the parent and the margins ask for between two siblings; more than that is free space. */
const declaredGap = (parent: Element, previous: Element, next: Element, axis: GapBand['axis']): number => {
  const style = getComputedStyle(parent);
  const before = getComputedStyle(previous);
  const after = getComputedStyle(next);
  const layout = /flex|grid/.test(style.display);
  if (axis === 'vertical') {
    const margins = px(before.marginBottom) + px(after.marginTop);
    return layout ? px(style.rowGap) + margins : Math.max(px(before.marginBottom), px(after.marginTop));
  }
  return (layout ? px(style.columnGap) : 0) + px(before.marginRight) + px(after.marginLeft);
};

/** Every gap between two neighbouring siblings in `root`, stacked or side by side, relative to `root`. */
export const measureGaps = (root: Element): ReadonlyArray<GapBand> => {
  const steps = currentSteps(root);
  const origin = root.getBoundingClientRect();
  const bands = new Map<string, GapBand>();
  for (const parent of [root, ...root.querySelectorAll('*')]) {
    if (parent.closest('svg') !== null || parent.closest('[data-shot-overlay]') !== null) continue;
    const children = layoutChildren(parent).filter((child) => {
      const box = child.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    });
    const boxes = children.map((child) => child.getBoundingClientRect());
    const add = (index: number, band: Omit<GapBand, 'step' | 'free'>) => {
      const key = `${band.axis}:${band.top}:${band.left}:${band.size}`;
      if (bands.has(key)) return;
      const declared = declaredGap(parent, children[index - 1]!, children[index]!, band.axis);
      bands.set(key, { ...band, step: stepFor(steps, band.size), free: band.size > declared + 0.5 });
    };
    for (let index = 1; index < boxes.length; index++) {
      const previous = boxes[index - 1]!;
      const next = boxes[index]!;
      const vertical = Math.round(next.top - previous.bottom);
      const left = Math.max(previous.left, next.left);
      const right = Math.min(previous.right, next.right);
      if (vertical > 0 && right > left) {
        add(index, {
          axis: 'vertical',
          top: Math.round(previous.bottom - origin.top),
          left: left - origin.left,
          width: right - left,
          height: vertical,
          size: vertical,
        });
        continue;
      }
      const horizontal = Math.round(next.left - previous.right);
      const top = Math.max(previous.top, next.top);
      const bottom = Math.min(previous.bottom, next.bottom);
      if (horizontal > 0 && bottom > top) {
        add(index, {
          axis: 'horizontal',
          top: top - origin.top,
          left: Math.round(previous.right - origin.left),
          width: horizontal,
          height: bottom - top,
          size: horizontal,
        });
      }
    }
  }
  return [...bands.values()].sort((a, b) => a.top - b.top || a.left - b.left);
};
