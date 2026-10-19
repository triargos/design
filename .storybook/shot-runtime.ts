import { currentRadii, currentTypeRoles, measureGaps, stepFor } from '../storybook/kit/measure';

/**
 * In-page half of `pnpm shot` (`tooling/shot/`): outline, measurements, overlays and the DOM checks. The CLI bundles
 * this file and injects it into the story's page, so baseline renders at an older ref measure with the same code.
 * Coordinates are page coordinates (CSS px from the document's top-left).
 */

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Finding {
  readonly check: 'overflow' | 'target' | 'tokens' | 'align';
  readonly severity: 'error' | 'warn';
  readonly message: string;
  readonly selector: string;
  readonly rect: Rect;
}

type OverlayKind = 'boxes' | 'gaps' | 'edges' | 'type' | 'grid';

const OK = '#2563eb';
const OFF = '#dc2626';
const GUIDE = '#0891b2';

const round = (value: number) => Math.round(value * 100) / 100;

const pageRect = (rect: DOMRect | Rect): Rect =>
  rect instanceof DOMRect
    ? {
        x: round(rect.left + scrollX),
        y: round(rect.top + scrollY),
        width: round(rect.width),
        height: round(rect.height),
      }
    : rect;

const union = (rects: ReadonlyArray<Rect>): Rect => {
  const x = Math.min(...rects.map((rect) => rect.x));
  const y = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
  return { x, y, width: right - x, height: bottom - y };
};

const ownText = (element: Element): string =>
  Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join('')
    .trim();

/** A Playwright selector for `element` that `--select` accepts: `[data-slot=x]:has-text("…") >> nth=i`. */
const selectorFor = (element: Element): string => {
  const slot = element.getAttribute('data-slot');
  const owner = slot === null ? element.parentElement?.closest('[data-slot]') : null;
  const tag = element.tagName.toLowerCase();
  const css =
    slot !== null
      ? `[data-slot=${slot}]`
      : owner !== null && owner !== undefined
        ? `[data-slot=${owner.getAttribute('data-slot')}] ${tag}`
        : tag;
  const matches = Array.from(document.querySelectorAll(css));
  const index = matches.indexOf(element);
  return index <= 0 ? css : `${css} >> nth=${index}`;
};

const isOverlay = (element: Element) => element.closest('[data-shot-overlay]') !== null;

const isVisible = (element: Element): boolean => {
  if (isOverlay(element)) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  const style = getComputedStyle(element);
  return style.visibility !== 'hidden' && style.opacity !== '0';
};

/** `root` and every visible element inside it, outside SVG internals. */
const elementsIn = (root: Element): ReadonlyArray<Element> =>
  [root, ...root.querySelectorAll('*')].filter(
    (element) => isVisible(element) && (element.tagName.toLowerCase() === 'svg' || element.closest('svg') === null),
  );

const px = (value: string) => Number.parseFloat(value) || 0;

const sides = (style: CSSStyleDeclaration, prefix: string, suffix = '') =>
  ['top', 'right', 'bottom', 'left'].map((side) => px(style.getPropertyValue(`${prefix}-${side}${suffix}`)));

const transparent = (color: string) =>
  color === 'transparent' || /rgba?\([^)]*,\s*0\)$/.test(color) || /\/\s*0\)$/.test(color);

/** Paints something itself: a fill, a border, a shadow, or replaced content. */
const isVisual = (element: Element): boolean => {
  if (['img', 'svg', 'input', 'textarea', 'select', 'video', 'canvas', 'hr'].includes(element.tagName.toLowerCase())) {
    return true;
  }
  const style = getComputedStyle(element);
  if (!transparent(style.backgroundColor) || style.backgroundImage !== 'none' || style.boxShadow !== 'none')
    return true;
  return sides(style, 'border', '-width').some(
    (width, index) =>
      width > 0 && !transparent(style.getPropertyValue(`border-${['top', 'right', 'bottom', 'left'][index]}-color`)),
  );
};

interface TextRun {
  readonly element: Element;
  readonly rect: Rect;
  /** First line's baseline, page y. */
  readonly baseline: number;
}

