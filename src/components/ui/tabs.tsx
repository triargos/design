import { mergeProps } from '@base-ui/react/merge-props';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { useRender } from '@base-ui/react/use-render';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { useLocale } from '~/components/ui/locale';
import { useLinkRender } from '~/components/ui/link';
import { cn } from '~/lib/utils';

/**
 * Three lists, one look. Each takes `variant`:
 * - `segmented`: a track on the shell, the active tab a raised chip that slides. Views of a page.
 * - `underline`: tabs on a hairline, the active one underlined. Sections inside a card or a popup.
 * - `pill`: separate pills, the active one in the brand fill. Filters and choices.
 * - `inline`: `segmented`, round and 2px into a track tinted with the text color, for a control inside a row (a menu
 *   row's theme switch). An icon-only tab needs an `aria-label`.
 *
 * And each has its own semantics:
 * - `Tabs` > `TabsList` > `TabsTrigger value`, with `TabsContent` panels: Base UI tabs.
 * - `TabsNav` > `TabsLink`: a `<nav>` of page links; `current` marks the page.
 * - `TabsRadioGroup value onValueChange` > `TabsRadio value`: a single choice without panels.
 */
type TabsVariant = 'segmented' | 'underline' | 'pill' | 'inline';

// Track radius = tab radius + track padding, so the corners stay concentric; the padding counts only up to the tab
// radius, so square tabs sit in a square track.
const segmentedTrack =
  'flex-wrap rounded-[calc(var(--tabs-radius)+min(var(--tabs-inset),var(--tabs-radius)))] p-(--tabs-inset)';

const tabsListVariants = cva('relative isolate flex w-fit max-w-full items-center', {
  variants: {
    variant: {
      segmented: cn(segmentedTrack, 'bg-shell'),
      underline: 'gap-group border-b border-border',
      pill: 'flex-wrap gap-control-gap',
      // The tab's own fill reads one step from the row it sits on, so the track tints with the text color.
      inline: cn(segmentedTrack, 'bg-foreground/6 [--tabs-inset:2px] [--tabs-radius:var(--radius-track)]'),
    },
  },
});

// An icon alone: as wide as the icon and `control-pad-xs` either side.
const segmentedTab =
  'rounded-(--tabs-radius) px-control-pad-sm has-[>svg:only-child]:px-control-pad-xs aria-[current=page]:text-foreground data-active:text-foreground aria-checked:text-foreground';

const tabsTriggerVariants = cva(
  [
    'hit-area relative inline-flex h-control-sm shrink-0 items-center justify-center gap-control-gap text-control font-medium whitespace-nowrap text-muted-foreground select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-icon',
    'transition-[color,background-color,scale] duration-feedback outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24',
    'disabled:pointer-events-none disabled:text-disabled-foreground data-disabled:pointer-events-none data-disabled:text-disabled-foreground',
  ],
  {
    variants: {
      variant: {
        segmented: segmentedTab,
        inline: segmentedTab,
        // 2px in from the ends, room for the focus ring.
        underline: 'h-control rounded-control-xs px-0.5 data-active:text-foreground',
        // A resting fill, so each pill reads as a target; the indicator covers it when checked. 2px more padding than a
        // segmented tab: the round ends eat into it.
        pill: 'rounded-full bg-neutral-subtle px-[calc(var(--spacing-control-pad-sm)+2px)] font-normal hover:bg-foreground/8 active:scale-[0.96] motion-reduce:active:scale-100 aria-checked:bg-transparent aria-checked:text-primary-solid-foreground aria-checked:hover:bg-transparent aria-checked:hover:text-primary-solid-foreground data-active:bg-transparent data-active:text-primary-solid-foreground data-active:hover:bg-transparent',
      },
    },
  },
);

/**
 * Positioned from `--active-tab-left`, `--active-tab-top`, `--active-tab-width` and `--active-tab-height` (Base UI's
 * names); slides between tabs.
 */
const indicatorVariants = cva(
  'pointer-events-none absolute top-0 left-0 -z-10 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top) transition-[translate,width,height] duration-move ease-move motion-reduce:transition-none',
  {
    variants: {
      variant: {
        segmented: 'rounded-(--tabs-radius) bg-card shadow-raised dark:bg-foreground/10',
        inline: 'rounded-(--tabs-radius) bg-card shadow-raised dark:bg-foreground/10',
        underline: 'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-foreground',
        pill: 'rounded-full bg-primary-solid',
      },
    },
  },
);

const TabsVariantContext = React.createContext<TabsVariant>('segmented');

type VariantProp = { variant?: TabsVariant };

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot='tabs' className={cn('group/tabs', className)} {...props} />;
}

/** The tab row of `Tabs`. */
function TabsList({ className, variant = 'segmented', children, ...props }: TabsPrimitive.List.Props & VariantProp) {
  return (
    <TabsVariantContext value={variant}>
      <TabsPrimitive.List
        data-slot='tabs-list'
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}>
        <TabsPrimitive.Indicator data-slot='tabs-indicator' className={indicatorVariants({ variant })} />
        {children}
      </TabsPrimitive.List>
    </TabsVariantContext>
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  const variant = React.use(TabsVariantContext);
  return (
    <TabsPrimitive.Tab
      data-slot='tabs-trigger'
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot='tabs-content'
      className={cn(
        'mt-group rounded-control-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/24',
        className,
      )}
      {...props}
    />
  );
}

