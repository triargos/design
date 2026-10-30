import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { animate, LazyMotion, m, type Transition, useReducedMotion } from 'framer-motion';
import { IconArrowLeft, IconChevronRight, IconDots } from '@tabler/icons-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useLocale } from '~/components/ui/locale';
import { useLinkRender } from '~/components/ui/link';
import { loadMotionFeatures } from '~/lib/motion/load';
import { cn } from '~/lib/utils';

type BottomNavContextValue = {
  /** The layer in the nav's shell where an open `ActionBar` docks, while the nav shows (below `md`). */
  readonly dock: HTMLElement | null;
  readonly setDock: (dock: HTMLElement | null) => void;
  /** The open `ActionBar` that shows: the highest `priority`, of those the last opened. */
  readonly top: string | null;
  /** An `ActionBar` opens; the function it returns closes it. */
  readonly openBar: (id: string, priority: number) => () => void;
};

const BottomNavContext = React.createContext<BottomNavContextValue | null>(null);

/** For `ActionBar`: the dock and the open bars, or `null` without a provider. */
function useBottomNavDock() {
  return React.use(BottomNavContext);
}

type OpenBar = { readonly id: string; readonly priority: number };

/**
 * Around the app shell, so a page's `ActionBar` can take the nav's place on a phone. A `BottomNav` works without it;
 * its action bars then stay in the page. Of the open bars one shows, docked or in the page: the highest `priority`,
 * of those the last opened. The others wait until it closes.
 */
function BottomNavProvider({ children }: { children: React.ReactNode }) {
  const [dock, setDock] = React.useState<HTMLElement | null>(null);
  // In the order they opened.
  const [bars, setBars] = React.useState<readonly OpenBar[]>([]);
  const openBar = React.useCallback((id: string, priority: number) => {
    const bar = { id, priority };
    setBars((current) => [...current.filter((open) => open.id !== id), bar]);
    return () => setBars((current) => current.filter((open) => open !== bar));
  }, []);
  const top = bars.reduce<OpenBar | null>((shown, bar) => (shown && shown.priority > bar.priority ? shown : bar), null);
  return <BottomNavContext value={{ dock, setDock, top: top?.id ?? null, openBar }}>{children}</BottomNavContext>;
}

/** A swap: a row on its way out (`data-exiting`) beside the one coming in. Springs past a little, as the morph does. */
const swapping = { type: 'spring', duration: 0.45, bounce: 0.25 } as const;
/** A size change in place (a count grows a digit, a row wraps): no overshoot. */
const resizing = { type: 'spring', duration: 0.25, bounce: 0 } as const;

/**
 * Holds a shell (`BottomNavList`'s, an `ActionBar`'s in the page) at the size of `layer`, what it shows: the first
 * size at once, every change after on a spring, width and height together (`swapping` while a `[data-exiting]` row
 * leaves the layer, else `resizing`). While `paused` the caller animates the shell; the size the layer takes meanwhile
 * counts as measured, and `refit` (set here) springs the shell to it from wherever the caller left it. Reduced motion
 * jumps.
 */
function useFitShell(
  shell: React.RefObject<HTMLElement | null>,
  layer: HTMLElement | null,
  options: { reduced: boolean; paused?: React.RefObject<boolean>; refit?: React.RefObject<() => void> },
) {
  const { reduced, paused, refit } = options;
  React.useLayoutEffect(() => {
    const element = shell.current;
    if (element === null || layer === null) return;
    // The layer's last size, and the last one the shell was sent to.
    let measured: string | undefined;
    let applied: string | undefined;
    let running: { stop: () => void } | undefined;
    const fit = (force: boolean) => {
      const width = layer.offsetWidth;
      const height = layer.offsetHeight;
      // Not laid out: the nav under `md:hidden`.
      if (width === 0) return;
      const key = `${width}x${height}`;
      if (key === (force ? applied : measured)) return;
      const first = measured === undefined;
      measured = key;
      if (paused?.current) return;
      applied = key;
      running?.stop();
      if (first || reduced || (element.offsetWidth === width && element.offsetHeight === height)) {
        Object.assign(element.style, { width: `${width}px`, height: `${height}px` });
        return;
      }
      const swap = layer.querySelector('[data-exiting]') !== null;
      // Explicit keyframes: the inline size is set behind Motion's back.
      running = animate(
        element,
        { width: [element.offsetWidth, width], height: [element.offsetHeight, height] },
        swap ? swapping : resizing,
      );
    };
    fit(false);
    if (refit) refit.current = () => fit(true);
    const observer = new ResizeObserver(() => fit(false));
    observer.observe(layer);
    return () => {
      observer.disconnect();
      running?.stop();
      if (refit) refit.current = () => {};
    };
  }, [shell, layer, reduced, paused, refit]);
}

/** What the shell shows: the tabs, the "More" panel, or a docked `ActionBar`. */
type View = 'tabs' | 'panel' | 'dock';

