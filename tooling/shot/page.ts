import {
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  devices,
  type Locator,
  type Page,
} from 'playwright';

import type { AppAccess } from './app.ts';
import {
  describeSource,
  describeTarget,
  type Rect,
  sectionTarget,
  type Source,
  type Step,
  type Target,
  type Variant,
} from './model.ts';
import { fail } from './output.ts';
import type { RuntimeOutlineEntry } from './runtime.ts';
import { closest } from './story-index.ts';

/**
 * One page of a source and its lifecycle. A story:
 *
 *   loading ──rendered──▶ settling ──settled──▶ ready
 *      ├─ error display / "Error rendering story" ──▶ failed
 *      ├─ 504 Outdated Optimize Dep, failed dynamic import ──▶ stale-deps ──reload once──▶ loading (again: failed)
 *      └─ no render in 20s ──▶ timed-out
 *
 * A route of the app:
 *
 *   loading ──hydrated, navigation idle, network quiet──▶ settling ──settled──▶ ready
 *      ├─ 5xx, a route error boundary ──▶ failed
 *      ├─ redirected to /login ──▶ log in again once ──▶ loading (again: failed)
 *      ├─ redirected elsewhere ──▶ failed (a 404 or a permission redirect)
 *      └─ not ready in 20s ──▶ timed-out
 *
 * Stories are deterministic: a fixed clock and seeded Math.random. Routes keep the real clock: the server renders
 * dates, and a frozen browser clock would break hydration. Both hide the caret and scrollbars.
 */

const FIXED_TIME = '2026-01-15T09:00:00';
const renderTimeoutMs = 20_000;
const settleCapMs = 2_000;
const targetPadding = 16;

export interface PageEnv {
  readonly browser: Browser;
  /** Storybook's URL. */
  readonly url: string;
  /** The running app, for route sources; resolved on the first route. */
  readonly app: () => Promise<AppAccess>;
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
      /** Console and page errors, and blocked writes; live: steps add to it. */
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

const seededRandom = () => {
  let seed = 0x5eed;
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

const hideCaretAndScrollbars = () => {
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

interface OpenOptions {
  readonly settle: boolean;
  readonly slowClock: boolean;
}

/** Errors in the order they happened, each once. */
const errorLog = () => {
  const errors: Array<string> = [];
  return { errors, add: (error: string) => (errors.includes(error) ? undefined : errors.push(error)) };
};

export const openSource = (env: PageEnv, source: Source, variant: Variant, options: OpenOptions): Promise<Opened> =>
  source.kind === 'story' ? openStory(env, source.id, variant, options) : openRoute(env, source, variant, options);

const openStory = async (env: PageEnv, story: string, variant: Variant, options: OpenOptions): Promise<Opened> => {
  const context = await env.browser.newContext(contextOptions(variant));
  await context.addInitScript(seededRandom);
  await context.addInitScript(hideCaretAndScrollbars);
  if (options.slowClock) await context.addInitScript(slowClock);
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date(FIXED_TIME));

  const log = errorLog();
  let stale = false;
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (/Failed to fetch dynamically imported module|Outdated Optimize Dep/.test(text)) stale = true;
    else log.add(text);
  });
  page.on('pageerror', (error) => {
    if (/Failed to fetch dynamically imported module|Outdated Optimize Dep/.test(error.message)) stale = true;
    else log.add(error.message);
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
      const errors = log.errors.slice(0, 5).map((error) => `  console: ${error.split('\n')[0]}`);
      const tail = env
        .logTail()
        .split('\n')
        .slice(-8)
        .map((line) => `  log: ${line}`);
      return failWith(
        'timed-out',
        [`${story} did not render within ${renderTimeoutMs / 1000}s.`, ...errors, ...tail].join('\n'),
      );
    }
    break;
  }

  await page.addScriptTag({ content: env.runtime });
  if (options.settle) await settle(page);
  return { kind: 'ready', page, context, consoleErrors: log.errors, close };
};

type RouteState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready' }
  | { readonly kind: 'failed'; readonly message: string };

