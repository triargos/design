import { mergeProps } from '@base-ui/react/merge-props';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { useRender } from '@base-ui/react/use-render';
import { cva } from 'class-variance-authority';
import * as React from 'react';
import { useUiStrings } from '~/lib/ui-config';

import { cn } from '~/lib/utils';

/**
 * One tab component, three variants, after Interfere's `Tabs`:
 * - `segmented`: a track on the shell, the active tab a raised chip that slides. Page-level views (`as='nav'`).
 * - `underline`: tabs on a hairline, the active one underlined. Sections inside a card or a popup.
 * - `pill`: separate pills, the active one in the brand fill. Filters and choices (`as='radio'`).
 *
 * `TabsList as` picks the semantics (Base UI tabs, route links, radios); see `TabsListAs`.
 */
export type TabsVariant = 'segmented' | 'underline' | 'pill';

const tabsListVariants = cva('relative isolate flex w-fit max-w-full items-center', {
  variants: {
    variant: {
      // Track radius = tab radius + track padding, so the corners stay concentric.
      segmented: 'flex-wrap rounded-[calc(var(--radius-control)+--spacing(1))] bg-shell p-1',
      underline: 'gap-group border-b border-border',
      pill: 'flex-wrap gap-1.5',
    },
  },
  defaultVariants: { variant: 'segmented' },
});

const tabsTriggerVariants = cva(
  [
    'hit-area relative inline-flex h-8 shrink-0 items-center justify-center gap-1.5 text-control font-medium whitespace-nowrap text-muted-foreground select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
    'transition-[color,background-color,scale] duration-feedback outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24',
    'disabled:pointer-events-none disabled:text-disabled-foreground data-disabled:pointer-events-none data-disabled:text-disabled-foreground',
  ],
  {
    variants: {
      variant: {
        segmented: 'rounded-control px-3 aria-[current=page]:text-foreground data-active:text-foreground',
        underline: 'h-9 rounded-control-xs px-0.5 data-active:text-foreground',
        // A resting fill, so each pill reads as a target; the indicator covers it when checked.
        pill: 'rounded-full bg-neutral-subtle px-3.5 font-normal hover:bg-foreground/8 active:scale-[0.985] aria-checked:bg-transparent aria-checked:text-primary-solid-foreground aria-checked:hover:bg-transparent aria-checked:hover:text-primary-solid-foreground data-active:bg-transparent data-active:text-primary-solid-foreground data-active:hover:bg-transparent',
      },
    },
    defaultVariants: { variant: 'segmented' },
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
        segmented: 'rounded-control bg-card shadow-raised dark:bg-foreground/10',
        underline: 'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-foreground',
        pill: 'rounded-full bg-primary-solid',
      },
    },
    defaultVariants: { variant: 'segmented' },
  },
);

interface TabsListContextValue {
  readonly as: TabsListAs;
  readonly variant: TabsVariant;
  readonly radio: RadioState | null;
}

interface RadioState {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
}

const TabsListContext = React.createContext<TabsListContextValue>({ as: 'tabs', variant: 'segmented', radio: null });

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot='tabs' className={cn('group/tabs', className)} {...props} />;
}

/**
 * What the list renders as:
 * - `tabs` (default): Base UI tabs inside `Tabs`, with `TabsContent` panels.
 * - `nav`: a `<nav>` of route links; `TabsTrigger` takes `to`. The active route carries `aria-current=page`.
 * - `radio`: a single choice; the list takes `value` and `onValueChange`, `TabsTrigger` takes `value`. Every trigger
 *   is a tab stop and Enter/Space select it — not the roving-focus radio pattern, which hides all but one from Tab and
 *   swallows Enter.
 */
export type TabsListAs = 'tabs' | 'nav' | 'radio';

type TabsListVariantProps = { variant?: TabsVariant };

type TabsListProps =
  | ({ as?: 'tabs' } & TabsListVariantProps & TabsPrimitive.List.Props)
  | ({ as: 'nav' } & TabsListVariantProps & React.ComponentProps<'nav'>)
  | ({ as: 'radio' } & TabsListVariantProps &
      RadioState &
      Omit<React.ComponentProps<'div'>, 'onChange' | 'defaultValue'>);

