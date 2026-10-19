import {
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  devices,
  type Locator,
  type Page,
} from 'playwright';

import { describeTarget, type Rect, sectionTarget, type Step, type Target, type Variant } from './model.ts';
import { fail } from './output.ts';
import type { RuntimeOutlineEntry } from './runtime.ts';
import { closest } from './story-index.ts';

/**
 * One story page and its lifecycle:
 *
 *   loading ──rendered──▶ settling ──settled──▶ ready
 *      ├─ error display / "Error rendering story" ──▶ failed
 *      ├─ 504 Outdated Optimize Dep, failed dynamic import ──▶ stale-deps ──reload once──▶ loading (again: failed)
 *      └─ no render in 20s ──▶ timed-out
 *
 * Determinism is set up before navigation: a fixed clock, seeded Math.random, no caret, no scrollbars.
 */

const FIXED_TIME = '2026-01-15T09:00:00';
const renderTimeoutMs = 20_000;
const settleCapMs = 2_000;
const targetPadding = 16;

export interface PageEnv {
  readonly browser: Browser;
  readonly url: string;
  /** The bundled in-page runtime (`.storybook/shot-runtime.ts`). */
  readonly runtime: string;
  /** Storybook's log tail, for a timed-out render. */
  readonly logTail: () => string;
}

export type Opened =
  | {
      readonly kind: 'ready';
      readonly page: Page;
      readonly context: BrowserContext;
      readonly consoleErrors: ReadonlyArray<string>;
      readonly close: () => Promise<void>;
    }
  | { readonly kind: 'failed' | 'timed-out'; readonly message: string };

const deviceName = (requested: string): string => {
  const name = Object.keys(devices).find((candidate) => candidate.toLowerCase() === requested.toLowerCase());
  if (name !== undefined) return name;
  return fail(
    `No device "${requested}". Did you mean:\n${closest(
      requested,
      Object.keys(devices).filter((candidate) => !candidate.endsWith('landscape')),
    )
      .map((candidate) => `  ${candidate}`)
      .join('\n')}`,
  );
};

const contextOptions = (variant: Variant): BrowserContextOptions => {
  const device = variant.device === undefined ? undefined : devices[deviceName(variant.device)];
  const viewport = device?.viewport ?? { width: 1280, height: 900 };
  return {
    ...(device === undefined
      ? {}
      : { userAgent: device.userAgent, isMobile: device.isMobile, hasTouch: device.hasTouch }),
    viewport: { width: variant.width ?? viewport.width, height: variant.height ?? viewport.height },
    deviceScaleFactor: variant.scale,
    reducedMotion: variant.reducedMotion ? 'reduce' : 'no-preference',
  };
};

const storyUrl = (url: string, story: string, variant: Variant) => {
  const globals = { ...variant.globals, theme: variant.mode === 'side' ? 'side by side' : variant.mode };
  const param = Object.entries(globals)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');
  return `${url}/iframe.html?id=${encodeURIComponent(story)}&viewMode=story&globals=${encodeURIComponent(param)}`;
};

/** Seeded `Math.random`, and the style that hides the caret and scrollbars. */
const determinism = () => {
  let seed = 0x5eed;
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
  const style = () => {
    const element = document.createElement('style');
    element.textContent =
      '*,*::before,*::after{caret-color:transparent!important;scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}';
    document.head.append(element);
  };
  if (document.head === null) document.addEventListener('DOMContentLoaded', style);
  else style();
};

/** Scales `performance.now` and `requestAnimationFrame` timestamps, so JS animations slow down with `--slow`. */
const slowClock = () => {
  const real = performance.now.bind(performance);
  let rate = 1;
  let baseReal = 0;
  let baseVirtual = 0;
  const now = () => baseVirtual + (real() - baseReal) * rate;
  performance.now = now;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => raf(() => callback(now()));
  (window as unknown as { __shotSetSlow: (next: number) => void }).__shotSetSlow = (next) => {
    baseVirtual = now();
    baseReal = real();
    rate = next;
  };
};

type RenderState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'rendered' }
  | { readonly kind: 'failed'; readonly message: string };

