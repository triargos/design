import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { animate, motion, type Transition, useReducedMotion } from 'framer-motion';
import { IconDots } from '@tabler/icons-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

type BottomNavContextValue = {
  /** The layer in the nav's shell where an open `ActionBar` docks, while the nav shows (below `md`). */
  readonly dock: HTMLElement | null;
  readonly setDock: (dock: HTMLElement | null) => void;
  /** An `ActionBar` sits in the dock: the shell morphs to it, the tabs and the main action step aside. */
  readonly docked: boolean;
  readonly setDocked: (docked: boolean) => void;
};

const BottomNavContext = React.createContext<BottomNavContextValue | null>(null);

/** For `ActionBar`: the dock, or `null` without a provider or while the nav is hidden. */
function useBottomNavDock() {
  return React.use(BottomNavContext);
}

/**
 * Around the app shell, so a page's `ActionBar` can take the nav's place on a phone. A `BottomNav` works without it;
 * its action bars then stay in the page.
 */
function BottomNavProvider({ children }: { children: React.ReactNode }) {
  const [dock, setDock] = React.useState<HTMLElement | null>(null);
  const [docked, setDocked] = React.useState(false);
  return <BottomNavContext value={{ dock, setDock, docked, setDocked }}>{children}</BottomNavContext>;
}

/** What the shell shows: the tabs, the "More" panel, or a docked `ActionBar`. */
type View = 'tabs' | 'panel' | 'dock';

type BarContextValue = {
  readonly view: View;
  readonly panelOpen: boolean;
  readonly setPanelOpen: (open: boolean) => void;
  /** The panel layer, where `BottomNavMore` puts its items. */
  readonly panel: HTMLElement | null;
  readonly setPanel: (panel: HTMLElement | null) => void;
  readonly panelId: string;
};

const BarContext = React.createContext<BarContextValue | null>(null);

function useBar(part: string) {
  const bar = React.use(BarContext);
  if (bar === null) throw new Error(`${part} must be used within a BottomNav.`);
  return bar;
}

// The morph, after Danny Williams's morphing menu: the shell squeezes for 100ms, then springs to the size of what it
// shows next (the dock, close in size to the tabs, skips the squeeze). The old content shrinks to 80% and blurs out as
// it squeezes; the new content cascades in, rising and sharpening, as the shell opens. The shell springs, so a quick
// open-close turns around from where it is.
const squeeze = { duration: 0.1, ease: [0.4, 0, 0.2, 1] } as const;
const opening = { type: 'spring', duration: 0.4, bounce: 0.24 } as const;
const closing = { type: 'spring', duration: 0.4, bounce: 0.15 } as const;
const resizing = { type: 'spring', duration: 0.25, bounce: 0 } as const;
const leave = { opacity: 0, scale: 0.8, filter: 'blur(8px)' } as const;
const rest = { opacity: 1, scale: 1, filter: 'blur(0px)' } as const;
const leaveTransition: Transition = { duration: 0.15 };
const returnTransition: Transition = { duration: 0.22, delay: 0.08, ease: 'easeOut' };
/**
 * How each layer's items cascade in (ms). The panel's rows wait for the squeeze and rise far, with a little overshoot,
 * into a shell growing several rows tall. The dock swaps with the tabs at the same height and about the same width: no
 * squeeze, and its buttons start with the shell, rising a little on `ease-enter`.
 */