const textRuns = (root: Element): ReadonlyArray<TextRun> =>
  elementsIn(root).flatMap((element) => {
    const nodes = Array.from(element.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
    );
    if (nodes.length === 0) return [];
    const range = document.createRange();
    range.setStartBefore(nodes[0]!);
    range.setEndAfter(nodes.at(-1)!);
    const rect = range.getBoundingClientRect();
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    element.insertBefore(probe, nodes[0]!);
    const baseline = probe.getBoundingClientRect().top + scrollY;
    probe.remove();
    return rect.width > 0 ? [{ element, rect: pageRect(rect), baseline: round(baseline) }] : [];
  });

interface EdgeItem {
  readonly element: Element;
  readonly kind: 'box' | 'text';
  readonly rect: Rect;
  readonly baseline: number | undefined;
}

interface Guide {
  readonly axis: 'x' | 'y';
  readonly at: number;
  readonly from: number;
  readonly to: number;
  readonly count: number;
}

interface NearMiss {
  readonly edge: 'left' | 'right' | 'center-y' | 'baseline';
  readonly a: string;
  readonly b: string;
  readonly delta: number;
  readonly rects: readonly [Rect, Rect];
  readonly at: readonly [number, number];
}

const related = (a: Element, b: Element) => a.contains(b) || b.contains(a);

const edgeItems = (root: Element): ReadonlyArray<EdgeItem> => [
  ...elementsIn(root)
    .filter((element) => element !== root && isVisual(element))
    .map((element) => ({
      element,
      kind: 'box' as const,
      rect: pageRect(element.getBoundingClientRect()),
      baseline: undefined,
    })),
  ...textRuns(root).map((run) => ({
    element: run.element,
    kind: 'text' as const,
    rect: run.rect,
    baseline: run.baseline,
  })),
];

/** Shared edges become guides; edges 1–3px apart between neighbours are near-misses. */
const measureEdges = (root: Element): { guides: ReadonlyArray<Guide>; nearMisses: ReadonlyArray<NearMiss> } => {
  const items = edgeItems(root);
  const guides: Array<Guide> = [];
  const collect = (axis: 'x' | 'y', values: ReadonlyArray<{ at: number; from: number; to: number }>) => {
    const sorted = [...values].sort((a, b) => a.at - b.at);
    let group: Array<{ at: number; from: number; to: number }> = [];
    const flush = () => {
      if (group.length >= 2) {
        guides.push({
          axis,
          at: round(group[0]!.at),
          from: Math.min(...group.map((value) => value.from)),
          to: Math.max(...group.map((value) => value.to)),
          count: group.length,
        });
      }
      group = [];
    };
    for (const value of sorted) {
      if (group.length > 0 && Math.abs(value.at - group[0]!.at) >= 0.5) flush();
      group.push(value);
    }
    flush();
  };
  collect(
    'x',
    items.flatMap((item) => [
      { at: item.rect.x, from: item.rect.y, to: item.rect.y + item.rect.height },
      { at: item.rect.x + item.rect.width, from: item.rect.y, to: item.rect.y + item.rect.height },
    ]),
  );
  collect(
    'y',
    items.flatMap((item) =>
      item.baseline === undefined
        ? [
            { at: item.rect.y, from: item.rect.x, to: item.rect.x + item.rect.width },
            { at: item.rect.y + item.rect.height, from: item.rect.x, to: item.rect.x + item.rect.width },
          ]
        : [{ at: item.baseline, from: item.rect.x, to: item.rect.x + item.rect.width }],
    ),
  );

  const nearMisses: Array<NearMiss> = [];
  const near = (delta: number) => delta >= 0.75 && delta <= 3.25;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]!;
      const b = items[j]!;
      if (related(a.element, b.element)) continue;
      const verticalGap = Math.max(b.rect.y - (a.rect.y + a.rect.height), a.rect.y - (b.rect.y + b.rect.height));
      const horizontalGap = Math.max(b.rect.x - (a.rect.x + a.rect.width), a.rect.x - (b.rect.x + b.rect.width));
      const add = (edge: NearMiss['edge'], atA: number, atB: number) => {
        const delta = round(Math.abs(atA - atB));
        if (near(delta)) {
          nearMisses.push({
            edge,
            a: selectorFor(a.element),
            b: selectorFor(b.element),
            delta,
            rects: [a.rect, b.rect],
            at: [atA, atB],
          });
        }
      };
      // Stacked neighbours: left and right edges should line up.
      if (verticalGap >= 0 && verticalGap <= 24 && horizontalGap < 0) {
        add('left', a.rect.x, b.rect.x);
        add('right', a.rect.x + a.rect.width, b.rect.x + b.rect.width);
      }
      // One row: baselines of text, centres of boxes.
      if (horizontalGap >= 0 && horizontalGap <= 48 && verticalGap < 0) {
        if (a.baseline !== undefined && b.baseline !== undefined) add('baseline', a.baseline, b.baseline);
        if (a.kind === 'box' && b.kind === 'box') {
          add('center-y', a.rect.y + a.rect.height / 2, b.rect.y + b.rect.height / 2);
        }
      }
    }
  }
  return { guides, nearMisses };
};