const readRenderState = (): RenderState => {
  const body = document.body?.classList;
  const preview = (window as unknown as { __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } } })
    .__STORYBOOK_PREVIEW__;
  const phase = preview?.currentRender?.phase;
  if (body?.contains('sb-show-errordisplay') || phase === 'errored') {
    const message = document.querySelector('#error-message')?.textContent?.trim() ?? 'Error rendering story';
    const stack = (document.querySelector('#error-stack')?.textContent ?? '').trim().split('\n').slice(0, 4).join('\n');
    return { kind: 'failed', message: [message, stack].filter((value) => Boolean(value)).join('\n') };
  }
  if (body?.contains('sb-show-nopreview')) return { kind: 'failed', message: 'Storybook shows "No Preview".' };
  // Stories render inside a React Router data router (preview.tsx): a render error lands in its default boundary,
  // which Storybook counts as rendered.
  const boundary = Array.from(document.querySelectorAll('h2')).find(
    (heading) => heading.textContent === 'Unexpected Application Error!',
  );
  if (boundary !== undefined) {
    const message = boundary.nextElementSibling?.textContent?.trim() ?? 'Error rendering story';
    return { kind: 'failed', message };
  }
  if (body?.contains('sb-show-main') && ['completed', 'afterEach', 'finished'].includes(phase ?? '')) {
    return { kind: 'rendered' };
  }
  return { kind: 'loading' };
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Fonts loaded, finite animations finished (capped), then two frames. */
export const settle = async (page: Page, extraMs = 0) => {
  await page.evaluate(async (capMs) => {
    await document.fonts.ready;
    const deadline = performance.now() + capMs;
    const running = () =>
      document.getAnimations().filter((animation) => {
        const end = animation.effect?.getComputedTiming().endTime;
        return animation.playState === 'running' && typeof end === 'number' && Number.isFinite(end);
      });
    for (let pending = running(); pending.length > 0 && performance.now() < deadline; pending = running()) {
      await Promise.race([
        Promise.all(pending.map((animation) => animation.finished.catch(() => undefined))),
        new Promise((resolve) => setTimeout(resolve, Math.max(0, deadline - performance.now()))),
      ]);
    }
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, settleCapMs);
  if (extraMs > 0) await sleep(extraMs);
};

export const openStory = async (
  env: PageEnv,
  story: string,
  variant: Variant,
  options: { readonly settle: boolean; readonly slowClock: boolean },
): Promise<Opened> => {
  const context = await env.browser.newContext(contextOptions(variant));
  await context.addInitScript(determinism);
  if (options.slowClock) await context.addInitScript(slowClock);
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(FIXED_TIME));

  const consoleErrors = new Set<string>();
  let stale = false;
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/Failed to fetch dynamically imported module|Outdated Optimize Dep/.test(text)) stale = true;
    else consoleErrors.add(text);
  });
  page.on('pageerror', (error) => {
    if (/Failed to fetch dynamically imported module|Outdated Optimize Dep/.test(error.message)) stale = true;
    else consoleErrors.add(error.message);
  });
  page.on('response', (response) => {
    if (response.status() === 504 && /Outdated Optimize Dep/i.test(response.statusText())) stale = true;
  });

  const close = () => context.close();
  const failWith = async (kind: 'failed' | 'timed-out', message: string): Promise<Opened> => {
    await close();
    return { kind, message };
  };

  for (let attempt = 1; ; attempt++) {
    stale = false;
    try {
      await page.goto(storyUrl(env.url, story, variant), { waitUntil: 'commit', timeout: renderTimeoutMs });
    } catch (error) {
      return failWith('failed', `${story}: could not load the page (${String(error).split('\n')[0]})`);
    }
    const deadline = Date.now() + renderTimeoutMs;
    let state: RenderState = { kind: 'loading' };
    while (state.kind === 'loading' && !stale && Date.now() < deadline) {
      await sleep(100);
      // A navigation (Vite's reload after optimizing) destroys the context: still loading.
      state = await page.evaluate(readRenderState).catch((): RenderState => ({ kind: 'loading' }));
    }
    if (stale || (state.kind === 'failed' && /dynamically imported module|Optimize Dep/.test(state.message))) {
      if (attempt === 1) continue;
      return failWith('failed', `${story}: Vite's dependencies are still outdated after a reload; run again.`);
    }
    if (state.kind === 'failed') return failWith('failed', `${story} failed to render: ${state.message}`);
    if (state.kind === 'loading') {
      const errors = [...consoleErrors].slice(0, 5).map((error) => `  console: ${error.split('\n')[0]}`);
      const log = env
        .logTail()
        .split('\n')
        .slice(-8)
        .map((line) => `  log: ${line}`);
      return failWith(
        'timed-out',
        [`${story} did not render within ${renderTimeoutMs / 1000}s.`, ...errors, ...log].join('\n'),
      );
    }
    break;
  }

  await page.addScriptTag({ content: env.runtime });
  if (options.settle) await settle(page);
  return { kind: 'ready', page, context, consoleErrors: [...consoleErrors], close };
};