type BarContextValue = {
  readonly view: View;
  readonly panelOpen: boolean;
  readonly setPanelOpen: (open: boolean) => void;
  /** The panel layer, where `BottomNavMore` and each `BottomNavMoreGroup` put their page. */
  readonly panel: HTMLElement | null;
  readonly setPanel: (panel: HTMLElement | null) => void;
  readonly panelId: string;
  /** The groups opened in the panel, outermost first; empty on the "More" list itself. */
  readonly panelPath: readonly string[];
  readonly setPanelPath: (path: readonly string[]) => void;
  /** The tab just tapped, shown as current until the page it opens moves `aria-current`. */
  readonly optimisticCurrent: string | null;
  readonly setOptimisticCurrent: (tab: string | null) => void;
};

const BarContext = React.createContext<BarContextValue | null>(null);

function useBar(part: string) {
  const bar = React.use(BarContext);
  if (bar === null) throw new Error(`${part} must be used within a BottomNav.`);
  return bar;
}

/** The page `BottomNavMore` puts its children on, the first the panel shows. */
const ROOT_PAGE = 'root';

/** The page of the panel that shows. */
function activePage(panel: HTMLElement) {
  return panel.querySelector<HTMLElement>(':scope > [data-slot=bottom-nav-panel-page][data-active]');
}

function pageOf(panel: HTMLElement, page: string) {
  return panel.querySelector<HTMLElement>(`:scope > [data-page="${CSS.escape(page)}"]`);
}

function rowsOf(parent: Element | null) {
  return [...(parent?.children ?? [])].filter((el): el is HTMLElement => el instanceof HTMLElement);
}

/** Back a page from `path`; focus returns to the row that opened the page left. */
function backFrom(path: readonly string[], setPath: (path: readonly string[]) => void, shell: HTMLElement | null) {
  const left = path.at(-1);
  setPath(path.slice(0, -1));
  if (left !== undefined)
    requestAnimationFrame(() =>
      shell?.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(left)}"]`)?.focus({ preventScroll: true }),
    );
}

/** Whether `element` holds the current page, or a group (`aria-current='true'`) that does. */
function useHoldsCurrent(element: HTMLElement | null) {
  const [holds, setHolds] = React.useState(false);
  React.useEffect(() => {
    if (element === null) return;
    const check = () => setHolds(element.querySelector('[aria-current]') !== null);
    check();
    const observer = new MutationObserver(check);
    observer.observe(element, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-current'] });
    return () => observer.disconnect();
  }, [element]);
  return holds;
}

/** The id of the "More" tab, for its rows: a row tapped makes the tab current. */
const MoreTabContext = React.createContext<string | null>(null);

/**
 * A tab that shows as current from the tap on. A router sets `aria-current` only once the next page renders, which
 * on a phone lags the tap by that render; the fill and the tab's color move at once instead. `aria-current` stays the
 * router's. A click that opens a new tab or window, or that the link handles itself (`preventDefault`), changes
 * nothing.
 */
function useOptimisticCurrent(part: string, tab: string) {
  const { optimisticCurrent, setOptimisticCurrent } = useBar(part);
  return {
    isOptimisticCurrent: optimisticCurrent === tab,
    onTap: (event: React.MouseEvent<HTMLElement>) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      if (event.altKey || event.currentTarget.getAttribute('aria-current') === 'page') return;
      setOptimisticCurrent(tab);
    },
  };
}

// The morph, after Danny Williams's morphing menu: the shell squeezes for 70ms, then springs to the size of what it
// shows next (the dock, close in size to the tabs, skips the squeeze). The old content shrinks to 80% and blurs out as
// it squeezes; the new content cascades in, rising and sharpening, as the shell opens. The shell springs, so a quick
// open-close turns around from where it is.
// A tab bar is tapped all day: the whole morph settles in under 400ms.
const squeeze = { duration: 0.07, ease: [0.4, 0, 0.2, 1] } as const;
const opening = { type: 'spring', duration: 0.3, bounce: 0.2 } as const;
const closing = { type: 'spring', duration: 0.28, bounce: 0.12 } as const;
const leave = { opacity: 0, scale: 0.8, filter: 'blur(8px)' } as const;
const rest = { opacity: 1, scale: 1, filter: 'blur(0px)' } as const;
const leaveTransition: Transition = { duration: 0.1 };
const returnTransition: Transition = { duration: 0.18, delay: 0.05, ease: 'easeOut' };
/**
 * How each layer's items cascade in (ms). The panel's rows wait for the squeeze and rise, with a little overshoot,
 * into a shell growing several rows tall. The dock swaps with the tabs at the same height and about the same width: no
 * squeeze, and its buttons start with the shell, rising a little on `ease-enter`. A docked bar that replaces another
 * cascades in the same way.
 */
