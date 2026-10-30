import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { IconCheck, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { animate, useReducedMotion } from 'framer-motion';
import * as React from 'react';

import { Button } from '~/components/ui/button';

import { useLocale } from '~/components/ui/locale';
import { OverlayOpenContext, useOverlayRoot, usePreservedContent } from '~/hooks/use-overlay';
import { cn } from '~/lib/utils';

/** `sensitive`: it holds input the user would lose, so `closeOverlays` leaves it open and `hasSensitiveOverlay` is true. */
function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  actionsRef,
  sensitive = false,
  ...props
}: DrawerPrimitive.Root.Props & { sensitive?: boolean }) {
  const overlay = useOverlayRoot({ open, defaultOpen, onOpenChange, actionsRef, sensitive });
  return (
    <OverlayOpenContext value={overlay.open}>
      <DrawerPrimitive.Root
        data-slot='drawer'
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={overlay.onOpenChange}
        actionsRef={overlay.actionsRef}
        {...props}
      />
    </OverlayOpenContext>
  );
}

function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot='drawer-trigger' {...props} />;
}

function DrawerClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot='drawer-close' {...props} />;
}

/**
 * A menu on a phone: floating `--drawer-inset` in from the bottom and sides (above the home indicator), a grabber on
 * top, no ✕. It springs up; a swipe down dismisses it (Base UI's `Drawer`, which also leaves a scrolled page to scroll
 * first). Its content is a `DrawerStack` of `DrawerPage`s holding `DrawerMenuGroup`s. Name it with `aria-label`.
 */