/** A `<nav>` of page links (`TabsLink`). The indicator follows the link with `aria-current='page'`. */
function TabsNav({
  className,
  variant = 'segmented',
  'aria-label': ariaLabel,
  children,
  ...props
}: React.ComponentProps<'nav'> & VariantProp) {
  const { labels } = useLocale();
  return (
    <TabsVariantContext value={variant}>
      <nav
        data-slot='tabs-list'
        data-variant={variant}
        aria-label={ariaLabel ?? labels.pageTabs}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}>
        <SlidingIndicator activeSelector='[aria-current=page]' variant={variant} />
        {children}
      </nav>
    </TabsVariantContext>
  );
}

/**
 * A page link in a `TabsNav`: an `<a>`, or the router's link through `render` (`render={<NavLink to='…' end />}`).
 * `current` marks the page; a router link that sets `aria-current` itself needs no `current`.
 */
function TabsLink({ className, render, current, ...props }: useRender.ComponentProps<'a'> & { current?: boolean }) {
  const variant = React.use(TabsVariantContext);
  const linkRender = useLinkRender(render);
  return useRender({
    defaultTagName: 'a',
    render: linkRender,
    state: { slot: 'tabs-trigger' },
    props: mergeProps<'a'>(
      {
        'aria-current': current ? 'page' : undefined,
        className: cn(tabsTriggerVariants({ variant }), className),
      },
      props,
    ),
  });
}

interface RadioState {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
}

const RadioContext = React.createContext<RadioState | null>(null);

/**
 * A single choice drawn as tabs, `pill` by default. Every `TabsRadio` is a tab stop and Enter/Space select it — not the
 * roving-focus radio pattern, which hides all but one from Tab and swallows Enter.
 */
function TabsRadioGroup({
  className,
  variant = 'pill',
  value,
  onValueChange,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onChange' | 'defaultValue'> & VariantProp & RadioState) {
  return (
    <TabsVariantContext value={variant}>
      <RadioContext value={{ value, onValueChange }}>
        <div
          role='radiogroup'
          data-slot='tabs-list'
          data-variant={variant}
          className={cn(tabsListVariants({ variant }), 'w-auto', className)}
          {...props}>
          <SlidingIndicator activeSelector='[aria-checked=true]' variant={variant} />
          {children}
        </div>
      </RadioContext>
    </TabsVariantContext>
  );
}

function TabsRadio({
  className,
  value,
  onClick,
  ...props
}: Omit<React.ComponentProps<'button'>, 'value'> & { value: string }) {
  const variant = React.use(TabsVariantContext);
  const radio = React.use(RadioContext);
  if (radio === null) throw new Error('TabsRadio must be used within a TabsRadioGroup.');
  const checked = radio.value === value;
  return (
    <button
      type='button'
      role='radio'
      aria-checked={checked}
      // Explicit: macOS Safari/Firefox skip buttons without a tabIndex unless the OS setting is on.
      tabIndex={0}
      data-slot='tabs-trigger'
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !checked) radio.onValueChange(value);
      }}
      className={cn(
        tabsTriggerVariants({ variant }),
        'aria-invalid:ring-3 aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

/**
 * The indicator for `TabsNav` and `TabsRadioGroup`, which Base UI does not own. The first child of the list: it slides
 * to the sibling that matches `activeSelector`, with `Tabs`' geometry and styles. Re-measures when an `aria-current` or
 * `aria-checked` changes and when the list or a tab resizes; hidden while nothing matches.
 */
function SlidingIndicator({ activeSelector, variant }: { activeSelector: string; variant: TabsVariant }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [animate, setAnimate] = React.useState(false);

  React.useLayoutEffect(() => {
    // The parent, not a ref from it: a parent's ref is not attached yet when a child's layout effect runs.
    const indicator = ref.current;
    const container = indicator?.parentElement;
    if (indicator === null || container === null || container === undefined) return;
    const measure = () => {
      const active = container.querySelector<HTMLElement>(activeSelector);
      setVisible(active !== null);
      if (active === null) return;
      indicator.style.setProperty('--active-tab-left', `${active.offsetLeft}px`);
      indicator.style.setProperty('--active-tab-top', `${active.offsetTop}px`);
      indicator.style.setProperty('--active-tab-width', `${active.offsetWidth}px`);
      indicator.style.setProperty('--active-tab-height', `${active.offsetHeight}px`);
    };
    measure();
    // Slide only after the first placement, so the indicator does not fly in on mount.
    const frame = requestAnimationFrame(() => setAnimate(true));
    // Each tab too: a web font loading late widens the tabs without resizing a full-width list.
    const resize = new ResizeObserver(measure);
    resize.observe(container);
    for (const child of container.children) resize.observe(child);
    const mutation = new MutationObserver(measure);
    mutation.observe(container, { subtree: true, attributes: true, attributeFilter: ['aria-current', 'aria-checked'] });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [activeSelector]);

  return (
    <span
      ref={ref}
      aria-hidden
      data-slot='tabs-indicator'
      className={cn(indicatorVariants({ variant }), !animate && 'transition-none', !visible && 'invisible')}
    />
  );
}

export { Tabs, TabsContent, TabsLink, TabsList, TabsNav, TabsRadio, TabsRadioGroup, TabsTrigger };