const cascade = {
  panel: { y: 24, blur: 2, delay: 90, step: 15, duration: 260, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)' },
  dock: { y: 8, blur: 2, delay: 0, step: 15, duration: 250, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
} as const;
/**
 * Between the panel's pages (a `BottomNavMoreGroup` opened, Back), as a `DrawerStack`: the rows that leave blur out
 * toward the side they go, the next page's cascade in from the other, and the shell springs to its height
 * (`useFitShell`'s `resizing`). Deeper comes from the right.
 */
const pageLeave = { x: 16, blur: 2, duration: 120, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' } as const;
const pageEnter = {
  x: 24,
  blur: 4,
  delay: 40,
  step: 20,
  duration: 300,
  easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
} as const;
/** The tabs coming back from the dock: at once, as the shell springs. */
const dockReturnTransition: Transition = { duration: 0.2, ease: 'easeOut' };

/**
 * The app navigation on a phone, floating over the page on the popup surface: a bar of icon tabs (`BottomNavList`)
 * in the middle and an optional main action (`BottomNavAction`) at the end. Hidden from `md` up, where the `Sidebar`
 * takes over. `fixed` to the viewport; give the scrolling panel `pb-24` below `md` so the last content clears it. Pads
 * for the home indicator (`env(safe-area-inset-bottom)`, needs `viewport-fit=cover`). The bar's shell morphs to what it
 * shows: the tabs, the "More" panel (`BottomNavMore`), or, under a `BottomNavProvider`, a page's open `ActionBar`.
 * Its corner is `--bottom-nav-radius`, capped at half the bar's height: `9999px` makes a pill. What sits in it follows,
 * concentric (`rounded-inner`): the tabs, the panel's rows, a docked bar's buttons.
 */
function BottomNav({ className, ...props }: React.ComponentProps<'div'>) {
  const nav = useBottomNavDock();
  const docked = nav !== null && nav.dock !== null && nav.top !== null;
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [panel, setPanel] = React.useState<HTMLElement | null>(null);
  const panelId = React.useId();
  const [panelPath, setPanelPath] = React.useState<readonly string[]>([]);
  const [optimisticCurrent, setOptimisticCurrent] = React.useState<string | null>(null);
  // A docked bar wins: selecting closes the panel.
  React.useEffect(() => {
    if (docked) setPanelOpen(false);
  }, [docked]);
  const view: View = docked ? 'dock' : panelOpen ? 'panel' : 'tabs';

  return (
    <BarContext
      value={{
        view,
        panelOpen,
        setPanelOpen,
        panel,
        setPanel,
        panelId,
        panelPath,
        setPanelPath,
        optimisticCurrent,
        setOptimisticCurrent,
      }}>
      <div
        data-slot='bottom-nav'
        className={cn(
          // One cell: the bar centered, the action at the end, both on the bottom edge so the bar grows upward.
          // `@container`: a docked bar answers its container queries from the nav's width, not the page's.
          '@container pointer-events-none fixed inset-x-0 bottom-0 z-30 grid items-end px-4 pb-[max(--spacing(4),env(safe-area-inset-bottom))] md:hidden',
          className,
        )}
        {...props}
      />
    </BarContext>
  );
}

/**
 * The bar: a popup shell holding three layers, the `<nav>` of 3–5 tabs, the "More" panel and the
 * dock. The shell takes the size of the layer that shows and morphs between them. A fill slides to the current tab.
 * Escape, a tap outside or focus leaving closes the panel. The panel scrolls past `100dvh - 6rem` with no scrollbar.
 *
 * `labels`: each tab shows its label under the icon (`--bottom-nav-tab-width` × `--bottom-nav-tab-height`) and the
 * fill springs to the current tab. Tabs shrink to fit 4–5 on a phone. A docked `ActionBar` takes the tabs' box, so
 * docking morphs only the content. For an app whose tabs are not recognisable by icon alone.
 *
 * `fill`: the bar spans the `BottomNav`'s width, its edges in line with the page's content; the tabs share it evenly.
 */
function BottomNavList({
  className,
  children,
  labels = false,
  fill = false,
  'aria-label': ariaLabelProp,
  ...props
}: React.ComponentProps<'nav'> & { labels?: boolean; fill?: boolean }) {
  const ariaLabel = ariaLabelProp ?? useLocale().labels.mainNavigation;
  const {
    view,
    panelOpen,
    setPanelOpen,
    panel,
    setPanel,
    panelId,
    panelPath,
    setPanelPath,
    optimisticCurrent,
    setOptimisticCurrent,
  } = useBar('BottomNavList');
  // The panel's page that shows, and how deep it is: a deeper one comes in from the right.
  const panelPage = view === 'panel' ? (panelPath.at(-1) ?? ROOT_PAGE) : null;
  const depth = panelPath.length;
  const nav = useBottomNavDock();
  const setDock = nav?.setDock;
  // The docked bar: a new one while docked swaps in without the morph.
  const dockedBar = view === 'dock' ? (nav?.top ?? null) : null;
  const reduced = useReducedMotion() ?? false;
  const shellRef = React.useRef<HTMLDivElement>(null);
  const [tabs, setTabs] = React.useState<HTMLElement | null>(null);
  const [dock, setDockLayer] = React.useState<HTMLDivElement | null>(null);
  const previous = React.useRef<{ view: View; bar: string | null; page: string | null; depth: number }>({
    view: 'tabs',
    bar: null,
    page: null,
    depth: 0,
  });
  const morphing = React.useRef(false);
  const refit = React.useRef<() => void>(() => {});

  // The tapped tab gives way once the page sets `aria-current`, on it or, after a redirect, on another tab.
  React.useEffect(() => {
    const shell = shellRef.current;
    if (optimisticCurrent === null || shell === null) return;
    const observer = new MutationObserver(() => setOptimisticCurrent(null));
    observer.observe(shell, { subtree: true, attributes: true, attributeFilter: ['aria-current', 'data-current'] });
    return () => observer.disconnect();
  }, [optimisticCurrent, setOptimisticCurrent]);

  // The dock is offered only while the bar shows: under `md:hidden` the shell has no size.
  React.useEffect(() => {
    const shell = shellRef.current;
    if (shell === null || dock === null || setDock === undefined) return;
    const observer = new ResizeObserver(() => setDock(shell.offsetWidth > 0 ? dock : null));
    observer.observe(shell);
    return () => {
      observer.disconnect();
      setDock(null);
    };
  }, [dock, setDock]);

  // An open panel closes on a tap outside the shell, and on Escape wherever focus is: a tap on "More" leaves focus on
  // the trigger, which goes inert as the panel opens, so the key may never reach the shell. In a group, Escape goes
  // back a page first.
  React.useEffect(() => {
    if (!panelOpen) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !shellRef.current?.contains(event.target)) setPanelOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (panelPath.length > 0) {
        backFrom(panelPath, setPanelPath, shellRef.current);
        return;
      }
      setPanelOpen(false);
      // Next frame: the tabs are inert until the close commits.
      requestAnimationFrame(() =>
        shellRef.current?.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(panelId)}"]`)?.focus(),
      );
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [panelOpen, setPanelOpen, panelId, panelPath, setPanelPath]);

  // The morph between layers. Before `useFitShell`: it pauses the fit while the shell morphs.
  React.useLayoutEffect(() => {
    const shell = shellRef.current;
    const layers = { tabs, panel, dock };
    if (shell === null || layers.tabs === null || layers.panel === null || layers.dock === null) return;
    const from = previous.current;
    previous.current = { view, bar: dockedBar, page: panelPage, depth };
    const shown = layers[view]!;
    const hidden = (Object.keys(layers) as View[]).filter((key) => key !== view).map((key) => layers[key]!);
    // The layer whose size the shell takes: with labels a docked bar fills the tabs' box, so the shell sizes to them.
    const sizedBy = view === 'dock' && labels ? layers.tabs : shown;

    let cancelled = false;
    const running: Array<{ stop: () => void }> = [];
    const track = <T extends { stop: () => void }>(animation: T) => (running.push(animation), animation);
    const cleanup = () => {
      cancelled = true;
      morphing.current = false;
      layers.panel!.style.overflowY = '';
      for (const animation of running) animation.stop();
    };
    // The layer's items rise in one after another, blurred, as the shell opens: the panel's rows, or the docked
    // toolbar's row (not one on its way out). Plain Web Animations, not Motion: `fill: 'backwards'` holds the start
    // through the stagger, and when one ends the item is simply its own style again. Motion swaps its finished
    // animation for inline styles a frame apart, which flickers as the buttons settle; and inline styles would set off
    // a `Button`'s own transitions.
    const cascadeIn = (kind: 'panel' | 'dock') => {
      const row = shown.querySelector(
        '[data-slot=action-bar]:not([data-exiting]) [data-slot=action-bar-content]:not([data-exiting])',
      );
      const items = rowsOf(kind === 'panel' ? activePage(shown) : row);
      const { y, blur, delay, step, duration, easing } = cascade[kind];
      for (const [index, item] of items.entries()) {
        const rise = item.animate(
          [
            { opacity: 0, transform: `translateY(${y}px)`, filter: `blur(${blur}px)` },
            { opacity: 1, transform: 'none', filter: 'none' },
          ],
          { duration, delay: delay + index * step, easing, fill: 'backwards' },
        );
        running.push({ stop: () => rise.cancel() });
      }
    };

    if (from.view === view && view === 'panel' && from.page !== panelPage) {
      // Another page of the panel: the shell springs to it (`useFitShell`); the old page's rows blur out over it.
      layers.panel.scrollTop = 0;
      const outgoing = from.page === null ? null : pageOf(layers.panel, from.page);
      const incoming = activePage(layers.panel);
      if (reduced || incoming === null) return;
      const side = depth > from.depth ? 1 : -1;
      if (outgoing !== null) {
        // Hidden by now: shown again, out of the flow, until its rows are gone.
        Object.assign(outgoing.style, { display: 'flex', position: 'absolute', inset: '0 0 auto 0' });
        outgoing.inert = true;
        const { x, blur, duration, easing } = pageLeave;
        const out = rowsOf(outgoing).map((row) =>
          row.animate(
            [
              { opacity: 1, transform: 'none', filter: 'none' },
              { opacity: 0, transform: `translateX(${-x * side}px)`, filter: `blur(${blur}px)` },
            ],
            { duration, easing, fill: 'forwards' },
          ),
        );
        const reset = () => {
          for (const animation of out) animation.cancel();
          Object.assign(outgoing.style, { display: '', position: '', inset: '' });
          outgoing.inert = false;
        };
        const timer = setTimeout(reset, duration);
        running.push({
          stop: () => {
            clearTimeout(timer);
            reset();
          },
        });
      }
      const { x, blur, delay, step, duration, easing } = pageEnter;
      for (const [index, row] of rowsOf(incoming).entries()) {
        const enter = row.animate(
          [
            { opacity: 0, transform: `translateX(${x * side}px)`, filter: `blur(${blur}px)` },
            { opacity: 1, transform: 'none', filter: 'none' },
          ],
          { duration, delay: delay + index * step, easing, fill: 'backwards' },
        );
        running.push({ stop: () => enter.cancel() });
      }
      return cleanup;
    }
    if (from.view === view && view === 'dock' && from.bar !== dockedBar) {
      // Another bar docked in place of the last: its items cascade in, the shell springs to it from where it is (a
      // morph this cut short included).
      refit.current();
      if (!reduced) cascadeIn('dock');
      return cleanup;
    }
    if (from.view === view) {
      for (const layer of hidden) animate(layer, { opacity: 0 }, { duration: 0 });
      animate(shown, { opacity: 1 }, { duration: 0 });
      return;
    }
    if (reduced) {
      // No squeeze, no blur, no cascade: the layers fade, the fit jumps.
      for (const layer of hidden) animate(layer, { opacity: 0 }, { duration: 0.15 });
      animate(shown, { opacity: 1 }, { duration: 0.15 });
      return;
    }

    morphing.current = true;
    // Rows rising from below would make the panel scrollable mid-morph; it scrolls once they land.
    layers.panel.style.overflowY = 'hidden';
    const start = { width: shell.offsetWidth, height: shell.offsetHeight };
    Object.assign(shell.style, { width: `${start.width}px`, height: `${start.height}px` });

    // Explicit keyframes throughout: Motion remembers the values it last animated on an element, and the inline styles
    // set here and by `useFitShell` happen behind its back.
    const docking = from.view === 'dock' || view === 'dock';
    const spring = () => {
      const target = {
        width: [shell.offsetWidth, sizedBy.offsetWidth],
        height: [shell.offsetHeight, sizedBy.offsetHeight],
      };
      void track(animate(shell, target, view === 'tabs' ? closing : opening)).then(() => {
        if (cancelled) return;
        morphing.current = false;
        layers.panel!.style.overflowY = '';
        // The layer may have changed size during the morph.
        refit.current();
      });
    };
    if (docking) spring();
    else {
      const squeezed = { width: Math.min(start.width * 0.75, 200), height: 32 };
      void track(
        animate(shell, { width: [start.width, squeezed.width], height: [start.height, squeezed.height] }, squeeze),
      ).then(() => {
        if (!cancelled) spring();
      });
    }

    for (const layer of hidden) track(animate(layer, leave, leaveTransition));
    if (view === 'tabs') track(animate(shown, rest, docking ? dockReturnTransition : returnTransition));
    else {
      // The layer shows at once; its items cascade in.
      track(animate(shown, rest, { duration: 0 }));
      cascadeIn(view);
    }
    return cleanup;
  }, [view, dockedBar, panelPage, depth, labels, reduced, tabs, panel, dock]);

  // The shell holds the size of the layer that shows, between morphs too: a tab added, a docked count growing a
  // digit, a docked bar swapped for another. With labels a docked bar takes the tabs' box.
  useFitShell(shellRef, view === 'panel' ? panel : view === 'dock' && !labels ? dock : tabs, {
    reduced,
    paused: morphing,
    refit,
  });

  return (
    <div
      ref={shellRef}
      data-slot='bottom-nav-shell'
      data-surface='popup'
      data-view={view}
      // The outer corner for every layer (`bar-corners`): the tabs sit `popup-inset` in, the panel's pages
      // `--spacing-list-inset`, a docked bar what brings its buttons to the bar's height.
      className={cn(
        'pointer-events-auto relative col-start-1 row-start-1 flex items-end justify-center justify-self-center overflow-hidden bg-popover text-popover-foreground shadow-popup bar-corners',
        labels && 'max-w-full [--bar-height:calc(var(--bottom-nav-tab-height)+2*var(--spacing-popup-inset))]',
      )}
      onBlur={(event) => {
        const to = event.relatedTarget;
        // Safari doesn't focus a clicked button: focus goes to the nearest focusable ancestor (a `main tabindex=-1`).
        // That is a click in the shell, not focus leaving it.
        if (!panelOpen || !(to instanceof Node) || event.currentTarget.contains(to) || to.contains(event.currentTarget))
          return;
        setPanelOpen(false);
      }}>
      <nav
        ref={setTabs}
        data-slot='bottom-nav-list'
        aria-label={ariaLabel}
        inert={view !== 'tabs'}
        data-labels={labels || undefined}
        data-fill={fill || undefined}
        data-optimistic={optimisticCurrent !== null || undefined}
        className={cn(
          'group/bottom-nav relative flex w-max shrink-0 origin-bottom items-center gap-related p-popup-inset [--outer-inset:var(--spacing-popup-inset)]',
          // Capped by the `BottomNav`'s width (`cqw`), not the shell's: the morph back from the panel measures the tabs
          // while the shell still has the panel's width.
          labels && 'max-w-[100cqw] gap-0',
          fill && 'w-[100cqw]',
          className,
        )}
        {...props}>
        <CurrentIndicator />
        {children}
      </nav>
      <div
        ref={setPanel}
        id={panelId}
        data-slot='bottom-nav-panel'
        inert={view !== 'panel'}
        style={{ opacity: 0 }}
        className='absolute top-0 left-1/2 flex no-scrollbar max-h-[calc(100dvh-6rem)] w-[min(17rem,calc(100vw-2rem))] origin-bottom -translate-x-1/2 flex-col overflow-y-auto overscroll-contain [--outer-inset:var(--spacing-list-inset)]'
      />
      <div
        ref={setDockLayer}
        data-slot='bottom-nav-dock'
        inert={view !== 'dock'}
        style={{ opacity: 0 }}
        className={cn(
          'absolute origin-bottom',
          labels ? 'inset-0' : 'bottom-0 left-1/2 w-max -translate-x-1/2',
          // With labels, a docked bar fills the tabs' box: `--bottom-nav-action-height` buttons, the rest of the height
          // an even inset on every side, `rounded-inner` corners. What leads the row (a status) sits at the start, the
          // buttons at the end; a row of one (a status that replaced them) centers, on both axes: it is lower than the
          // buttons, so the bar fills the box.
          labels && [
            '[&_[data-slot=action-bar]]:size-full',
            '[&_[data-slot=action-bar]]:[--outer-inset:calc((var(--bottom-nav-tab-height)+2*var(--spacing-popup-inset)-var(--bottom-nav-action-height))/2)]',
            '[&_[data-slot=action-bar-content]]:w-full [&_[data-slot=action-bar-content]]:justify-center [&_[data-slot=action-bar-content]>:first-child:not(:only-child)]:me-auto',
            '[&_[data-slot=action-bar-content]>[data-slot=button]]:h-(--bottom-nav-action-height)',
          ],
        )}
      />
    </div>
  );
}

/**
 * The fill under the current tab. It follows the tab just tapped (`data-optimistic-current`), else `aria-current` /
 * `data-current` in the DOM, so a router link that sets `aria-current` itself moves it too. Slides with `duration-move`,
 * as the tabs indicator does; jumps on mount.
 */
function CurrentIndicator() {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [animate, setAnimate] = React.useState(false);

  React.useLayoutEffect(() => {
    const indicator = ref.current;
    const list = indicator?.parentElement;
    if (indicator === null || list === null || list === undefined) return;
    const measure = () => {
      const current =
        list.querySelector<HTMLElement>('[data-optimistic-current]') ??
        list.querySelector<HTMLElement>('[aria-current=page], [data-current]');
      setVisible(current !== null);
      if (current === null) return;
      indicator.style.setProperty('--current-left', `${current.offsetLeft}px`);
      indicator.style.setProperty('--current-width', `${current.offsetWidth}px`);
      indicator.style.setProperty('--current-height', `${current.offsetHeight}px`);
    };
    measure();
    const frame = requestAnimationFrame(() => setAnimate(true));
    const resize = new ResizeObserver(measure);
    resize.observe(list);
    // Each tab too: labelled tabs shrink as a late web font widens their neighbours.
    for (const child of list.children) resize.observe(child);
    const mutation = new MutationObserver(measure);
    mutation.observe(list, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-current', 'data-current', 'data-optimistic-current'],
    });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      data-slot='bottom-nav-indicator'
      className={cn(
        'pointer-events-none absolute top-popup-inset left-0 h-(--current-height,var(--spacing-control-lg)) w-(--current-width,var(--spacing-control-lg)) translate-x-(--current-left) rounded-inner bg-foreground/10 transition-[translate,width] duration-move ease-move motion-reduce:transition-none',
        // No text rides it, so it may overshoot.
        'group-data-labels/bottom-nav:bg-foreground/12 group-data-labels/bottom-nav:duration-indicator group-data-labels/bottom-nav:ease-spring-bounce',
        !animate && 'transition-none',
        !visible && 'invisible',
      )}
    />
  );
}

/**
 * A tab: a `control-lg` square with an `icon-lg` icon (`hit-area` makes it 44px to a finger), `popup-inset` in from the
 * shell with `rounded-inner` corners; the bar (`control-lg` + 2 × `popup-inset`) is the height of a docked `ActionBar`
 * and of the main action. The label is a `<span>` after the icon, read by screen readers only. A count is a
 * `Badge size='sm' shape='pill'` after the label, pinned to the icon's top-right corner, at least as wide as it is high.
 */
const bottomNavItemClassName = cn(
  'hit-area relative flex size-control-lg shrink-0 items-center justify-center rounded-inner text-muted-foreground outline-hidden select-none',
  'transition-[color,scale] duration-feedback hover:text-foreground active:scale-[0.92] focus-visible:ring-3 focus-visible:ring-ring/24 motion-reduce:active:scale-100',
  '[&>svg]:pointer-events-none [&>svg]:size-icon-lg [&>svg]:shrink-0 [&>span:not([data-slot=badge])]:sr-only',
  '[&>[data-slot=badge]]:absolute [&>[data-slot=badge]]:top-0.5 [&>[data-slot=badge]]:left-[calc(50%+4px)] [&>[data-slot=badge]]:min-w-(--badge-height-sm) [&>[data-slot=badge]]:tabular-nums',
  'group-data-fill/bottom-nav:grow',
  // `labels`: the label under the icon, the tab shrinking to fit; the badge on the icon's corner, ringed in the bar.
  'group-data-labels/bottom-nav:h-(--bottom-nav-tab-height) group-data-labels/bottom-nav:w-(--bottom-nav-tab-width) group-data-labels/bottom-nav:min-w-0 group-data-labels/bottom-nav:shrink group-data-labels/bottom-nav:flex-col group-data-labels/bottom-nav:gap-0.5',
  'group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:not-sr-only group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:max-w-full group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:truncate group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:px-tight group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:text-caption group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:font-medium',
  'group-data-labels/bottom-nav:[&>[data-slot=badge]]:top-1 group-data-labels/bottom-nav:[&>[data-slot=badge]]:left-[calc(50%+6px)] group-data-labels/bottom-nav:[&>[data-slot=badge]]:ring-2 group-data-labels/bottom-nav:[&>[data-slot=badge]]:ring-popover',
  // While a tapped tab waits for its page, it alone looks current.
  'group-not-data-optimistic/bottom-nav:aria-[current=page]:text-foreground group-not-data-optimistic/bottom-nav:data-current:text-foreground data-optimistic-current:text-foreground',
  'disabled:pointer-events-none disabled:text-disabled-foreground aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
);

/**
 * A tab that links: an `<a>`, or the router's link through `render` (`render={<NavLink to='…' end />}`). `current`
 * marks the page; a router link that sets `aria-current` itself needs none. Looks current from the tap on, before
 * the page it opens renders.
 */
function BottomNavLink({
  className,
  render,
  current,
  ...props
}: useRender.ComponentProps<'a'> & { current?: boolean }) {
  const { isOptimisticCurrent, onTap } = useOptimisticCurrent('BottomNavLink', React.useId());
  const linkRender = useLinkRender(render);
  return useRender({
    defaultTagName: 'a',
    render: linkRender,
    state: { slot: 'bottom-nav-link' },
    props: mergeProps<'a'>(
      {
        'aria-current': current ? 'page' : undefined,
        ...(isOptimisticCurrent && { 'data-optimistic-current': '' }),
        className: cn(bottomNavItemClassName, className),
        onClick: onTap,
      },
      props,
    ),
  });
}

/**
 * A tab that opens something instead of navigating, as a `DropdownMenuTrigger` (`render={<BottomNavButton />}`) or
 * with `onClick={toggleSidebar}` for the sidebar sheet. `current` marks it while the page is one of the links it holds.
 * For the rest of the links, `BottomNavMore` morphs the bar into a list instead.
 */
function BottomNavButton({
  className,
  render,
  current,
  ...props
}: useRender.ComponentProps<'button'> & { current?: boolean }) {
  return useRender({
    defaultTagName: 'button',
    render,
    // A button can't be `aria-current='page'`; the state renders `data-current` for the same look.
    state: { slot: 'bottom-nav-button', current: current ?? false },
    props: mergeProps<'button'>({ type: 'button', className: cn(bottomNavItemClassName, className) }, props),
  });
}

/**
 * The "More" tab: an ellipsis that morphs the bar into a list of the links that don't fit, its children:
 * `BottomNavMoreItem`s, and `BottomNavMoreGroup`s that open a page of their own. It reads as current while its list
 * holds the page. It opens on the list, focus on its first row; Escape goes back a page, then closes it and returns
 * focus here.
 */
function BottomNavMore({
  label: labelProp,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const label = labelProp ?? useLocale().labels.more;
  const { panelOpen, setPanelOpen, setPanelPath, panel, panelId, optimisticCurrent } = useBar('BottomNavMore');
  const tab = React.useId();
  const holdsCurrent = useHoldsCurrent(panel);

  return (
    <>
      <BottomNavButton
        current={holdsCurrent}
        data-optimistic-current={optimisticCurrent === tab ? '' : undefined}
        aria-expanded={panelOpen}
        aria-controls={panelId}
        className={className}
        onClick={(event) => {
          if (!panelOpen) setPanelPath([]);
          setPanelOpen(!panelOpen);
          // A keyboard click (`detail` 0): focus the first row once the panel is no longer inert.
          if (event.detail === 0)
            requestAnimationFrame(() => {
              const page = panel === null ? null : activePage(panel);
              page?.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
            });
        }}>
        <IconDots />
        <span>{label}</span>
      </BottomNavButton>
      {panel !== null &&
        createPortal(
          <MoreTabContext value={tab}>
            <PanelPage id={ROOT_PAGE}>{children}</PanelPage>
          </MoreTabContext>,
          panel,
        )}
    </>
  );
}

/**
 * A page of the panel: the "More" list, or a group's. Only the page at the end of the path shows, in the flow, so the
 * shell takes its size.
 */
function PanelPage({
  id,
  label,
  ref,
  children,
}: {
  id: string;
  label?: string;
  ref?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}) {
  const { panelPath } = useBar('BottomNavMore');
  const active = (panelPath.at(-1) ?? ROOT_PAGE) === id;
  return (
    <div
      ref={ref}
      id={id === ROOT_PAGE ? undefined : id}
      role={label === undefined ? undefined : 'group'}
      aria-label={label}
      data-slot='bottom-nav-panel-page'
      data-page={id}
      data-active={active || undefined}
      className='flex w-full flex-col p-list-inset not-data-active:hidden'>
      {children}
    </div>
  );
}

/**
 * A row of the panel: `--spacing-list-inset` in from the shell, with `rounded-inner` corners, at least 44px high, a
 * finger's target. The icon is muted until its row is current.
 */
const moreRowClassName = cn(
  'flex min-h-11 w-full shrink-0 items-center gap-(--bottom-nav-gap) rounded-inner px-row-pad-x py-row-pad-y text-start text-control font-medium text-popover-foreground outline-hidden select-none',
  'transition-[background-color,scale] duration-feedback hover:bg-highlight active:scale-[0.96] focus-visible:ring-3 focus-visible:ring-ring/24 motion-reduce:active:scale-100',
  '[&>svg]:pointer-events-none [&>svg]:size-icon-lg [&>svg]:shrink-0 [&>svg]:text-muted-foreground [&>span]:truncate',
  'aria-[current=page]:bg-foreground/10 aria-[current]:[&>svg]:text-foreground',
);

/**
 * A row in the "More" list or a group: an icon and its label, an `<a>` or the router's link through `render`.
 * `current` marks the page. Closes the panel when chosen; the "More" tab looks current from the tap on.
 */
function BottomNavMoreItem({
  className,
  render,
  current,
  ...props
}: useRender.ComponentProps<'a'> & { current?: boolean }) {
  const { setPanelOpen } = useBar('BottomNavMoreItem');
  const moreTab = React.use(MoreTabContext);
  if (moreTab === null) throw new Error('BottomNavMoreItem must be used within a BottomNavMore.');
  const { onTap } = useOptimisticCurrent('BottomNavMoreItem', moreTab);
  const linkRender = useLinkRender(render);
  return useRender({
    defaultTagName: 'a',
    render: linkRender,
    state: { slot: 'bottom-nav-more-item' },
    props: mergeProps<'a'>(
      {
        'aria-current': current ? 'page' : undefined,
        className: cn(moreRowClassName, className),
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          onTap(event);
          setPanelOpen(false);
        },
      },
      props,
    ),
  });
}

/**
 * A row in the "More" list or a group that opens a page of its own: its children (`BottomNavMoreItem`s, more
 * `BottomNavMoreGroup`s, nested as deep as needed) under a Back row. The bar springs to the page's height; its rows
 * come in from the right, and from the left on the way back. Focus moves to Back, and returns to this row. Reads as
 * current (`aria-current='true'`, its icon in the text color) while its page holds the page.
 */
function BottomNavMoreGroup({
  label,
  icon,
  backLabel: backLabelProp,
  className,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  backLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const backLabel = backLabelProp ?? useLocale().labels.back;
  const { panel, panelPath, setPanelPath } = useBar('BottomNavMoreGroup');
  const id = React.useId();
  const [page, setPage] = React.useState<HTMLDivElement | null>(null);
  const holdsCurrent = useHoldsCurrent(page);

  return (
    <>
      <button
        type='button'
        data-slot='bottom-nav-more-group'
        aria-expanded={panelPath.at(-1) === id}
        aria-controls={id}
        aria-current={holdsCurrent ? 'true' : undefined}
        className={cn(moreRowClassName, className)}
        onClick={() => {
          setPanelPath([...panelPath, id]);
          requestAnimationFrame(() => page?.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true }));
        }}>
        {icon}
        <span>{label}</span>
        <IconChevronRight className='ms-auto size-icon! opacity-60' />
      </button>
      {panel !== null &&
        createPortal(
          <PanelPage ref={setPage} id={id} label={label}>
            <button
              type='button'
              data-slot='bottom-nav-more-back'
              className={moreRowClassName}
              onClick={(event) =>
                backFrom(panelPath, setPanelPath, event.currentTarget.closest('[data-slot=bottom-nav-shell]'))
              }>
              <IconArrowLeft />
              <span>{backLabel}</span>
            </button>
            {children}
          </PanelPage>,
          panel,
        )}
    </>
  );
}