function DrawerContent({
  className,
  children,
  container,
  ...props
}: DrawerPrimitive.Popup.Props & Pick<DrawerPrimitive.Portal.Props, 'container'>) {
  const content = usePreservedContent(children);
  return (
    <DrawerPrimitive.Portal data-slot='drawer-portal' container={container}>
      <DrawerPrimitive.Backdrop
        data-slot='drawer-overlay'
        className={cn(
          'fixed inset-0 isolate z-50 bg-black/32 supports-backdrop-filter:backdrop-blur-xs',
          // Clears as the drawer is swiped away, with the finger: the backdrop has no `data-swiping` of its own.
          'opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-drawer ease-spring data-ending-style:opacity-0 data-starting-style:opacity-0 has-[~[data-slot=drawer-viewport]_[data-swiping]]:duration-0',
          'data-ending-style:duration-[calc(var(--drawer-swipe-strength)*var(--transition-duration-drawer))]',
        )}
      />
      <DrawerPrimitive.Viewport
        data-slot='drawer-viewport'
        className='fixed inset-0 z-50 flex items-end justify-center px-(--drawer-inset) pb-[calc(var(--drawer-inset)+env(safe-area-inset-bottom))]'>
        <DrawerPrimitive.Popup
          data-slot='drawer-content'
          data-surface='popup'
          className={cn(
            'flex max-h-[calc(100dvh-4rem)] w-full max-w-md flex-col overflow-hidden rounded-(--drawer-radius) bg-popover text-body text-popover-foreground shadow-modal outline-none',
            // `transform`, as Base UI writes it inline while a finger drags.
            '[transform:translateY(var(--drawer-swipe-movement-y))] transition-[transform,opacity] duration-drawer ease-spring data-swiping:select-none',
            'data-ending-style:[transform:translateY(calc(100%+var(--drawer-inset)+env(safe-area-inset-bottom)))] data-starting-style:[transform:translateY(calc(100%+var(--drawer-inset)+env(safe-area-inset-bottom)))]',
            // A flick leaves faster than a slow drag.
            'data-ending-style:duration-[calc(var(--drawer-swipe-strength)*var(--transition-duration-drawer))]',
            // Reduced motion: fade in place.
            'motion-reduce:data-ending-style:[transform:none] motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:[transform:none] motion-reduce:data-starting-style:opacity-0',
            className,
          )}
          {...props}>
          <div
            aria-hidden
            data-slot='drawer-grabber'
            className='flex shrink-0 justify-center pt-related pb-(--drawer-page-pad)'>
            <div className='h-1 w-9 rounded-full bg-border' />
          </div>
          {content}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

interface DrawerStackValue {
  readonly current: string;
  readonly history: ReadonlyArray<string>;
  readonly push: (page: string) => void;
  readonly pop: () => void;
}

const DrawerStackContext = React.createContext<DrawerStackValue | null>(null);

/** `push(page)`, `pop()` and the `current` page of the `DrawerStack` around it. */
function useDrawerStack(): DrawerStackValue {
  const stack = React.use(DrawerStackContext);
  if (stack === null) throw new Error('useDrawerStack must be used within a DrawerStack.');
  return stack;
}

/** The rows of a page that cascade: what the page holds, and the rows inside its groups. */
const PAGE_ROWS =
  ':scope > :not([data-slot=drawer-menu-group]):not([data-slot=drawer-option-group]), :scope > [data-slot=drawer-menu-group] > *, :scope > [data-slot=drawer-option-group] > *';

// The morph, after Danny Williams's morphing menu (as `BottomNav`): the rows of the page that leaves blur out fast, the
// next page's rows cascade in from the side they come from, and the drawer springs to the new height. On open the rows
// rise into the drawer as it comes up. Motion springs, so a quick push and pop turns around from where it is.
const heightSpring = { type: 'spring', duration: 0.35, bounce: 0.12 } as const;
const rowsOpen = { type: 'spring', duration: 0.5, bounce: 0.25 } as const;
const rowsEnter = { type: 'spring', duration: 0.4, bounce: 0.1 } as const;
const rowsLeave = { duration: 0.12, ease: [0.4, 0, 0.2, 1] } as const;
const fade = { duration: 0.15 } as const;
const ROW_STEP = 0.02;

/**
 * Pages in a drawer: `DrawerPage`s, `initial` first. `push` morphs to the next page, `pop` back: the rows of the page
 * that leaves blur out, the next page's cascade in from the side they come from, and the drawer springs to its height.
 * On open the rows rise in. Reduced motion: the pages fade. Back on a page, focus returns to what pushed it. The stack
 * lives in the popup, so a closed drawer opens on `initial` again once it has left.
 */
function DrawerStack({ initial, className, children, ...props }: React.ComponentProps<'div'> & { initial: string }) {
  const [history, setHistory] = React.useState<ReadonlyArray<string>>([initial]);
  const returnFocus = React.useRef<Array<HTMLElement | null>>([]);
  const ref = React.useRef<HTMLDivElement>(null);
  const previous = React.useRef<string | null>(null);
  /** 1 while pushing (rows come from the right), -1 while popping. */
  const direction = React.useRef<1 | -1>(1);
  const reduced = useReducedMotion() ?? false;
  const current = history[history.length - 1]!;

  const value = React.useMemo<DrawerStackValue>(
    () => ({
      current,
      history,
      push: (page) => {
        direction.current = 1;
        returnFocus.current.push(document.activeElement instanceof HTMLElement ? document.activeElement : null);
        setHistory((pages) => [...pages, page]);
      },
      pop: () => {
        direction.current = -1;
        const back = returnFocus.current.pop();
        setHistory((pages) => (pages.length > 1 ? pages.slice(0, -1) : pages));
        requestAnimationFrame(() => back?.focus({ preventScroll: true }));
      },
    }),
    [current, history],
  );

  // The page that shows is in flow, so the first paint has its height; the explicit height animates the changes.
  // Explicit keyframes throughout: an interrupted morph leaves rows mid-way, and the next one starts them over.
  React.useLayoutEffect(() => {
    const stack = ref.current;
    const pageOf = (id: string) =>
      stack?.querySelector<HTMLElement>(`:scope > [data-page="${CSS.escape(id)}"]`) ?? null;
    const incoming = pageOf(current);
    if (!stack || !incoming) return;
    const from = previous.current;
    previous.current = current;
    const outgoing = from === null || from === current ? null : pageOf(from);
    const rows = (page: HTMLElement) =>
      [...page.querySelectorAll(PAGE_ROWS)].filter((row): row is HTMLElement => row instanceof HTMLElement);
    const running: Array<{ stop: () => void }> = [];

    for (const page of stack.querySelectorAll<HTMLElement>(':scope > [data-slot=drawer-page]'))
      if (page !== incoming && page !== outgoing) page.style.opacity = '0';
    incoming.style.opacity = '1';

    const height = incoming.offsetHeight;
    if (outgoing === null || reduced) stack.style.height = `${height}px`;
    else running.push(animate(stack, { height: [stack.offsetHeight, height] }, heightSpring));

    if (reduced) {
      for (const row of rows(incoming)) Object.assign(row.style, { opacity: '', transform: '', filter: '' });
      if (outgoing !== null) {
        running.push(animate(incoming, { opacity: [0, 1] }, fade));
        running.push(animate(outgoing, { opacity: [1, 0] }, fade));
      }
    } else if (outgoing === null) {
      for (const [index, row] of rows(incoming).entries())
        running.push(
          animate(
            row,
            { opacity: [0, 1], y: [24, 0], filter: ['blur(4px)', 'blur(0px)'] },
            { ...rowsOpen, delay: 0.06 + index * ROW_STEP },
          ),
        );
    } else {
      const side = direction.current;
      for (const row of rows(outgoing))
        running.push(animate(row, { opacity: 0, x: -16 * side, filter: 'blur(2px)' }, rowsLeave));
      running.push(animate(outgoing, { opacity: 0 }, { ...rowsLeave, delay: rowsLeave.duration }));
      for (const [index, row] of rows(incoming).entries())
        running.push(
          animate(
            row,
            { opacity: [0, 1], x: [24 * side, 0], filter: ['blur(4px)', 'blur(0px)'] },
            { ...rowsEnter, delay: 0.04 + index * ROW_STEP },
          ),
        );
    }

    // Content that changes size on the page (a list loading) springs the drawer too.
    let last = height;
    const observer = new ResizeObserver(() => {
      const next = incoming.offsetHeight;
      if (next === last) return;
      last = next;
      if (reduced) stack.style.height = `${next}px`;
      else running.push(animate(stack, { height: [stack.offsetHeight, next] }, heightSpring));
    });
    observer.observe(incoming);
    return () => {
      observer.disconnect();
      for (const animation of running) animation.stop();
    };
  }, [current, reduced]);

  return (
    <DrawerStackContext value={value}>
      <div
        ref={ref}
        data-slot='drawer-stack'
        className={cn('relative min-h-0 shrink overflow-hidden', className)}
        {...props}>
        {children}
      </div>
    </DrawerStackContext>
  );
}

/**
 * A page of a `DrawerStack`. With a `title`, a header with a back button (focused when the page is pushed). Pages that
 * don't show lie under it, hidden and inert. Scrolls past the drawer's height.
 */
function DrawerPage({
  page,
  title,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & { page: string; title?: React.ReactNode }) {
  const { labels } = useLocale();
  const { current, history, pop } = useDrawerStack();
  const position = page === current ? 'current' : history.includes(page) ? 'behind' : 'ahead';
  const backRef = React.useRef<HTMLButtonElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (position === 'current' && history.length > 1) backRef.current?.focus({ preventScroll: true });
  }, [position, history.length]);

  return (
    <div
      role='group'
      aria-labelledby={title === undefined ? undefined : titleId}
      data-slot='drawer-page'
      data-page={page}
      data-position={position}
      inert={position !== 'current'}
      className={cn(
        'flex no-scrollbar max-h-[calc(100dvh-4rem-var(--drawer-page-pad)*3)] w-full flex-col gap-(--drawer-page-pad) overflow-y-auto overscroll-contain px-(--drawer-page-pad) pb-(--drawer-page-pad)',
        'data-[position=ahead]:pointer-events-none data-[position=ahead]:absolute data-[position=ahead]:inset-x-0 data-[position=ahead]:top-0 data-[position=ahead]:opacity-0',
        'data-[position=behind]:pointer-events-none data-[position=behind]:absolute data-[position=behind]:inset-x-0 data-[position=behind]:top-0 data-[position=behind]:opacity-0',
        className,
      )}
      {...props}>
      {title !== undefined && (
        <div data-slot='drawer-page-header' className='relative flex h-control-lg shrink-0 items-center justify-center'>
          <Button
            ref={backRef}
            emphasis='ghost'
            size='icon-lg'
            data-slot='drawer-back'
            aria-label={labels.back}
            onClick={pop}
            className='absolute left-0 rounded-full [&>svg]:size-icon-lg'>
            <IconChevronLeft />
          </Button>
          <h2 id={titleId} className='truncate px-control-lg text-[1rem] leading-6 font-medium'>
            {title}
          </h2>
        </div>
      )}
      {children}
    </div>
  );
}

/** Rows that belong together. A hairline, inset as far as the rows' text, parts it from the group before. */
function DrawerMenuGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role='group'
      data-slot='drawer-menu-group'
      className={cn(
        'relative flex flex-col',
        '[[data-slot=drawer-menu-group]+&]:pt-(--drawer-page-pad) [[data-slot=drawer-menu-group]+&]:before:absolute [[data-slot=drawer-menu-group]+&]:before:inset-x-(--drawer-menu-item-pad-x) [[data-slot=drawer-menu-group]+&]:before:top-0 [[data-slot=drawer-menu-group]+&]:before:h-px [[data-slot=drawer-menu-group]+&]:before:bg-border-subtle',
        className,
      )}
      {...props}
    />
  );
}

