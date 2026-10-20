import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

/**
 * The app navigation on a phone, floating over the page: a pill of icon tabs (`BottomNavList`) in the middle and an
 * optional round main action (`BottomNavAction`) at the end. Hidden from `md` up, where the `Sidebar` takes over.
 * `fixed` to the viewport; give the scrolling panel `pb-24` below `md` so the last content clears it. Pads for the home
 * indicator (`env(safe-area-inset-bottom)`, needs `viewport-fit=cover`).
 */
function BottomNav({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='bottom-nav'
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center px-4 pb-[max(--spacing(4),env(safe-area-inset-bottom))] md:hidden',
        className,
      )}
      {...props}
    />
  );
}

/** The pill: a `<nav>` of 3–5 tabs on the popup surface. */
function BottomNavList({ className, 'aria-label': ariaLabel = 'Main', ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      data-slot='bottom-nav-list'
      data-surface='popup'
      aria-label={ariaLabel}
      className={cn(
        'pointer-events-auto col-start-2 flex items-center gap-1 rounded-full bg-popover p-1 text-popover-foreground shadow-popup',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A tab: a 44px circle with a 20px icon. The label is a `<span>` after the icon, read by screen readers only; the
 * current tab sits on a quiet fill. A count is a `Badge size='sm' shape='pill'` after the label, pinned to the icon's
 * top-right corner.
 */
const bottomNavItemClassName = cn(
  'relative flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-hidden select-none',
  'transition-[color,background-color,scale] duration-feedback hover:text-foreground active:scale-[0.96] active:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/24',
  '[&>svg]:pointer-events-none [&>svg]:size-5 [&>svg]:shrink-0 [&>span:not([data-slot=badge])]:sr-only',
  '[&>[data-slot=badge]]:absolute [&>[data-slot=badge]]:top-0.5 [&>[data-slot=badge]]:left-[calc(50%+4px)] [&>[data-slot=badge]]:min-w-5 [&>[data-slot=badge]]:tabular-nums',
  'aria-[current=page]:bg-foreground/8 aria-[current=page]:text-foreground data-current:bg-foreground/8 data-current:text-foreground',
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
  return (
    <Button
      data-slot='bottom-nav-action'
      intent={intent}
      size='icon-lg'
      className={cn(
        'pointer-events-auto col-start-3 size-12 justify-self-end rounded-full shadow-popup [&_svg:not([class*=size-])]:size-5',
        className,
      )}
      {...props}
    />
  );
}

export { BottomNav, BottomNavAction, BottomNavButton, BottomNavLink, BottomNavList };