interface TypeSample {
  readonly selector: string;
  readonly text: string;
  readonly rect: Rect;
  readonly size: number;
  readonly lineHeight: number | undefined;
  readonly weight: string;
  /** The role whose size and line height match; `size` when only the size matches. */
  readonly role: string | undefined;
  readonly match: 'exact' | 'size' | 'none';
}

const measureType = (root: Element): ReadonlyArray<TypeSample> => {
  const roles = currentTypeRoles(root);
  return textRuns(root).map((run) => {
    const style = getComputedStyle(run.element);
    const size = px(style.fontSize);
    const lineHeight = style.lineHeight === 'normal' ? undefined : px(style.lineHeight);
    const exact = roles.find(
      (role) =>
        Math.abs(role.px - size) < 0.5 && lineHeight !== undefined && Math.abs(role.lineHeight - lineHeight) < 0.5,
    );
    const bySize = roles.filter((role) => Math.abs(role.px - size) < 0.5);
    return {
      selector: selectorFor(run.element),
      text: ownText(run.element).slice(0, 40),
      rect: run.rect,
      size,
      lineHeight,
      weight: style.fontWeight,
      role: exact?.name ?? (bySize.length > 0 ? bySize.map((role) => role.name).join('/') : undefined),
      match: exact !== undefined ? 'exact' : bySize.length > 0 ? 'size' : 'none',
    };
  });
};

interface BoxSample {
  readonly selector: string;
  readonly rect: Rect;
  readonly padding: ReadonlyArray<number>;
  readonly border: ReadonlyArray<number>;
  readonly margin: ReadonlyArray<number>;
}

const measureBoxes = (root: Element): ReadonlyArray<BoxSample> =>
  elementsIn(root)
    .slice(0, 400)
    .map((element) => {
      const style = getComputedStyle(element);
      return {
        selector: selectorFor(element),
        rect: pageRect(element.getBoundingClientRect()),
        padding: sides(style, 'padding'),
        border: sides(style, 'border', '-width'),
        margin: sides(style, 'margin'),
      };
    });

/** The overlay layer: absolutely positioned in page coordinates, above everything, ignored by every measurement. */
const layer = (): HTMLElement => {
  const existing = document.querySelector<HTMLElement>('[data-shot-overlay]');
  if (existing !== null) return existing;
  const element = document.createElement('div');
  element.setAttribute('data-shot-overlay', '');
  element.setAttribute('aria-hidden', 'true');
  element.style.cssText = `position:absolute;left:0;top:0;width:${document.documentElement.scrollWidth}px;height:${document.documentElement.scrollHeight}px;pointer-events:none;z-index:2147483647;`;
  document.body.append(element);
  return element;
};

const draw = (rect: Rect, css: string) => {
  const element = document.createElement('div');
  element.style.cssText = `position:absolute;box-sizing:border-box;left:${rect.x}px;top:${rect.y}px;width:${Math.max(rect.width, 1)}px;height:${Math.max(rect.height, 1)}px;${css}`;
  layer().append(element);
};

const label = (text: string, x: number, y: number, color: string) => {
  const element = document.createElement('span');
  element.textContent = text;
  element.style.cssText = `position:absolute;left:${x}px;top:${y}px;font:500 10px/12px ui-monospace,SFMono-Regular,Menlo,monospace;padding:0 3px;border-radius:3px;background:#fff;color:${color};box-shadow:0 0 0 1px ${color};white-space:nowrap;`;
  layer().append(element);
};