/** A row's box and text, for `DrawerMenuItem` and `DrawerMenuRow`: the icon first, the label in a `<span>`. */
const menuRowClassName = cn(
  'flex min-h-(--drawer-menu-item-height) w-full items-center gap-(--drawer-menu-item-pad-x) rounded-(--drawer-menu-item-radius) px-(--drawer-menu-item-pad-x) text-[1rem] leading-6 text-popover-foreground select-none',
  '[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:first-child]:size-icon-lg [&>svg:first-child]:text-muted-foreground',
  '[&>span:not([data-slot])]:min-w-0 [&>span:not([data-slot])]:flex-1 [&>span:not([data-slot])]:truncate',
);

/** Hover, press, focus and disabled for a row that is a control. */
const pressableRowClassName = cn(
  'text-left outline-hidden transition-colors duration-feedback hover:bg-highlight focus-visible:ring-3 focus-visible:ring-ring/24 active:bg-highlight',
  'disabled:pointer-events-none disabled:text-disabled-foreground aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
);

/**
 * A menu row: an `icon-lg` icon, the label in a `<span>`, an optional `DrawerMenuValue`. A `<button>`, or a link
 * through `render`. `push` opens that `DrawerPage` and ends the row in a chevron. `intent='destructive'` colors icon
 * and label (sign out). Rows take a phone's text size, as fields on a phone: a menu is read at arm's length.
 */