/** The tab row. `variant` defaults to `pill` for `as='radio'`, `segmented` otherwise. */
function TabsList(props: TabsListProps) {
  switch (props.as) {
    case 'nav':
      return <NavTabsList {...props} />;
    case 'radio':
      return <RadioTabsList {...props} />;
    default:
      return <PrimitiveTabsList {...props} />;
  }
}

function PrimitiveTabsList({
  as: _as,
  className,
  variant = 'segmented',
  children,
  ...props
}: Extract<TabsListProps, { as?: 'tabs' }>) {
  const context = React.useMemo(() => ({ as: 'tabs' as const, variant, radio: null }), [variant]);
  return (
    <TabsListContext.Provider value={context}>
      <TabsPrimitive.List
        data-slot='tabs-list'
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}>
        <TabsPrimitive.Indicator data-slot='tabs-indicator' className={indicatorVariants({ variant })} />
        {children}
      </TabsPrimitive.List>
    </TabsListContext.Provider>
  );
}

function NavTabsList({
  as: _as,
  className,
  variant = 'segmented',
  children,
  ...props
}: Extract<TabsListProps, { as: 'nav' }>) {
  const strings = useUiStrings();
  const context = React.useMemo(() => ({ as: 'nav' as const, variant, radio: null }), [variant]);
  return (
    <TabsListContext.Provider value={context}>
      <nav
        data-slot='tabs-list'
        data-variant={variant}
        aria-label={strings.pageTabs}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}>
        <SlidingIndicator activeSelector='[aria-current=page]' variant={variant} />
        {children}
      </nav>
    </TabsListContext.Provider>
  );
}

function RadioTabsList({
  as: _as,
  className,
  variant = 'pill',
  value,
  onValueChange,
  children,
  ...props
}: Extract<TabsListProps, { as: 'radio' }>) {
  const context = React.useMemo(
    () => ({ as: 'radio' as const, variant, radio: { value, onValueChange } }),
    [variant, value, onValueChange],
  );
  return (
    <TabsListContext.Provider value={context}>
      <div
        role='radiogroup'
        data-slot='tabs-list'
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), 'w-auto', className)}
        {...props}>
        <SlidingIndicator activeSelector='[aria-checked=true]' variant={variant} />
        {children}
      </div>
    </TabsListContext.Provider>
  );
}

/**
 * A link tab: an `<a>`, or the router's link through `render` (`render={<NavLink to='…' end />}`). The sliding
 * indicator follows `aria-current='page'`: set `current`, or let a router link that sets it (`NavLink`) do it.
 */
type TabsLinkTriggerProps = useRender.ComponentProps<'a'> & {
  value?: never;
  current?: boolean;
};

type TabsValueTriggerProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'value'> & {
  value: string;
  render?: never;
  current?: never;
};

function TabsLinkTrigger({ className, render, current, ...props }: TabsLinkTriggerProps) {
  const { variant } = React.useContext(TabsListContext);
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        'data-slot': 'tabs-trigger',
        'aria-current': current ? 'page' : undefined,
        className: cn(tabsTriggerVariants({ variant }), className),
      } as React.ComponentProps<'a'>,
      props,
    ),
  });
}

/** A tab. A link (`href` or `render`) inside `TabsList as='nav'`, `value` otherwise. */
function TabsTrigger(props: TabsLinkTriggerProps | TabsValueTriggerProps) {
  const { as, variant, radio } = React.useContext(TabsListContext);
  if (props.value === undefined) return <TabsLinkTrigger {...props} />;
  if (as === 'radio' && radio !== null) return <RadioTabsTrigger {...props} variant={variant} radio={radio} />;
  const { className, render: _render, current: _current, ...rest } = props;
  return (
    <TabsPrimitive.Tab data-slot='tabs-trigger' className={cn(tabsTriggerVariants({ variant }), className)} {...rest} />
  );
}

function RadioTabsTrigger({
  className,
  value,
  onClick,
  variant,
  radio,
  render: _render,
  current: _current,
  ...props
}: TabsValueTriggerProps & { variant: TabsVariant; radio: RadioState }) {
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

/**
 * The indicator for `as='nav'` and `as='radio'`, which Base UI does not own. The first child of the list: it finds the sibling that matches `activeSelector` and slides to it, with `Tabs`' geometry and styles.
 * Re-measures when an `aria-current` or `aria-checked` changes and when the list or a tab resizes; hidden while nothing
 * matches.
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

export { Tabs, TabsList, TabsTrigger, TabsContent };