const drawBoxes = (boxes: ReadonlyArray<BoxSample>) => {
  for (const box of boxes) {
    const { x, y, width, height } = box.rect;
    const [mt, mr, mb, ml] = box.margin as [number, number, number, number];
    const [pt, pr, pb, pl] = box.padding as [number, number, number, number];
    const [bt, br, bb, bl] = box.border as [number, number, number, number];
    const margin = 'background:rgba(249,115,22,.22)';
    if (mt > 0) draw({ x, y: y - mt, width, height: mt }, margin);
    if (mb > 0) draw({ x, y: y + height, width, height: mb }, margin);
    if (ml > 0) draw({ x: x - ml, y, width: ml, height }, margin);
    if (mr > 0) draw({ x: x + width, y, width: mr, height }, margin);
    const padding = 'background:rgba(34,197,94,.22)';
    const inner = { x: x + bl, y: y + bt, width: width - bl - br, height: height - bt - bb };
    if (pt > 0) draw({ ...inner, height: pt }, padding);
    if (pb > 0) draw({ ...inner, y: inner.y + inner.height - pb, height: pb }, padding);
    if (pl > 0) draw({ ...inner, y: inner.y + pt, width: pl, height: inner.height - pt - pb }, padding);
    if (pr > 0)
      draw(
        { ...inner, x: inner.x + inner.width - pr, y: inner.y + pt, width: pr, height: inner.height - pt - pb },
        padding,
      );
    draw(box.rect, `outline:1px solid ${OK}99;outline-offset:-1px`);
  }
  // Size labels on boxes big enough to carry one, at most 80.
  for (const box of boxes.filter((sample) => sample.rect.width >= 40 && sample.rect.height >= 14).slice(0, 80)) {
    label(`${round(box.rect.width)}×${round(box.rect.height)}`, box.rect.x + 1, box.rect.y + 1, OK);
  }
};

const gapsIn = (root: Element) => {
  const origin = pageRect(root.getBoundingClientRect());
  return measureGaps(root).map((band) => ({
    ...band,
    rect: { x: origin.x + band.left, y: origin.y + band.top, width: band.width, height: band.height },
  }));
};

const FREE = '#6b7280';

const drawGaps = (gaps: ReturnType<typeof gapsIn>) => {
  for (const gap of gaps) {
    const color = gap.free ? FREE : gap.step === undefined ? OFF : OK;
    const fill = gap.free
      ? 'rgba(107,114,128,.12)'
      : gap.step === undefined
        ? 'rgba(220,38,38,.35)'
        : 'rgba(37,99,235,.2)';
    draw(gap.rect, `background:${fill}`);
    const text = `${gap.size} ${gap.free ? 'free' : (gap.step ?? 'off')}`;
    if (gap.axis === 'vertical') {
      label(text, gap.rect.x + gap.rect.width / 2 - 16, gap.rect.y + gap.rect.height / 2 - 6, color);
    } else {
      label(text, gap.rect.x + gap.rect.width / 2 - 8, gap.rect.y + gap.rect.height / 2 - 6, color);
    }
  }
};

const drawEdges = (edges: ReturnType<typeof measureEdges>) => {
  for (const guide of edges.guides) {
    if (guide.axis === 'x') {
      draw({ x: guide.at, y: guide.from, width: 1, height: guide.to - guide.from }, `background:${GUIDE}aa`);
    } else {
      draw({ x: guide.from, y: guide.at, width: guide.to - guide.from, height: 1 }, `background:${GUIDE}aa`);
    }
  }
  for (const miss of edges.nearMisses) {
    const span = union(miss.rects);
    for (const at of miss.at) {
      if (miss.edge === 'left' || miss.edge === 'right') {
        draw({ x: at, y: span.y, width: 1, height: span.height }, `background:${OFF}`);
      } else {
        draw({ x: span.x, y: at, width: span.width, height: 1 }, `background:${OFF}`);
      }
    }
    label(`Δ${miss.delta} ${miss.edge}`, span.x + span.width + 2, span.y, OFF);
  }
};

const drawType = (samples: ReadonlyArray<TypeSample>) => {
  for (const sample of samples) {
    const color = sample.match === 'exact' ? OK : OFF;
    draw(sample.rect, `outline:1px dashed ${color}88`);
    label(
      `${sample.role ?? '?'} ${sample.size}/${sample.lineHeight ?? 'normal'}`,
      sample.rect.x,
      sample.rect.y - 12,
      color,
    );
  }
};