function DrawerMenuItem({
  className,
  render,
  push,
  intent = 'neutral',
  children,
  ...props
}: useRender.ComponentProps<'button'> & { push?: string; intent?: 'neutral' | 'destructive' }) {
  const stack = React.use(DrawerStackContext);
  return useRender({
    defaultTagName: 'button',
    render,
    state: { slot: 'drawer-menu-item', intent },
    props: mergeProps<'button'>(
      {
        type: 'button',
        className: cn(
          menuRowClassName,
          pressableRowClassName,
          'data-[intent=destructive]:text-destructive data-[intent=destructive]:[&>svg:first-child]:text-destructive',
          className,
        ),
        onClick: () => {
          if (push !== undefined) stack?.push(push);
        },
        children: (
          <>
            {children}
            {push !== undefined && (
              <IconChevronRight
                data-slot='drawer-menu-chevron'
                aria-hidden
                className='size-icon text-faint-foreground'
              />
            )}
          </>
        ),
      },
      props,
    ),
  });
}

/** A menu row that holds its own control (a `TabsRadioGroup` at the end) instead of being one. */
function DrawerMenuRow({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='drawer-menu-row' className={cn(menuRowClassName, className)} {...props} />;
}

/** What a row is set to now, at its end in `muted-foreground` (the current workspace). */
function DrawerMenuValue({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='drawer-menu-value'
      className={cn('max-w-[50%] shrink-0 truncate text-muted-foreground', className)}
      {...props}
    />
  );
}

/** A single choice on a `DrawerPage`: `DrawerOption`s, every one a tab stop. Name it with `aria-label`. */
function DrawerOptionGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div role='radiogroup' data-slot='drawer-option-group' className={cn('flex flex-col', className)} {...props} />
  );
}