/** What a story declares about itself: its outline and `parameters.shots`. */
export const readStory = async (
  page: Page,
): Promise<{ readonly outline: ReadonlyArray<Outline>; readonly shots: unknown }> => ({
  outline: await outline(page),
  shots: await page.evaluate(
    () =>
      (
        window as unknown as {
          __STORYBOOK_PREVIEW__?: { currentRender?: { story?: { parameters?: Record<string, unknown> } } };
        }
      ).__STORYBOOK_PREVIEW__?.currentRender?.story?.parameters?.['shots'],
  ),
});

const stepLabel = (step: Step) =>
  step.kind === 'key'
    ? `--key ${step.key}`
    : `--${step.kind} ${step.kind === 'fill' ? `${step.selector}=…` : step.selector}`;

/** Runs one step; fails with one line naming the step. */
export const runStep = async (page: Page, step: Step) => {
  if (step.kind === 'key') {
    await page.keyboard.press(step.key);
    return;
  }
  // The first visible match: Storybook keeps hidden controls (buttons, inputs) in the page.
  const locator = page.locator(step.selector).filter({ visible: true }).first();
  await locator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => undefined);
  if ((await locator.count()) === 0) {
    const hidden = await page.locator(step.selector).count();
    fail(`${stepLabel(step)}: ${hidden > 0 ? `${hidden} matching, none visible` : 'no element matches'} (waited 2s).`);
  }
  try {
    switch (step.kind) {
      case 'click':
        await locator.click({ timeout: 5000 });
        break;
      case 'hover':
        await locator.hover({ timeout: 5000 });
        break;
      case 'focus':
        // A keypress first puts Chrome in keyboard modality, so programmatic focus matches :focus-visible.
        await page.keyboard.press('Shift');
        await locator.focus({ timeout: 5000 });
        break;
      case 'press':
        await locator.hover({ timeout: 5000 });
        await page.mouse.down();
        break;
      case 'fill':
        await locator.fill(step.text, { timeout: 5000 });
        break;
    }
  } catch (error) {
    fail(
      `${stepLabel(step)}: ${String(error)
        .split('\n')[0]!
        .replace(/^\w+: /, '')}`,
    );
  }
};

type Outline = RuntimeOutlineEntry;

const outline = (page: Page): Promise<ReadonlyArray<Outline>> => page.evaluate(() => window.__shot.outline());

export const formatOutline = (entries: ReadonlyArray<Outline>): string =>
  entries.map((entry) => `${'  '.repeat(entry.depth)}${entry.kind === 'preview' ? '· ' : ''}${entry.title}`).join('\n');

export interface ResolvedTarget {
  /** Page coordinates to screenshot, padded for rings and shadows. */
  readonly clip: Rect | undefined;
  /** The elements overlays, measurements and checks run on; one per panel side by side. */
  readonly roots: ReadonlyArray<Locator>;
}

/**
 * Marks the section matching `title` in each panel with `data-shot-target`, by `data-title` (exact, else a single
 * substring match), or for refs without the attribute by a `FoundationSection` heading.
 */
const markSections = (page: Page, title: string, nth: number | undefined, mark: string) =>
  page.evaluate(
    ({ title, nth, mark }) => {
      const needle = title.toLowerCase();
      const panels = Array.from(document.querySelectorAll('[data-frame-mode]'));
      const scopes: ReadonlyArray<Element> = panels.length > 1 ? panels : [document.body];
      const titled = (scope: Element) =>
        Array.from(
          scope.querySelectorAll('[data-slot=foundation-section][data-title], [data-slot=preview][data-title]'),
        ).map((element) => ({ element, title: element.getAttribute('data-title') ?? '' }));
      const headed = (scope: Element) =>
        Array.from(scope.querySelectorAll('section')).flatMap((element) => {
          const heading = element.querySelector(':scope > div > h2');
          return heading === null ? [] : [{ element, title: heading.textContent?.trim() ?? '' }];
        });
      const results = scopes.map((scope) => {
        const candidates = titled(scope).length > 0 ? titled(scope) : headed(scope);
        const exact = candidates.filter((candidate) => candidate.title.toLowerCase() === needle);
        const partial = candidates.filter((candidate) => candidate.title.toLowerCase().includes(needle));
        const matching = exact.length > 0 ? exact : partial;
        const chosen = nth === undefined ? matching : matching.slice(nth, nth + 1);
        return { chosen, titles: candidates.map((candidate) => candidate.title) };
      });
      const counts = results.map((result) => result.chosen.length);
      if (counts.every((count) => count === 1)) {
        for (const result of results) result.chosen[0]!.element.setAttribute('data-shot-target', mark);
        return { ok: true as const };
      }
      return {
        ok: false as const,
        several: counts.some((count) => count > 1) ? results[0]!.chosen.map((candidate) => candidate.title) : [],
      };
    },
    { title, nth, mark },
  );

