import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { IconCheck, IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import { animate, useReducedMotion } from 'framer-motion';
import * as React from 'react';

import { Button } from '~/components/ui/button';

import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

/** The root's imperative actions, so a bottom sheet's drag closes it as Esc and a tap outside do. */
const SheetActionsContext = React.createContext<React.RefObject<SheetPrimitive.Root.Actions | null> | null>(null);

function Sheet({ actionsRef: actionsRefProp, ...props }: SheetPrimitive.Root.Props) {
  const ownActionsRef = React.useRef<SheetPrimitive.Root.Actions | null>(null);
  const actionsRef = actionsRefProp ?? ownActionsRef;
  return (
    <SheetActionsContext value={actionsRef}>
      <SheetPrimitive.Root data-slot='sheet' actionsRef={actionsRef} {...props} />
    </SheetActionsContext>
  );
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot='sheet-trigger' {...props} />;
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot='sheet-close' {...props} />;
}

/**
 * A side panel in the modal shape: one popup surface, `SheetHeader` and `SheetBody` on it, `SheetFooter` a `muted`
 * band at the bottom; `SheetBody` scrolls between them. Full height and flush on small screens; from `sm` it floats 8px in, like a
 * dialog.
 *
 * `side='bottom'`: a menu on a phone, floating `--sheet-bottom-inset` in from the bottom and sides (above the home
 * indicator), a grabber on top, no ✕. It springs up, and a drag down on its top 56px dismisses it. Its content is a
 * `SheetStack` of `SheetPage`s holding `SheetMenuGroup`s. Name it with `aria-label`.
 */
function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  closeLabel,
  container,
  size = 'default',
  ...props
}: SheetPrimitive.Popup.Props &
  Pick<SheetPrimitive.Portal.Props, 'container'> & {
    side?: 'right' | 'left' | 'bottom';
    /** The ✕ in the corner. Off when a footer action is the way out. */
    showCloseButton?: boolean;
    /** The ✕'s accessible name. */
    closeLabel?: string;
    /** Width from `sm` up: `default` 24rem · `lg` 28rem. Below `sm`, three quarters of the screen. */
    size?: 'default' | 'lg';
  }) {
  const { labels } = useLocale();
  if (side === 'bottom')
    return (
      <BottomSheetContent className={className} container={container} {...props}>
        {children}
      </BottomSheetContent>
    );
  return (
    <SheetPrimitive.Portal data-slot='sheet-portal' container={container}>
      <SheetPrimitive.Backdrop
        data-slot='sheet-overlay'
        className='fixed inset-0 isolate z-50 bg-black/32 duration-move ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards data-open:animate-in data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-sm'
      />
      <SheetPrimitive.Popup
        data-slot='sheet-content'
        data-surface='popup'
        data-side={side}
        data-size={size}
        className={cn(
          'flex flex-col overflow-hidden bg-popover text-body text-popover-foreground shadow-modal outline-none',
          'fixed inset-y-0 z-50 h-full w-3/4 duration-move ease-enter data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 sm:inset-y-2 sm:h-auto sm:rounded-dialog',
          { default: 'sm:max-w-sm', lg: 'sm:max-w-md' }[size],
          'data-[side=right]:right-0 data-[side=right]:rounded-l-dialog data-[side=right]:data-closed:slide-out-to-right-10 data-[side=right]:data-open:slide-in-from-right-10 sm:data-[side=right]:right-2',
          'data-[side=left]:left-0 data-[side=left]:rounded-r-dialog data-[side=left]:data-closed:slide-out-to-left-10 data-[side=left]:data-open:slide-in-from-left-10 sm:data-[side=left]:left-2',
          // Reduced motion: fade only, no slide.
          'motion-reduce:data-[side=right]:data-closed:slide-out-to-right-0 motion-reduce:data-[side=right]:data-open:slide-in-from-right-0 motion-reduce:data-[side=left]:data-closed:slide-out-to-left-0 motion-reduce:data-[side=left]:data-open:slide-in-from-left-0',
          className,
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <SheetClose
            aria-label={closeLabel ?? labels.close}
            render={
              // Centered on the title's first line: `modal` in, less half the button (`control`) over the title's line.
              <Button
                emphasis='ghost'
                size='icon'
                className='absolute top-[calc(var(--spacing-modal)-(var(--spacing-control)-var(--text-heading--line-height))/2)] right-[calc(var(--spacing-modal)-(var(--spacing-control)-var(--text-heading--line-height))/2)]'
              />
            }>
            <IconX />
          </SheetClose>
        )}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-header'
      className={cn(
        // The end padding keeps the title clear of the ✕ (its inset, its width and 2px). Without a body, the header ends
        // the dialog.
        'flex flex-col gap-tight px-modal pt-modal pr-[calc(var(--spacing-modal)+(var(--spacing-control)+var(--text-heading--line-height))/2+2px)] pb-[calc(var(--spacing-group)-var(--spacing-tight))]',
        'in-[[data-slot=sheet-content]:not(:has([data-slot=sheet-body]))]:pb-modal',
        className,
      )}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-body'
      className={cn(
        // `pt-tight` (with the header's `group − tight`) leaves room for a field's focus ring at the scroll edge.
        'flex min-h-0 flex-1 flex-col gap-group overflow-y-auto px-modal pt-tight pb-modal',
        'in-[[data-slot=sheet-content]:not(:has([data-slot=sheet-header]))]:pt-modal',
        className,
      )}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-footer'
      className={cn(
        'mt-auto flex shrink-0 flex-col-reverse gap-related border-t bg-muted px-modal py-group sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot='sheet-title'
      className={cn('text-heading text-balance text-foreground', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot='sheet-description'
      className={cn('text-body text-pretty text-muted-foreground', className)}
      {...props}
    />
  );
}

/** How far down from its top edge a drag may start, and the share of its height (or the speed) that dismisses it. */
const DRAG_ZONE = 56;
const DISMISS_SHARE = 0.25;
const DISMISS_VELOCITY = 0.5;

/**
 * Follows a finger dragging the sheet down 1:1 (up with 20% rubber band) and on release dismisses it past a quarter of
 * its height or a flick, else lets it spring back. Writes `transform`, which the open and close transitions (on
 * `translate`) leave alone, so a dismissed sheet leaves from where the finger let go.
 */
function useDragToDismiss(close: () => void) {
  const drag = React.useRef<{
    readonly id: number;
    readonly startY: number;
    lastY: number;
    lastTime: number;
    velocity: number;
    dragging: boolean;
  } | null>(null);
  const suppressClick = React.useRef(false);

  const end = (element: HTMLElement, dismiss: boolean) => {
    drag.current = null;
    element.style.transition = '';
    if (!dismiss) element.style.transform = '';
  };

  return {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      if (event.clientY - event.currentTarget.getBoundingClientRect().top > DRAG_ZONE) return;
      drag.current = {
        id: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        lastTime: event.timeStamp,
        velocity: 0,
        dragging: false,
      };
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      const state = drag.current;
      if (state === null || state.id !== event.pointerId) return;
      const offset = event.clientY - state.startY;
      const element = event.currentTarget;
      if (!state.dragging) {
        if (Math.abs(offset) < 4) return;
        state.dragging = true;
        element.setPointerCapture(event.pointerId);
        element.style.transition = 'none';
      }
      const elapsed = event.timeStamp - state.lastTime;
      if (elapsed > 0) state.velocity = (event.clientY - state.lastY) / elapsed;
      state.lastY = event.clientY;
      state.lastTime = event.timeStamp;
      element.style.transform = `translateY(${offset >= 0 ? offset : offset * 0.2}px)`;
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      const state = drag.current;
      if (state === null || state.id !== event.pointerId) return;
      if (!state.dragging) {
        drag.current = null;
        return;
      }
      const element = event.currentTarget;
      const offset = event.clientY - state.startY;
      const dismiss = offset > element.offsetHeight * DISMISS_SHARE || state.velocity > DISMISS_VELOCITY;
      suppressClick.current = true;
      end(element, dismiss);
      if (dismiss) close();
    },
    onPointerCancel: (event: React.PointerEvent<HTMLElement>) => {
      if (drag.current?.id === event.pointerId) end(event.currentTarget, false);
    },
    // A drag that ends on a row is not a tap on it.
    onClickCapture: (event: React.MouseEvent) => {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}

function BottomSheetContent({
  className,
  children,
  container,
  ...props
}: SheetPrimitive.Popup.Props & Pick<SheetPrimitive.Portal.Props, 'container'>) {
  const actions = React.use(SheetActionsContext);
  const drag = useDragToDismiss(() => actions?.current?.close());
  return (
    <SheetPrimitive.Portal data-slot='sheet-portal' container={container}>
      <SheetPrimitive.Backdrop
        data-slot='sheet-overlay'
        className='fixed inset-0 isolate z-50 bg-black/32 transition-opacity duration-move ease-enter data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs'
      />
      <SheetPrimitive.Popup
        data-slot='sheet-content'
        data-surface='popup'
        data-side='bottom'
        className={cn(
          'fixed inset-x-(--sheet-bottom-inset) bottom-[calc(var(--sheet-bottom-inset)+env(safe-area-inset-bottom))] z-50 mx-auto flex max-h-[calc(100dvh-4rem)] max-w-md flex-col overflow-hidden rounded-(--sheet-bottom-radius) bg-popover text-body text-popover-foreground shadow-modal outline-none',
          'transition-[translate,transform,opacity] duration-sheet ease-spring data-ending-style:translate-y-[calc(100%+24px)] data-starting-style:translate-y-[calc(100%+24px)]',
          // Reduced motion: fade in place.
          'motion-reduce:data-ending-style:translate-y-0 motion-reduce:data-ending-style:opacity-0 motion-reduce:data-starting-style:translate-y-0 motion-reduce:data-starting-style:opacity-0',
          className,
        )}
        {...drag}
        {...props}>
        <div
          data-slot='sheet-grabber'
          aria-hidden
          className='flex shrink-0 touch-none justify-center pt-related pb-(--sheet-page-pad)'>
          <div className='h-(--sheet-grabber-height) w-(--sheet-grabber-width) rounded-full bg-border' />
        </div>
        {children}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

interface SheetStackValue {
  readonly current: string;
  readonly history: ReadonlyArray<string>;
  readonly push: (page: string) => void;
  readonly pop: () => void;
}

const SheetStackContext = React.createContext<SheetStackValue | null>(null);

/** `push(page)`, `pop()` and the `current` page of the `SheetStack` around it. */
function useSheetStack(): SheetStackValue {
  const stack = React.use(SheetStackContext);
  if (stack === null) throw new Error('useSheetStack must be used within a SheetStack.');
  return stack;
}

/** The rows of a page that cascade: what the page holds, and the rows inside its groups. */
const PAGE_ROWS =
  ':scope > :not([data-slot=sheet-menu-group]):not([data-slot=sheet-option-group]), :scope > [data-slot=sheet-menu-group] > *, :scope > [data-slot=sheet-option-group] > *';

// The morph, after Danny Williams's morphing menu (as `BottomNav`): the rows of the page that leaves blur out fast, the
// next page's rows cascade in from the side they come from, and the sheet springs to the new height. On open the rows
// rise into the sheet as it comes up. Motion springs, so a quick push and pop turns around from where it is.
const heightSpring = { type: 'spring', duration: 0.35, bounce: 0.12 } as const;
const rowsOpen = { type: 'spring', duration: 0.5, bounce: 0.25 } as const;
const rowsEnter = { type: 'spring', duration: 0.4, bounce: 0.1 } as const;
const rowsLeave = { duration: 0.12, ease: [0.4, 0, 0.2, 1] } as const;
const fade = { duration: 0.15 } as const;
const ROW_STEP = 0.02;

/**
 * Pages in a bottom sheet: `SheetPage`s, `initial` first. `push` morphs to the next page, `pop` back: the rows of the
 * page that leaves blur out, the next page's cascade in from the side they come from, and the sheet springs to its
 * height. On open the rows rise in. Reduced motion: the pages fade. Back on a page, focus returns to what pushed it.
 * The stack lives in the popup, so a closed sheet opens on `initial` again once it has left.
 */
function SheetStack({ initial, className, children, ...props }: React.ComponentProps<'div'> & { initial: string }) {
  const [history, setHistory] = React.useState<ReadonlyArray<string>>([initial]);
  const returnFocus = React.useRef<Array<HTMLElement | null>>([]);
  const ref = React.useRef<HTMLDivElement>(null);
  const previous = React.useRef<string | null>(null);
  /** 1 while pushing (rows come from the right), -1 while popping. */
  const direction = React.useRef<1 | -1>(1);
  const reduced = useReducedMotion() ?? false;
  const current = history[history.length - 1]!;

  const value = React.useMemo<SheetStackValue>(
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

    for (const page of stack.querySelectorAll<HTMLElement>(':scope > [data-slot=sheet-page]'))
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

    // Content that changes size on the page (a list loading) springs the sheet too.
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
    <SheetStackContext value={value}>
      <div
        ref={ref}
        data-slot='sheet-stack'
        className={cn('relative min-h-0 shrink overflow-hidden', className)}
        {...props}>
        {children}
      </div>
    </SheetStackContext>
  );
}

/**
 * A page of a `SheetStack`. With a `title`, a header with a back button (focused when the page is pushed). Pages that
 * don't show lie under it, hidden and inert. Scrolls past the sheet's height.
 */
function SheetPage({
  page,
  title,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & { page: string; title?: React.ReactNode }) {
  const { labels } = useLocale();
  const { current, history, pop } = useSheetStack();
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
      data-slot='sheet-page'
      data-page={page}
      data-position={position}
      inert={position !== 'current'}
      className={cn(
        'flex no-scrollbar max-h-[calc(100dvh-4rem-var(--sheet-page-pad)*3)] w-full flex-col gap-(--sheet-page-pad) overflow-y-auto overscroll-contain px-(--sheet-page-pad) pb-(--sheet-page-pad)',
        'data-[position=ahead]:pointer-events-none data-[position=ahead]:absolute data-[position=ahead]:inset-x-0 data-[position=ahead]:top-0 data-[position=ahead]:opacity-0',
        'data-[position=behind]:pointer-events-none data-[position=behind]:absolute data-[position=behind]:inset-x-0 data-[position=behind]:top-0 data-[position=behind]:opacity-0',
        className,
      )}
      {...props}>
      {title !== undefined && (
        <div
          data-slot='sheet-page-header'
          className='relative flex h-control-lg shrink-0 touch-none items-center justify-center'>
          <button
            ref={backRef}
            type='button'
            data-slot='sheet-back'
            aria-label={labels.back}
            onClick={pop}
            className='hit-area absolute left-0 flex size-control-lg items-center justify-center rounded-full text-foreground outline-hidden transition-[background-color,scale] duration-feedback hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/24 active:scale-[0.92] motion-reduce:active:scale-100 [&>svg]:size-icon-lg'>
            <IconChevronLeft />
          </button>
          <h2
            id={titleId}
            className='truncate px-control-lg text-(length:--sheet-text) leading-(--sheet-text-leading) font-medium'>
            {title}
          </h2>
        </div>
      )}
      {children}
    </div>
  );
}

/** Rows that belong together. A hairline, inset as far as the rows' text, parts it from the group before. */
function SheetMenuGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role='group'
      data-slot='sheet-menu-group'
      className={cn(
        'relative flex flex-col',
        '[[data-slot=sheet-menu-group]+&]:pt-(--sheet-page-pad) [[data-slot=sheet-menu-group]+&]:before:absolute [[data-slot=sheet-menu-group]+&]:before:inset-x-(--sheet-menu-item-pad-x) [[data-slot=sheet-menu-group]+&]:before:top-0 [[data-slot=sheet-menu-group]+&]:before:h-px [[data-slot=sheet-menu-group]+&]:before:bg-border-subtle',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A menu row: an `icon-lg` icon, the label in a `<span>`, an optional `SheetMenuValue`. A `<button>`, or a link
 * through `render`. `push` opens that `SheetPage` and ends the row in a chevron. `intent='destructive'` colors icon
 * and label (sign out). Rows take a phone's text size, as fields below `sm`: a menu is read at arm's length.
 */
function SheetMenuItem({
  className,
  render,
  push,
  intent = 'neutral',
  children,
  ...props
}: useRender.ComponentProps<'button'> & { push?: string; intent?: 'neutral' | 'destructive' }) {
  const stack = React.use(SheetStackContext);
  return useRender({
    defaultTagName: 'button',
    render,
    state: { slot: 'sheet-menu-item', intent },
    props: mergeProps<'button'>(
      {
        type: 'button',
        className: cn(
          'flex min-h-(--sheet-menu-item-height) w-full items-center gap-(--sheet-menu-item-pad-x) rounded-(--sheet-menu-item-radius) px-(--sheet-menu-item-pad-x) text-left text-(length:--sheet-text) leading-(--sheet-text-leading) text-popover-foreground outline-hidden select-none',
          '[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:first-child]:size-icon-lg [&>svg:first-child]:text-muted-foreground',
          '[&>span:not([data-slot])]:min-w-0 [&>span:not([data-slot])]:flex-1 [&>span:not([data-slot])]:truncate',
          'transition-colors duration-feedback hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/24 active:bg-foreground/5',
          'disabled:pointer-events-none disabled:text-disabled-foreground aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
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
                data-slot='sheet-menu-chevron'
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
function SheetMenuRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-menu-row'
      className={cn(
        'flex min-h-(--sheet-menu-item-height) w-full items-center gap-(--sheet-menu-item-pad-x) rounded-(--sheet-menu-item-radius) px-(--sheet-menu-item-pad-x) text-(length:--sheet-text) leading-(--sheet-text-leading) text-popover-foreground select-none',
        '[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg:first-child]:size-icon-lg [&>svg:first-child]:text-muted-foreground',
        '[&>span:not([data-slot])]:min-w-0 [&>span:not([data-slot])]:flex-1 [&>span:not([data-slot])]:truncate',
        className,
      )}
      {...props}
    />
  );
}

/** What a row is set to now, at its end in `muted-foreground` (the current workspace). */
function SheetMenuValue({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='sheet-menu-value'
      className={cn('max-w-[50%] shrink-0 truncate text-muted-foreground', className)}
      {...props}
    />
  );
}

/** A single choice on a `SheetPage`: `SheetOption`s, every one a tab stop. Name it with `aria-label`. */
function SheetOptionGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div role='radiogroup' data-slot='sheet-option-group' className={cn('flex flex-col', className)} {...props} />;
}

/**
 * A choice: `SheetOptionMedia`, `SheetOptionContent` (`SheetOptionTitle`, `SheetOptionDescription`), and a check that
 * pops in when `checked`.
 */
function SheetOption({
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
      data-slot='sheet-option'
      className={cn(
        'group/sheet-option flex min-h-(--sheet-menu-item-height) w-full items-center gap-part rounded-(--sheet-option-radius) px-(--sheet-menu-item-pad-x) py-(--sheet-page-pad) text-left text-(length:--sheet-text) leading-(--sheet-text-leading) text-popover-foreground outline-hidden select-none',
        'transition-colors duration-feedback hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/24 active:bg-foreground/5',
        'disabled:pointer-events-none disabled:text-disabled-foreground aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
        className,
      )}
      {...props}>
      {children}
      {/* No text rides it, so it may overshoot. */}
      <IconCheck
        aria-hidden
        data-slot='sheet-option-check'
        className='pointer-events-none size-icon-lg shrink-0 scale-60 text-primary opacity-0 [transition:opacity_var(--transition-duration-move)_ease,scale_var(--transition-duration-press)_var(--ease-spring-bounce)] group-aria-checked/sheet-option:scale-100 group-aria-checked/sheet-option:opacity-100 motion-reduce:scale-100'
      />
    </button>
  );
}

/** The option's tile: `control-lg`, an icon or initials on `muted`, or an image. */
function SheetOptionMedia({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='sheet-option-media'
      className={cn(
        'flex size-control-lg shrink-0 items-center justify-center overflow-hidden rounded-control bg-muted text-caption font-medium text-muted-foreground [&>img]:size-full [&>img]:object-cover [&>svg]:size-icon-lg',
        className,
      )}
      {...props}
    />
  );
}

function SheetOptionContent({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot='sheet-option-content' className={cn('flex min-w-0 flex-1 flex-col', className)} {...props} />;
}

/** Wraps to two lines, so a long organization name is read whole. */
function SheetOptionTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot='sheet-option-title' className={cn('line-clamp-2 font-medium', className)} {...props} />;
}

function SheetOptionDescription({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='sheet-option-description'
      className={cn('truncate text-body text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetMenuGroup,
  SheetMenuItem,
  SheetMenuRow,
  SheetMenuValue,
  SheetOption,
  SheetOptionContent,
  SheetOptionDescription,
  SheetOptionGroup,
  SheetOptionMedia,
  SheetOptionTitle,
  SheetPage,
  SheetStack,
  SheetTitle,
  SheetTrigger,
  useSheetStack,
};