/**
 * The one main action beside the bar (create): a square as high as the bar, a popup, a `<button>` or a link through
 * `render`. Icon only, so it needs an `aria-label`. Steps aside while the bar shows the panel or a docked bar.
 */
function BottomNavAction({ className, render, ...props }: useRender.ComponentProps<'button'>) {
  const { view } = useBar('BottomNavAction');
  const reduced = useReducedMotion() ?? false;
  const away = view !== 'tabs';
  const button = useRender({
    defaultTagName: 'button',
    render,
    state: { slot: 'bottom-nav-action' },
    props: mergeProps<'button'>(
      {
        type: 'button',
        className: cn(
          'relative flex size-[calc(var(--spacing-control-lg)+2*var(--spacing-popup-inset))] items-center justify-center bar-corners bg-popover text-popover-foreground shadow-popup outline-hidden select-none',
          'transition-[scale] duration-feedback active:scale-[0.92] focus-visible:ring-3 focus-visible:ring-ring/24 motion-reduce:active:scale-100',
          '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-icon-lg',
          className,
        ),
      },
      props,
    ),
  });
  return (
    <LazyMotion features={loadMotionFeatures}>
      <m.div
        className='pointer-events-auto col-start-1 row-start-1 origin-bottom justify-self-end'
        initial={false}
        animate={away ? (reduced ? { opacity: 0 } : leave) : rest}
        // Back at once, with the shell, rather than after the tabs.
        transition={away ? leaveTransition : dockReturnTransition}
        inert={away}>
        {button}
      </m.div>
    </LazyMotion>
  );
}

export {
  BottomNav,
  BottomNavAction,
  BottomNavButton,
  BottomNavLink,
  BottomNavList,
  BottomNavMore,
  BottomNavMoreGroup,
  BottomNavMoreItem,
  BottomNavProvider,
  useBottomNavDock,
  useFitShell,
};