const cascade = {
  panel: { y: 48, blur: 4, delay: 200, step: 20, duration: 400, easing: 'cubic-bezier(0.34, 1.3, 0.64, 1)' },
  dock: { y: 8, blur: 2, delay: 0, step: 15, duration: 250, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
} as const;
/** The tabs coming back from the dock: at once, as the shell springs. */
const dockReturnTransition: Transition = { duration: 0.2, ease: 'easeOut' };

/**
 * The app navigation on a phone, floating over the page on the popup surface: a bar of icon tabs (`BottomNavList`)
 * in the middle and an optional main action (`BottomNavAction`) at the end. Hidden from `md` up, where the `Sidebar`
 * takes over. `fixed` to the viewport; give the scrolling panel `pb-24` below `md` so the last content clears it. Pads
 * for the home indicator (`env(safe-area-inset-bottom)`, needs `viewport-fit=cover`). The bar's shell morphs to what it
 * shows: the tabs, the "More" panel (`BottomNavMore`), or, under a `BottomNavProvider`, a page's open `ActionBar`.
 */
function BottomNav({ className, ...props }: React.ComponentProps<'div'>) {
  const docked = useBottomNavDock()?.docked ?? false;
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [panel, setPanel] = React.useState<HTMLElement | null>(null);
  const panelId = React.useId();
  // A docked bar wins: selecting closes the panel.
  React.useEffect(() => {
    if (docked) setPanelOpen(false);
  }, [docked]);
  const view: View = docked ? 'dock' : panelOpen ? 'panel' : 'tabs';

  return (
    <BarContext value={{ view, panelOpen, setPanelOpen, panel, setPanel, panelId }}>
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
 */
function BottomNavList({
  className,
  children,
  labels = false,
  'aria-label': ariaLabelProp,
  ...props
}: React.ComponentProps<'nav'> & { labels?: boolean }) {
  const ariaLabel = ariaLabelProp ?? useLocale().labels.mainNavigation;
  const { view, panelOpen, setPanelOpen, setPanel, panelId } = useBar('BottomNavList');
  const setDock = useBottomNavDock()?.setDock;
  const reduced = useReducedMotion() ?? false;
  const shellRef = React.useRef<HTMLDivElement>(null);
  const tabsRef = React.useRef<HTMLElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const dockRef = React.useRef<HTMLDivElement>(null);
  const previous = React.useRef<View>('tabs');
  const morphing = React.useRef(false);

  React.useLayoutEffect(() => setPanel(panelRef.current), [setPanel]);

  // The dock is offered only while the bar shows: under `md:hidden` the shell has no size.
  React.useEffect(() => {
    const shell = shellRef.current;
    const dock = dockRef.current;
    if (shell === null || dock === null || setDock === undefined) return;
    const observer = new ResizeObserver(() => setDock(shell.offsetWidth > 0 ? dock : null));
    observer.observe(shell);
    return () => {
      observer.disconnect();
      setDock(null);
    };
  }, [setDock]);

  // An open panel closes on a tap outside the shell, and on Escape wherever focus is: a tap on "More" leaves focus on
  // the trigger, which goes inert as the panel opens, so the key may never reach the shell.
  React.useEffect(() => {
    if (!panelOpen) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !shellRef.current?.contains(event.target)) setPanelOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
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
  }, [panelOpen, setPanelOpen, panelId]);

  // A layer that changes size while it shows (a docked count grows a digit) resizes the shell without the squeeze.
  // With labels the dock has the tabs' box and never resizes the shell.
  React.useEffect(() => {
    const shell = shellRef.current;
    const layer = view === 'dock' && !labels ? dockRef.current : view === 'panel' ? panelRef.current : null;
    if (shell === null || layer === null) return;
    const observer = new ResizeObserver(() => {
      if (morphing.current || layer.offsetWidth === 0) return;
      const size = { width: layer.offsetWidth, height: layer.offsetHeight };
      if (reduced) Object.assign(shell.style, { width: `${size.width}px`, height: `${size.height}px` });
      else
        animate(shell, { width: [shell.offsetWidth, size.width], height: [shell.offsetHeight, size.height] }, resizing);
    });
    observer.observe(layer);
    return () => observer.disconnect();
  }, [view, labels, reduced]);

  React.useLayoutEffect(() => {
    const shell = shellRef.current;
    const layers = { tabs: tabsRef.current, panel: panelRef.current, dock: dockRef.current };
    if (shell === null || layers.tabs === null || layers.panel === null || layers.dock === null) return;
    const from = previous.current;
    previous.current = view;
    const shown = layers[view]!;
    const hidden = (Object.keys(layers) as View[]).filter((key) => key !== view).map((key) => layers[key]!);
    // The layer whose size the shell takes: with labels a docked bar fills the tabs' box, so the shell sizes to them.
    const sizedBy = view === 'dock' && labels ? layers.tabs : shown;
    // The items that cascade in: the panel's rows, or the items in the docked toolbar's row.
    const row = shown.querySelector('[data-slot=action-bar-content]:not([data-exiting])');
    const items = (view === 'panel' ? [...shown.children] : view === 'dock' ? [...(row?.children ?? [])] : []).filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    const fixSize = (size: { width: number; height: number }) =>
      Object.assign(shell.style, { width: `${size.width}px`, height: `${size.height}px` });

    if (from === view || reduced) {
      // Mount, or reduced motion: no squeeze, no blur, no cascade; the layers only fade.
      if (sizedBy === layers.tabs) Object.assign(shell.style, { width: '', height: '' });
      else fixSize({ width: shown.offsetWidth, height: shown.offsetHeight });
      const fade = { duration: from === view ? 0 : 0.15 };
      for (const layer of hidden) animate(layer, { opacity: 0 }, fade);
      animate(shown, { opacity: 1 }, fade);
      return;
    }

    let cancelled = false;
    const running: Array<{ stop: () => void }> = [];
    const track = <T extends { stop: () => void }>(animation: T) => (running.push(animation), animation);
    morphing.current = true;
    // Rows rising from 48px below would make the panel scrollable mid-morph; it scrolls once they land.
    layers.panel.style.overflowY = 'hidden';
    const start = { width: shell.offsetWidth, height: shell.offsetHeight };
    fixSize(start);

    // Explicit keyframes throughout: Motion remembers the values it last animated on an element, and the inline styles
    // set here (and the shell sizing itself on the tabs) happen behind its back.
    const docking = from === 'dock' || view === 'dock';
    const spring = () => {
      const target = {
        width: [shell.offsetWidth, sizedBy.offsetWidth],
        height: [shell.offsetHeight, sizedBy.offsetHeight],
      };
      void track(animate(shell, target, view === 'tabs' ? closing : opening)).then(() => {
        if (cancelled) return;
        morphing.current = false;
        layers.panel!.style.overflowY = '';
        // On the tabs' size, the shell sizes itself again.
        if (sizedBy === layers.tabs) Object.assign(shell.style, { width: '', height: '' });
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
    if (view === 'tabs') {
      track(animate(shown, rest, docking ? dockReturnTransition : returnTransition));
    } else {
      // The layer shows at once; its items rise in one after another, blurred, as the shell opens. Plain Web
      // Animations, not Motion: `fill: 'backwards'` holds the start through the stagger, and when one ends the item is
      // simply its own style again. Motion swaps its finished animation for inline styles a frame apart, which flickers
      // as the buttons settle; and inline styles would set off a `Button`'s own transitions.
      const { y, blur, delay, step, duration, easing } = cascade[view];
      track(animate(shown, rest, { duration: 0 }));
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
    }

    return () => {
      cancelled = true;
      morphing.current = false;
      layers.panel!.style.overflowY = '';
      for (const animation of running) animation.stop();
    };
  }, [view, labels, reduced]);

  return (
    <div
      ref={shellRef}
      data-slot='bottom-nav-shell'
      data-view={view}
      // The outer corner for every layer: the tabs sit `popup-inset` in, the "More" panel `--spacing-list-inset`.
      className={cn(
        'pointer-events-auto relative col-start-1 row-start-1 flex items-end justify-center justify-self-center overflow-hidden rounded-popup bg-popover text-popover-foreground shadow-popup [--outer-radius:var(--radius-popup)]',
        labels && 'max-w-full',
      )}
      onBlur={(event) => {
        if (panelOpen && event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget))
          setPanelOpen(false);
      }}>
      <nav
        ref={tabsRef}
        data-slot='bottom-nav-list'
        aria-label={ariaLabel}
        inert={view !== 'tabs'}
        data-labels={labels || undefined}
        className={cn(
          'group/bottom-nav relative flex w-max shrink-0 origin-bottom items-center gap-related p-popup-inset [--outer-inset:var(--spacing-popup-inset)]',
          // Capped by the `BottomNav`'s width (`cqw`), not the shell's: the morph back from the panel measures the tabs
          // while the shell still has the panel's width.
          labels && 'max-w-[100cqw] gap-0',
          className,
        )}
        {...props}>
        <CurrentIndicator />
        {children}
      </nav>
      <div
        ref={panelRef}
        id={panelId}
        data-slot='bottom-nav-panel'
        inert={view !== 'panel'}
        style={{ opacity: 0 }}
        className='absolute top-0 left-1/2 flex no-scrollbar max-h-[calc(100dvh-6rem)] w-[min(17rem,calc(100vw-2rem))] origin-bottom -translate-x-1/2 flex-col overflow-y-auto overscroll-contain p-list-inset [--outer-inset:var(--spacing-list-inset)]'
      />
      <div
        ref={dockRef}
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
 * The fill under the current tab. It follows `aria-current` / `data-current` in the DOM, so a router link that sets
 * `aria-current` itself moves it too. Slides with `duration-move`, as the tabs indicator does; jumps on mount.
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
      const current = list.querySelector<HTMLElement>('[aria-current=page], [data-current]');
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
    mutation.observe(list, { subtree: true, attributes: true, attributeFilter: ['aria-current', 'data-current'] });
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
  // `labels`: the label under the icon, the tab shrinking to fit; the badge on the icon's corner, ringed in the bar.
  // `muted-foreground` is set for the page, not the popup: as caption text it falls under 4.5:1 there.
  'group-data-labels/bottom-nav:text-[color-mix(in_oklab,var(--muted-foreground),var(--foreground)_15%)]',
  'group-data-labels/bottom-nav:h-(--bottom-nav-tab-height) group-data-labels/bottom-nav:w-(--bottom-nav-tab-width) group-data-labels/bottom-nav:min-w-0 group-data-labels/bottom-nav:shrink group-data-labels/bottom-nav:flex-col group-data-labels/bottom-nav:gap-0.5',
  'group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:not-sr-only group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:max-w-full group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:truncate group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:px-tight group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:text-caption group-data-labels/bottom-nav:[&>span:not([data-slot=badge])]:font-medium',
  'group-data-labels/bottom-nav:[&>[data-slot=badge]]:top-1 group-data-labels/bottom-nav:[&>[data-slot=badge]]:left-[calc(50%+6px)] group-data-labels/bottom-nav:[&>[data-slot=badge]]:ring-2 group-data-labels/bottom-nav:[&>[data-slot=badge]]:ring-popover',
  'aria-[current=page]:text-foreground data-current:text-foreground',
  'disabled:pointer-events-none disabled:text-disabled-foreground aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
);

/**
 * A tab that links: an `<a>`, or the router's link through `render` (`render={<NavLink to='…' end />}`). `current`
 * marks the page; a router link that sets `aria-current` itself needs none.
 */
function BottomNavLink({
  className,
  render,
  current,
  ...props
}: useRender.ComponentProps<'a'> & { current?: boolean }) {
  return useRender({
    defaultTagName: 'a',
    render,
    state: { slot: 'bottom-nav-link' },
    props: mergeProps<'a'>(
      { 'aria-current': current ? 'page' : undefined, className: cn(bottomNavItemClassName, className) },
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
 * The "More" tab: an ellipsis that morphs the bar into a list of the links that don't fit (`BottomNavMoreItem`s, its
 * children). It reads as current while its list holds the page. Opened from the keyboard, focus moves to the first row;
 * Escape returns it here.
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
  const { panelOpen, setPanelOpen, panel, panelId } = useBar('BottomNavMore');
  const [holdsCurrent, setHoldsCurrent] = React.useState(false);

  React.useEffect(() => {
    if (panel === null) return;
    const check = () => setHoldsCurrent(panel.querySelector('[aria-current=page]') !== null);
    check();
    const observer = new MutationObserver(check);
    observer.observe(panel, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-current'] });
    return () => observer.disconnect();
  }, [panel]);

  return (
    <>
      <BottomNavButton
        current={holdsCurrent}
        aria-expanded={panelOpen}
        aria-controls={panelId}
        className={className}
        onClick={(event) => {
          setPanelOpen(!panelOpen);
          // A keyboard click (`detail` 0): focus the first row once the panel is no longer inert.
          if (event.detail === 0)
            requestAnimationFrame(() => panel?.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true }));
        }}>
        <IconDots />
        <span>{label}</span>
      </BottomNavButton>
      {panel !== null && createPortal(children, panel)}
    </>
  );
}

/**
 * A row in the "More" list: an icon and its label, an `<a>` or the router's link through `render`. `current` marks the
 * page. `--spacing-list-inset` in from the shell, with `rounded-inner` corners. At least 44px high, a finger's
 * target. Closes the list when chosen.
 */
function BottomNavMoreItem({
  className,
  render,
  current,
  ...props
}: useRender.ComponentProps<'a'> & { current?: boolean }) {
  const { setPanelOpen } = useBar('BottomNavMoreItem');
  return useRender({
    defaultTagName: 'a',
    render,
    state: { slot: 'bottom-nav-more-item' },
    props: mergeProps<'a'>(
      {
        'aria-current': current ? 'page' : undefined,
        className: cn(
          'flex min-h-11 w-full shrink-0 items-center gap-(--bottom-nav-gap) rounded-inner px-row-pad-x py-row-pad-y text-control font-medium text-popover-foreground outline-hidden select-none',
          'transition-[background-color,scale] duration-feedback hover:bg-foreground/6 active:scale-[0.96] focus-visible:ring-3 focus-visible:ring-ring/24 motion-reduce:active:scale-100',
          '[&>svg]:pointer-events-none [&>svg]:size-icon-lg [&>svg]:shrink-0 [&>svg]:text-muted-foreground [&>span]:truncate',
          'aria-[current=page]:bg-foreground/10 aria-[current=page]:[&>svg]:text-foreground',
          className,
        ),
        onClick: () => setPanelOpen(false),
      },
      props,
    ),
  });
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
          'relative flex size-[calc(var(--spacing-control-lg)+2*var(--spacing-popup-inset))] items-center justify-center rounded-popup bg-popover text-popover-foreground shadow-popup outline-hidden select-none',
          'transition-[scale] duration-feedback active:scale-[0.92] focus-visible:ring-3 focus-visible:ring-ring/24 motion-reduce:active:scale-100',
          '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-icon-lg',
          className,
        ),
      },
      props,
    ),
  });
  return (
    <motion.div
      className='pointer-events-auto col-start-1 row-start-1 origin-bottom justify-self-end'
      initial={false}
      animate={away ? (reduced ? { opacity: 0 } : leave) : rest}
      // Back at once, with the shell, rather than after the tabs.
      transition={away ? leaveTransition : dockReturnTransition}
      inert={away}>
      {button}
    </motion.div>
  );
}

export {
  BottomNav,
  BottomNavAction,
  BottomNavButton,
  BottomNavLink,
  BottomNavList,
  BottomNavMore,
  BottomNavMoreItem,
  BottomNavProvider,
  useBottomNavDock,
};
