import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { motion, type Transition, useReducedMotion } from 'framer-motion';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

type BottomNavContextValue = {
  /** The nav layer while it shows (below `md`): where an open `ActionBar` docks. */
  readonly dock: HTMLElement | null;
  readonly setDock: (dock: HTMLElement | null) => void;
  /** An `ActionBar` sits in the dock; the tabs and the action step aside. */
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

/**
 * The swap between the tabs and a docked `ActionBar`: both scale from 95% and rise 8px, on one spring with no bounce so
 * a quick select-clear reverses from where it is. Reduced motion: the fades only.
 */
const swapTransition: Transition = {
  type: 'spring',
  duration: 0.3,
  bounce: 0,
  opacity: { type: 'spring', duration: 0.2, bounce: 0 },
};

function useSwap(hidden: boolean) {
  const reduced = useReducedMotion() ?? false;
  return {
    initial: false,
    animate: hidden ? { opacity: 0, scale: reduced ? 1 : 0.95, y: reduced ? 0 : 8 } : { opacity: 1, scale: 1, y: 0 },
    transition: swapTransition,
    // A hidden part leaves the tab order and the accessibility tree.
    inert: hidden,
  } as const;
}

/**
 * The app navigation on a phone, floating over the page: a pill of icon tabs (`BottomNavList`) in the middle and an
 * optional round main action (`BottomNavAction`) at the end. Hidden from `md` up, where the `Sidebar` takes over.
 * `fixed` to the viewport; give the scrolling panel `pb-24` below `md` so the last content clears it. Pads for the home
 * indicator (`env(safe-area-inset-bottom)`, needs `viewport-fit=cover`). Under a `BottomNavProvider`, an open
 * `ActionBar` docks here and the tabs step aside.
 */
function BottomNav({ className, ...props }: React.ComponentProps<'div'>) {
  const context = useBottomNavDock();
  const setDock = context?.setDock;
  const ref = React.useRef<HTMLDivElement>(null);

  // Offered as the dock only while it shows: `md:hidden` has no size.
  React.useEffect(() => {
    const element = ref.current;
    if (element === null || setDock === undefined) return;
    const observer = new ResizeObserver(([entry]) => setDock(entry!.contentRect.width > 0 ? element : null));
    observer.observe(element);
    return () => {
      observer.disconnect();
      setDock(null);
    };
  }, [setDock]);

  return (
    <div
      ref={ref}
      data-slot='bottom-nav'
      className={cn(
        // `@container`: a docked bar answers its container queries from the nav's width, not the page's.
        '@container pointer-events-none fixed inset-x-0 bottom-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center px-4 pb-[max(--spacing(4),env(safe-area-inset-bottom))] md:hidden',
        className,
      )}
      {...props}
    />
  );
}

/** The pill: a `<nav>` of 3–5 tabs on the popup surface. A fill slides to the current tab. */
function BottomNavList({
  className,
  children,
  'aria-label': ariaLabel = 'Main',
  ...props
}: React.ComponentProps<'nav'>) {
  const swap = useSwap(useBottomNavDock()?.docked ?? false);
  return (
    <motion.div className='pointer-events-auto col-start-2 row-start-1 origin-bottom' {...swap}>
      <nav
        data-slot='bottom-nav-list'
        data-surface='popup'
        aria-label={ariaLabel}
        className={cn(
          'relative flex items-center gap-1 rounded-full bg-popover p-1 text-popover-foreground shadow-popup',
          className,
        )}
        {...props}>
        <CurrentIndicator />
        {children}
      </nav>
    </motion.div>
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
    };
    measure();
    const frame = requestAnimationFrame(() => setAnimate(true));
    const resize = new ResizeObserver(measure);
    resize.observe(list);
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
        'pointer-events-none absolute top-1 left-0 size-11 translate-x-(--current-left) rounded-full bg-foreground/8 transition-[translate] duration-move ease-move motion-reduce:transition-none',
        !animate && 'transition-none',
        !visible && 'invisible',
      )}
    />
  );
}

/**
 * A tab: a 44px circle with a 20px icon. The label is a `<span>` after the icon, read by screen readers only. A count
 * is a `Badge size='sm' shape='pill'` after the label, pinned to the icon's top-right corner.
 */
const bottomNavItemClassName = cn(
  'relative flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-hidden select-none',
  'transition-[color,scale] duration-feedback hover:text-foreground active:scale-[0.92] focus-visible:ring-3 focus-visible:ring-ring/24 motion-reduce:active:scale-100',
  '[&>svg]:pointer-events-none [&>svg]:size-5 [&>svg]:shrink-0 [&>span:not([data-slot=badge])]:sr-only',
  '[&>[data-slot=badge]]:absolute [&>[data-slot=badge]]:top-0.5 [&>[data-slot=badge]]:left-[calc(50%+4px)] [&>[data-slot=badge]]:min-w-5 [&>[data-slot=badge]]:tabular-nums',
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
 * A tab that opens something instead of navigating: "More", as a `DropdownMenuTrigger` (`render={<BottomNavButton />}`)
 * or with `onClick={toggleSidebar}` for the sidebar sheet. `current` marks it while the page is one of the links it
 * holds.
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
 * The one main action beside the pill (create): a 48px round `Button`, `intent='primary'` unless set. Icon only, so it
 * needs an `aria-label`.
 */
function BottomNavAction({ className, intent = 'primary', ...props }: React.ComponentProps<typeof Button>) {
  const swap = useSwap(useBottomNavDock()?.docked ?? false);
  return (
    <motion.div className='pointer-events-auto col-start-3 row-start-1 origin-bottom justify-self-end' {...swap}>
      <Button
        data-slot='bottom-nav-action'
        intent={intent}
        size='icon-lg'
        className={cn('size-12 rounded-full shadow-popup [&_svg:not([class*=size-])]:size-5', className)}
        {...props}
      />
    </motion.div>
  );
}

export {
  BottomNav,
  BottomNavAction,
  BottomNavButton,
  BottomNavLink,
  BottomNavList,
  BottomNavProvider,
  swapTransition,
  useBottomNavDock,
};