const readRouteState = (): RouteState => {
  const routeError = document.querySelector('[data-route-error]');
  if (routeError !== null) {
    return {
      kind: 'failed',
      message: ((routeError as HTMLElement).innerText ?? '').trim().replaceAll(/\s+/g, ' ').slice(0, 300),
    };
  }
  const root = document.documentElement;
  return root.hasAttribute('data-hydrated') && root.dataset['navigation'] === 'idle'
    ? { kind: 'ready' }
    : { kind: 'loading' };
};

const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Same-origin requests in flight, without long-lived streams; resolves after 500ms with none (cap 10s). */
const trackNetwork = (page: Page, origin: string) => {
  const inFlight = new Set<unknown>();
  let lastChange = Date.now();
  const counts = (request: { url: () => string; resourceType: () => string }) =>
    request.url().startsWith(origin) && !['eventsource', 'websocket'].includes(request.resourceType());
  page.on('request', (request) => {
    if (!counts(request)) return;
    inFlight.add(request);
    lastChange = Date.now();
  });
  const done = (request: unknown) => {
    if (inFlight.delete(request)) lastChange = Date.now();
  };
  page.on('requestfinished', done);
  page.on('requestfailed', done);
  return async () => {
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline && (inFlight.size > 0 || Date.now() - lastChange < 500)) await sleep(50);
  };
};

const openRoute = async (
  env: PageEnv,
  source: Extract<Source, { kind: 'route' }>,
  variant: Variant,
  options: OpenOptions,
): Promise<Opened> => {
  const app = await env.app();
  const target = new URL(source.path, app.url);
  const mode = variant.mode === 'dark' ? 'dark' : 'light';
  const label = describeSource(source);

  for (let attempt = 1; ; attempt++) {
    const storageState = await app.session(source.as, source.org, attempt > 1);
    const context = await env.browser.newContext({
      ...contextOptions(variant),
      ignoreHTTPSErrors: true,
      storageState,
      colorScheme: mode,
    });
    const close = () => context.close();
    const failWith = async (kind: 'failed' | 'timed-out', message: string): Promise<Opened> => {
      await close();
      return { kind, message };
    };
    // The mode comes from the client hint, not from a theme the user picked.
    await context.clearCookies({ name: '__elternportal_theme' });
    await context.addCookies([{ name: 'CH-prefers-color-scheme', value: mode, url: app.url }]);
    await context.addInitScript(hideCaretAndScrollbars);
    if (options.slowClock) await context.addInitScript(slowClock);

    const log = errorLog();
    if (!app.allowWrites) {
      await context.route(
        (url) => url.origin === target.origin,
        async (route) => {
          const request = route.request();
          if (!writeMethods.has(request.method())) return route.fallback();
          log.add(`blocked ${request.method()} ${new URL(request.url()).pathname}; --allow-writes sends it`);
          return route.abort('blockedbyclient');
        },
      );
    }
    const page = await context.newPage();
    page.on('console', (message) => {
      // The browser's echo of a blocked write, which is already reported.
      if (message.type() === 'error' && !message.text().includes('ERR_BLOCKED_BY_CLIENT')) log.add(message.text());
    });
    page.on('pageerror', (error) => log.add(error.message));
    const networkQuiet = trackNetwork(page, target.origin);

    let response;
    try {
      response = await page.goto(target.href, { waitUntil: 'commit', timeout: renderTimeoutMs });
    } catch (error) {
      return failWith('failed', `${label}: could not load the page (${String(error).split('\n')[0]})`);
    }
    if (response !== null && response.status() >= 400) {
      return failWith('failed', `${label}: the server answered ${response.status()}.`);
    }
    const deadline = Date.now() + renderTimeoutMs;
    let state: RouteState = { kind: 'loading' };
    while (state.kind === 'loading' && Date.now() < deadline) {
      await sleep(100);
      state = await page.evaluate(readRouteState).catch((): RouteState => ({ kind: 'loading' }));
    }
    const landed = new URL(page.url());
    if (landed.pathname.startsWith('/login')) {
      await close();
      if (attempt === 1) continue;
      return { kind: 'failed', message: `${label}: the app sent a fresh session back to ${landed.pathname}.` };
    }
    if (state.kind === 'failed') return failWith('failed', `${label}: route error: ${state.message}`);
    if (state.kind === 'loading') {
      const errors = log.errors.slice(0, 5).map((error) => `  console: ${error.split('\n')[0]}`);
      return failWith(
        'timed-out',
        [`${label} was not ready within ${renderTimeoutMs / 1000}s (hydrated, navigation idle).`, ...errors].join('\n'),
      );
    }
    if (landed.pathname !== target.pathname) {
      return failWith('failed', `${label}: redirected to ${landed.pathname}${landed.search}.`);
    }
    await networkQuiet();
    await page.addScriptTag({ content: env.runtime });
    if (options.settle) await settle(page);
    return { kind: 'ready', page, context, consoleErrors: log.errors, close };
  }
};