const drawGrid = (root: Element) => {
  const rect = pageRect(root.getBoundingClientRect());
  draw(
    rect,
    'background-image:linear-gradient(to right,rgba(220,38,38,.28) 1px,transparent 1px),linear-gradient(to bottom,rgba(220,38,38,.28) 1px,transparent 1px),linear-gradient(to right,rgba(220,38,38,.1) 1px,transparent 1px),linear-gradient(to bottom,rgba(220,38,38,.1) 1px,transparent 1px);background-size:16px 16px,16px 16px,4px 4px,4px 4px',
  );
};

const overlay = (kinds: ReadonlyArray<OverlayKind>, root: Element): Record<string, unknown> => {
  const measurements: Record<string, unknown> = {};
  // Measure everything first: drawing must not shift what the next overlay measures.
  const boxes = kinds.includes('boxes') ? measureBoxes(root) : [];
  const gaps = kinds.includes('gaps') ? gapsIn(root) : [];
  const edges = kinds.includes('edges') ? measureEdges(root) : undefined;
  const type = kinds.includes('type') ? measureType(root) : [];
  if (kinds.includes('grid')) drawGrid(root);
  if (kinds.includes('boxes')) {
    drawBoxes(boxes);
    measurements['boxes'] = boxes;
  }
  if (kinds.includes('gaps')) {
    drawGaps(gaps);
    measurements['gaps'] = gaps.map(({ axis, size, step, free, rect }) => ({ axis, size, step, free, rect }));
  }
  if (edges !== undefined) {
    drawEdges(edges);
    measurements['edges'] = edges;
  }
  if (kinds.includes('type')) {
    drawType(type);
    measurements['type'] = type;
  }
  return measurements;
};

const clearOverlay = () => document.querySelector('[data-shot-overlay]')?.remove();

const measure = (elements: ReadonlyArray<Element>, styles: ReadonlyArray<string>) =>
  elements.map((element, index) => {
    const style = getComputedStyle(element);
    return {
      selector: selectorFor(element),
      index,
      text: ((element instanceof HTMLElement ? element.innerText : element.textContent) ?? '')
        .trim()
        .replaceAll(/\s+/g, ' ')
        .slice(0, 80),
      rect: pageRect(element.getBoundingClientRect()),
      padding: sides(style, 'padding'),
      border: sides(style, 'border', '-width'),
      margin: sides(style, 'margin'),
      radius: ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map((corner) =>
        style.getPropertyValue(`border-${corner}-radius`),
      ),
      font: {
        family: style.fontFamily,
        size: style.fontSize,
        lineHeight: style.lineHeight,
        weight: style.fontWeight,
        letterSpacing: style.letterSpacing,
      },
      styles: Object.fromEntries(styles.map((name) => [name, style.getPropertyValue(name)])),
    };
  });

/**
 * What a section is, for stories and app routes alike: a titled block an agent can name with `--section`.
 * `section`: `FoundationSection`, `PageSection`; `preview`: `Preview`; `card`: `InsetCard`.
 */
const SECTION_KINDS = {
  'foundation-section': 'section',
  'page-section': 'section',
  preview: 'preview',
  'inset-card': 'card',
} as const;

type SectionKind = (typeof SECTION_KINDS)[keyof typeof SECTION_KINDS];

const SECTION_SELECTOR = Object.keys(SECTION_KINDS)
  .map((slot) => `[data-slot=${slot}]`)
  .join(', ');

interface Section {
  readonly element: Element;
  readonly kind: SectionKind;
  readonly title: string;
}

/** Its `data-title`, else its own first heading: not one that belongs to a section nested inside it. */
const sectionTitle = (element: Element): string =>
  element.getAttribute('data-title') ??
  Array.from(element.querySelectorAll('h1, h2, h3'))
    .find((heading) => heading.closest(SECTION_SELECTOR) === element)
    ?.textContent?.trim() ??
  '';