let markCount = 0;

const sectionRoots = async (page: Page, title: string, nth?: number): Promise<ReadonlyArray<Locator>> => {
  const mark = `t${++markCount}`;
  const result = await markSections(page, title, nth, mark);
  if (!result.ok) {
    const sections = formatOutline(await outline(page));
    const reason =
      result.several.length > 0
        ? `"${title}" matches ${result.several.length}: ${result.several.join(', ')}; add ' >> nth=<i>'`
        : `No section "${title}"${nth === undefined ? '' : ` >> nth=${nth}`}`;
    fail(`${reason}. Sections and previews:\n${sections || '  (none: the story has no FoundationSection or Preview)'}`);
  }
  const locator = page.locator(`[data-shot-target="${mark}"]`);
  return Array.from({ length: await locator.count() }, (_, index) => locator.nth(index));
};

const pageBox = (locator: Locator): Promise<Rect> =>
  locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + window.scrollX, y: rect.top + window.scrollY, width: rect.width, height: rect.height };
  });

const padded = async (page: Page, rects: ReadonlyArray<Rect>): Promise<Rect> => {
  const size = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }));
  const x = Math.max(0, Math.floor(Math.min(...rects.map((rect) => rect.x)) - targetPadding));
  const y = Math.max(0, Math.floor(Math.min(...rects.map((rect) => rect.y)) - targetPadding));
  const right = Math.min(size.width, Math.ceil(Math.max(...rects.map((rect) => rect.x + rect.width)) + targetPadding));
  const bottom = Math.min(
    size.height,
    Math.ceil(Math.max(...rects.map((rect) => rect.y + rect.height)) + targetPadding),
  );
  return { x, y, width: right - x, height: bottom - y };
};

/** `all`: select targets keep every match (up to the caller), for `--measure --all`. */
export const resolveTarget = async (
  page: Page,
  target: Target,
  side: boolean,
  all = false,
): Promise<ResolvedTarget> => {
  switch (target.kind) {
    case 'page':
      return { clip: undefined, roots: [page.locator('body')] };
    case 'viewport': {
      const clip = await page.evaluate(() => ({
        x: window.scrollX,
        y: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
      }));
      return { clip, roots: [page.locator('body')] };
    }
    case 'section': {
      const roots = await sectionRoots(page, target.title, target.nth);
      return { clip: await padded(page, await Promise.all(roots.map((value) => pageBox(value)))), roots };
    }
    case 'select': {
      const scopes =
        target.within !== undefined
          ? await sectionRoots(page, sectionTarget(target.within).title, sectionTarget(target.within).nth)
          : side
            ? [page.locator('[data-frame-mode]').nth(0), page.locator('[data-frame-mode]').nth(1)]
            : [];
      const pick = (locator: Locator) => (all ? locator : locator.filter({ visible: true }).first());
      let roots = scopes.map((scope) => pick(scope.locator(target.selector)));
      const found = await Promise.all(roots.map((root) => root.count()));
      // Portaled popups render outside the panels: fall back to the page.
      if (roots.length === 0 || (target.within === undefined && found.some((count) => count === 0))) {
        roots = [pick(page.locator(target.selector))];
      } else if (found.some((count) => count === 0)) {
        fail(
          `--select ${target.selector}: no element matches inside "${target.within}". Popups and dialogs render outside sections: drop --section.`,
        );
      }
      // Content that renders after the scene (a toast, a popup) gets a moment to appear.
      await roots[0]!
        .first()
        .waitFor({ state: 'attached', timeout: 2000 })
        .catch(() => undefined);
      if ((await roots[0]!.count()) === 0) fail(`--select ${target.selector}: no element matches (waited 2s).`);
      await roots[0]!
        .first()
        .scrollIntoViewIfNeeded()
        .catch(() => undefined);
      const rects = await Promise.all(roots.map((root) => pageBox(root.first())));
      if (rects.every((rect) => rect.width === 0 || rect.height === 0)) {
        fail(`--select ${target.selector} is not visible (${describeTarget(target)}).`);
      }
      return { clip: await padded(page, rects), roots };
    }
  }
};