const viewports = new WeakMap<Page, { readonly width: number; readonly height: number }>();

/**
 * The app scrolls inside its shell (`html` and `body` are `overflow-hidden`), so a full-page screenshot stops at the
 * viewport. `expand` grows the viewport until the tallest scroller fits, so every target is on screen in page
 * coordinates; otherwise the original viewport comes back.
 */
export const fitContent = async (page: Page, expand: boolean) => {
  const original = viewports.get(page) ?? page.viewportSize();
  if (original === null) return;
  viewports.set(page, original);
  if (!expand) {
    const current = page.viewportSize();
    if (current?.height !== original.height) {
      await page.setViewportSize(original);
      await settle(page);
    }
    return;
  }
  for (let round = 0; round < 3; round++) {
    const hidden = await page.evaluate(() =>
      Math.max(
        0,
        ...Array.from(document.querySelectorAll('*')).map((element) => {
          const style = getComputedStyle(element);
          const scrolls = /(auto|scroll|hidden)/.test(style.overflowY) && element !== document.documentElement;
          return scrolls ? element.scrollHeight - element.clientHeight : 0;
        }),
      ),
    );
    if (hidden <= 1) return;
    const current = page.viewportSize() ?? original;
    await page.setViewportSize({ width: current.width, height: Math.min(12_000, current.height + hidden) });
    await settle(page);
  }
};

/** What a page declares about itself: its outline and, on stories, `parameters.shots`. */
export const readDeclared = async (
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

const outlineMarker: Record<Outline['kind'], string> = { section: '', preview: '· ', card: '▸ ' };

/** Indented by nesting; `·` a Preview, `▸` an InsetCard. */
export const formatOutline = (entries: ReadonlyArray<Outline>): string =>
  entries.map((entry) => `${'  '.repeat(entry.depth)}${outlineMarker[entry.kind]}${entry.title}`).join('\n');

export interface ResolvedTarget {
  /** Page coordinates to screenshot, padded for rings and shadows. */
  readonly clip: Rect | undefined;
  /** The elements overlays, measurements and checks run on; one per panel side by side. */
  readonly roots: ReadonlyArray<Locator>;
}

let markCount = 0;

const sectionRoots = async (page: Page, title: string, nth?: number): Promise<ReadonlyArray<Locator>> => {
  const mark = `t${++markCount}`;
  const result = await page.evaluate(({ title, nth, mark }) => window.__shot.markSection(title, nth, mark), {
    title,
    nth,
    mark,
  });
  if (!result.ok) {
    const sections = formatOutline(await outline(page));
    const reason =
      result.several.length > 0
        ? `"${title}" matches ${result.several.length}: ${result.several.join(', ')}; add ' >> nth=<i>'`
        : `No section "${title}"${nth === undefined ? '' : ` >> nth=${nth}`}`;
    fail(
      `${reason}. Sections:\n${sections || '  (none: no FoundationSection, PageSection, Preview or titled InsetCard)'}`,
    );
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