/** Refs from before `data-slot`: a `FoundationSection` is a `section` whose first block holds an `h2`. */
const legacySections = (scope: Element): ReadonlyArray<Section> =>
  Array.from(scope.querySelectorAll('section')).flatMap((element) => {
    const heading = element.querySelector(':scope > div > h2');
    return heading === null ? [] : [{ element, kind: 'section' as const, title: heading.textContent?.trim() ?? '' }];
  });

const sectionsIn = (scope: Element): ReadonlyArray<Section> => {
  const slotted = Array.from(scope.querySelectorAll(SECTION_SELECTOR))
    .map((element) => ({
      element,
      kind: SECTION_KINDS[element.getAttribute('data-slot') as keyof typeof SECTION_KINDS],
      title: sectionTitle(element),
    }))
    .filter((section) => section.title !== '');
  return slotted.length > 0 ? slotted : legacySections(scope);
};

/** One scope per panel side by side; the body otherwise. */
const scopes = (): ReadonlyArray<Element> => {
  const panels = Array.from(document.querySelectorAll('[data-frame-mode]'));
  return panels.length > 1 ? panels : [document.body];
};

/** Section titles in document order, indented by nesting; side by side, the first panel's. */
const outline = (): ReadonlyArray<{ kind: SectionKind; title: string; depth: number }> => {
  const sections = sectionsIn(scopes()[0]!);
  const elements = new Set(sections.map((section) => section.element));
  return sections.map((section) => {
    let depth = 0;
    for (let parent = section.element.parentElement; parent !== null; parent = parent.parentElement) {
      if (elements.has(parent)) depth++;
    }
    return { kind: section.kind, title: section.title, depth };
  });
};

/**
 * Marks the section titled `title` in each scope with `data-shot-target=mark`: exact (case-insensitive), else a single
 * substring match; `nth` picks among equal titles.
 */
const markSection = (
  title: string,
  nth: number | undefined,
  mark: string,
): { readonly ok: true } | { readonly ok: false; readonly several: ReadonlyArray<string> } => {
  const needle = title.toLowerCase();
  const chosen = scopes().map((scope) => {
    const sections = sectionsIn(scope);
    const exact = sections.filter((section) => section.title.toLowerCase() === needle);
    const matching =
      exact.length > 0 ? exact : sections.filter((section) => section.title.toLowerCase().includes(needle));
    return nth === undefined ? matching : matching.slice(nth, nth + 1);
  });
  if (chosen.every((matches) => matches.length === 1)) {
    for (const matches of chosen) matches[0]!.element.setAttribute('data-shot-target', mark);
    return { ok: true };
  }
  return {
    ok: false,
    several: chosen.some((matches) => matches.length > 1) ? chosen[0]!.map((section) => section.title) : [],
  };
};

const finding = (
  check: Finding['check'],
  severity: Finding['severity'],
  message: string,
  element: Element,
  rect?: Rect,
): Finding => ({
  check,
  severity,
  message,
  selector: selectorFor(element),
  rect: rect ?? pageRect(element.getBoundingClientRect()),
});

const checkOverflow = (root: Element): ReadonlyArray<Finding> =>
  elementsIn(root).flatMap((element) => {
    if (!(element instanceof HTMLElement) || element.tagName === 'svg' || ownText(element) === '') return [];
    const style = getComputedStyle(element);
    if (style.display === 'inline') return [];
    const excessX = element.scrollWidth - element.clientWidth;
    const excessY = element.scrollHeight - element.clientHeight;
    const truncated =
      style.textOverflow === 'ellipsis' || (style.webkitLineClamp !== 'none' && style.webkitLineClamp !== '');
    if (style.overflowX === 'visible' && excessX > 1) {
      return [finding('overflow', 'warn', `text overflows its box by ${excessX}px`, element)];
    }
    if ((style.overflowX === 'hidden' || style.overflowX === 'clip') && excessX > 1 && !truncated) {
      return [finding('overflow', 'warn', `text clipped by ${excessX}px without an ellipsis`, element)];
    }
    if ((style.overflowY === 'hidden' || style.overflowY === 'clip') && excessY > 1 && !truncated) {
      return [finding('overflow', 'warn', `text clipped by ${excessY}px vertically`, element)];
    }
    return [];
  });

const interactive =
  'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=checkbox], [role=switch], [role=radio], [role=tab], [role=menuitem], [role=link], [role=option], [role=slider], [tabindex]:not([tabindex="-1"])';