/**
 * A choice: `DrawerOptionMedia`, `DrawerOptionContent` (`DrawerOptionTitle`, `DrawerOptionDescription`), and a check
 * that pops in when `checked`.
 */
function DrawerOption({
  className,
  checked,
  children,
  ...props
}: React.ComponentProps<'button'> & { checked: boolean }) {
  return (
    <button
      type='button'
      role='radio'
      aria-checked={checked}
      data-slot='drawer-option'
      className={cn(
        'group/drawer-option flex min-h-(--drawer-menu-item-height) w-full items-center gap-part rounded-(--drawer-option-radius) px-(--drawer-menu-item-pad-x) py-(--drawer-page-pad) text-[1rem] leading-6 text-popover-foreground select-none',
        pressableRowClassName,
        className,
      )}
      {...props}>
      {children}
      {/* No text rides it, so it may overshoot. */}
      <IconCheck
        aria-hidden
        data-slot='drawer-option-check'
        className='pointer-events-none size-icon-lg shrink-0 scale-60 text-primary opacity-0 [transition:opacity_var(--transition-duration-move)_ease,scale_var(--transition-duration-press)_var(--ease-spring-bounce)] group-aria-checked/drawer-option:scale-100 group-aria-checked/drawer-option:opacity-100 motion-reduce:scale-100'
      />
    </button>
  );
}

/** The option's tile: `control-lg`, an icon or initials on `muted`, or an image. */
function DrawerOptionMedia({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='drawer-option-media'
      className={cn(
        'flex size-control-lg shrink-0 items-center justify-center overflow-hidden rounded-control bg-muted text-caption font-medium text-muted-foreground [&>img]:size-full [&>img]:object-cover [&>svg]:size-icon-lg',
        className,
      )}
      {...props}
    />
  );
}

function DrawerOptionContent({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot='drawer-option-content' className={cn('flex min-w-0 flex-1 flex-col', className)} {...props} />
  );
}

/** Wraps to two lines, so a long organization name is read whole. */
function DrawerOptionTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot='drawer-option-title' className={cn('line-clamp-2 font-medium', className)} {...props} />;
}

function DrawerOptionDescription({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='drawer-option-description'
      className={cn('truncate text-body text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Small print under a page's rows, lined up with their text. */
function DrawerFootnote({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot='drawer-footnote'
      className={cn(
        'px-(--drawer-menu-item-pad-x) pb-related text-caption text-pretty text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFootnote,
  DrawerMenuGroup,
  DrawerMenuItem,
  DrawerMenuRow,
  DrawerMenuValue,
  DrawerOption,
  DrawerOptionContent,
  DrawerOptionDescription,
  DrawerOptionGroup,
  DrawerOptionMedia,
  DrawerOptionTitle,
  DrawerPage,
  DrawerStack,
  DrawerTrigger,
  useDrawerStack,
};