/** The element's box, grown by an absolutely positioned `::after`/`::before` (the `hit-area` utility). */
const hitSize = (element: Element): { width: number; height: number } => {
  const rect = element.getBoundingClientRect();
  let width = rect.width;
  let height = rect.height;
  for (const pseudo of ['::after', '::before']) {
    const style = getComputedStyle(element, pseudo);
    if (style.content === 'none' || style.position !== 'absolute') continue;
    width = Math.max(width, px(style.width));
    height = Math.max(height, px(style.height));
  }
  return { width, height };
};

const checkTargets = (root: Element): ReadonlyArray<Finding> => {
  if (!matchMedia('(pointer: coarse)').matches) return [];
  const candidates = [root, ...root.querySelectorAll(interactive)].filter(
    (element) => element.matches(interactive) && isVisible(element) && !(element as HTMLElement).matches(':disabled'),
  );
  // A control's label often carries the hit area: count the larger of the two.
  return candidates.flatMap((element) => {
    const own = hitSize(element);
    const labelElement =
      element.closest('label') ?? (element.id ? document.querySelector(`label[for="${element.id}"]`) : null);
    const labelled = labelElement === null ? own : hitSize(labelElement);
    const width = Math.round(Math.max(own.width, labelled.width));
    const height = Math.round(Math.max(own.height, labelled.height));
    if (width < 24 || height < 24)
      return [finding('target', 'error', `touch target ${width}×${height}, under 24×24`, element)];
    if (width < 44 || height < 44)
      return [finding('target', 'warn', `touch target ${width}×${height}, under 44×44`, element)];
    return [];
  });
};

/** Gaps between blocks, radii and type against the tokens. Padding is not checked: controls own theirs. */
const checkTokens = (root: Element): ReadonlyArray<Finding> => {
  const radii = currentRadii(root);
  const findings: Array<Finding> = [];
  for (const gap of gapsIn(root)) {
    if (gap.step !== undefined || gap.free) continue;
    const element = document.elementFromPoint(gap.rect.x - scrollX + 1, gap.rect.y - scrollY + 1) ?? root;
    findings.push(
      finding('tokens', 'warn', `${gap.axis} gap ${gap.size}px is off the spacing scale`, element, gap.rect),
    );
  }
  for (const element of elementsIn(root)) {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const radius = px(style.borderTopLeftRadius);
    const fullyRound = radius >= Math.min(rect.width, rect.height) / 2 - 0.5 || radius >= 9999;
    if (radius > 0 && !fullyRound && stepFor(radii, radius) === undefined) {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;visibility:hidden;height:calc(var(--outer-radius) - var(--outer-inset))';
      element.append(probe);
      const inner = probe.getBoundingClientRect().height;
      probe.remove();
      if (Math.abs(inner - radius) >= 0.5) {
        findings.push(finding('tokens', 'warn', `radius ${round(radius)}px is not a radius role`, element));
      }
    }
  }
  for (const sample of measureType(root)) {
    if (sample.match !== 'exact') {
      findings.push({
        check: 'tokens',
        severity: 'warn',
        message:
          sample.match === 'size'
            ? `line height ${sample.lineHeight ?? 'normal'} does not match ${sample.role} (${sample.size}px)`
            : `font size ${sample.size}px is not a type role`,
        selector: sample.selector,
        rect: sample.rect,
      });
    }
  }
  return findings;
};

const checkAlign = (root: Element): ReadonlyArray<Finding> =>
  measureEdges(root).nearMisses.map((miss) => ({
    check: 'align',
    severity: 'warn',
    message: `${miss.edge} edges ${miss.delta}px apart: ${miss.a} and ${miss.b}`,
    selector: miss.a,
    rect: union(miss.rects),
  }));

const CHECKS = { overflow: checkOverflow, target: checkTargets, tokens: checkTokens, align: checkAlign } as const;

const check = (ids: ReadonlyArray<keyof typeof CHECKS>, root: Element): ReadonlyArray<Finding> =>
  ids.flatMap((id) => CHECKS[id](root));

const shot = { outline, markSection, overlay, clearOverlay, measure, check };

declare global {
  interface Window {
    __shot: typeof shot;
  }
}

window.__shot = shot;
