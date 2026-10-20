import { Toast } from '@base-ui/react/toast';
import { cva } from 'class-variance-authority';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { buttonVariants } from '~/components/ui/button';
import { Spinner } from '~/components/ui/spinner';

import { cn } from '~/lib/utils';

/**
 * Stacked toasts on Base UI, bottom right. `ToastProvider` renders the stack once per app; `toast(…)` shows one from
 * anywhere. `toast` dedupes: an `add` with an existing `id` updates that toast in place, restarts its timer and bumps
 * `updateKey`, which replays a short pulse (success, info, …) or shake (error).
 *
 * `{ anchor }` shows the toast next to an element instead, styled like a tooltip (title only), for feedback on the
 * control the user just used: a failed save, a copy. Anchored toasts have their own manager, so they do not join the
 * stack.
 */
const TOAST_ICONS = {
  error: CircleAlertIcon,
  info: InfoIcon,
  loading: Spinner,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
} as const;

type ToastType = keyof typeof TOAST_ICONS;

const isToastType = (type: string | undefined): type is ToastType => type !== undefined && type in TOAST_ICONS;

/**
 * Upsert replay: alternates between two class names per animation, so every upsert restarts the keyframes: a pulse, or
 * a shake for an error.
 */
const replayVariants = cva('', {
  variants: {
    replay: { none: '', odd: 'motion-reduce:animate-none', even: 'motion-reduce:animate-none' },
    kind: { error: '', other: '' },
  },
  compoundVariants: [
    { replay: 'odd', kind: 'error', className: 'animate-toast-error-odd' },
    { replay: 'even', kind: 'error', className: 'animate-toast-error-even' },
    { replay: 'odd', kind: 'other', className: 'animate-toast-success-odd' },
    { replay: 'even', kind: 'other', className: 'animate-toast-success-even' },
  ],
  defaultVariants: { replay: 'none', kind: 'other' },
});

const replayClassName = (item: { type?: string | undefined; updateKey?: number | undefined }) =>
  replayVariants({
    replay: !item.updateKey ? 'none' : item.updateKey % 2 === 0 ? 'even' : 'odd',
    kind: item.type === 'error' ? 'error' : 'other',
  });

/** A toast in the stack. Behind the front one, each darkens a step and peeks out; expanded, they spread out. */
const toastClassName = cn([
  'absolute right-0 bottom-0 left-auto top-auto z-[calc(9999-var(--toast-index))] h-(--toast-calc-height) w-full origin-[50%_calc(50%+50%*min(var(--toast-index,0),1))] rounded-popup text-popover-foreground shadow-popup select-none',
  // Toasts behind the front one darken a step each; expanded, they all take the popup fill.
  'bg-[color-mix(in_srgb,var(--popover),black_calc(1%*max(0,var(--toast-index,0))))] data-expanded:bg-popover dark:bg-[color-mix(in_srgb,var(--popover),black_calc(6%*max(0,var(--toast-index,0))))] dark:data-expanded:bg-popover',
  '[transition:transform_.5s_cubic-bezier(.22,1,.36,1),opacity_.5s,height_.15s,background-color_.5s]',
  // Gap fill, so hovering between expanded toasts keeps them expanded
  'after:absolute after:bottom-full after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full',
  '[--toast-calc-height:var(--toast-frontmost-height,var(--toast-height))] [--toast-gap:--spacing(3)] [--toast-peek:--spacing(3)] [--toast-scale:calc(max(0,1-(var(--toast-index)*.1)))] [--toast-shrink:calc(1-var(--toast-scale))]',
  '[--toast-calc-offset-y:calc(var(--toast-offset-y)*-1+var(--toast-index)*var(--toast-gap)*-1+var(--toast-swipe-movement-y))]',
  // Stacked
  'transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))-(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]',
  'data-limited:opacity-0',
  // Expanded
  'data-expanded:h-(--toast-height)',
  'data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-calc-offset-y))]',
  // Enter
  'motion-safe:data-starting-style:transform-[translateY(calc(100%+var(--toast-inset)))]',
  'data-ending-style:opacity-0',
  // Reduced motion: fade in and out in place
  'motion-reduce:[transition:opacity_.5s,height_.15s,background-color_.5s] motion-reduce:data-starting-style:opacity-0',
  // Exit: down, or the way it was swiped
  'motion-safe:data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(100%+var(--toast-inset)))]',
  'data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]',
  'data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]',
]);

function Toasts({ container }: Pick<ToastProviderProps, 'container'>) {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Portal data-slot='toast-portal' container={container}>
      <Toast.Viewport
        className='fixed right-(--toast-inset) bottom-(--toast-inset) z-60 mx-auto flex w-[calc(100%-var(--toast-inset)*2)] max-w-90 [--toast-inset:--spacing(4)] sm:[--toast-inset:--spacing(8)]'
        data-slot='toast-viewport'>
        {toasts.map((item) => {
          const Icon = isToastType(item.type) ? TOAST_ICONS[item.type] : null;
          return (
            <Toast.Root
              key={item.id}
              className={cn(toastClassName, replayClassName(item))}
              data-slot='toast'
              swipeDirection={['right', 'down']}
              toast={item}>
              <Toast.Content className='pointer-events-auto flex items-center gap-2 overflow-hidden px-3.5 py-3 text-body transition-opacity duration-move data-behind:opacity-0 data-behind:not-data-expanded:pointer-events-none data-expanded:opacity-100'>
                {Icon && (
                  <div
                    className='self-start [&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg]:h-lh [&>svg]:w-4'
                    data-slot='toast-icon'>
                    <Icon className='in-data-[type=error]:text-destructive in-data-[type=info]:text-info in-data-[type=loading]:text-muted-foreground in-data-[type=success]:text-success in-data-[type=warning]:text-warning' />
                  </div>
                )}
                <div className='flex min-w-0 flex-1 flex-col gap-tight wrap-break-word'>
                  <Toast.Title className='font-medium' data-slot='toast-title' />
                  <Toast.Description className='text-muted-foreground' data-slot='toast-description' />
                </div>
                {item.actionProps && (
                  <Toast.Action
                    className={buttonVariants({ intent: 'neutral', emphasis: 'solid', className: 'ms-2' })}
                    data-slot='toast-action'>
                    {item.actionProps.children}
                  </Toast.Action>
                )}
              </Toast.Content>
            </Toast.Root>
          );
        })}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

/**
 * Anchored toasts, each on its own positioner next to its anchor. Styled like `TooltipContent`: title only, and the
 * same fade and scale from the anchor.
 */
function AnchoredToasts({ container }: Pick<ToastProviderProps, 'container'>) {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Portal data-slot='toast-portal-anchored' container={container}>
      <Toast.Viewport className='outline-none' data-slot='toast-viewport-anchored'>
        {toasts.map((item) =>
          item.positionerProps?.anchor ? (
            <Toast.Positioner key={item.id} className='isolate z-60' data-slot='toast-positioner' toast={item}>
              <Toast.Root
                className={cn(
                  'w-fit max-w-xs origin-(--transform-origin) rounded-control-sm bg-popover px-2 py-1 text-caption text-balance text-popover-foreground shadow-popup',
                  'transition-[opacity,scale] duration-enter ease-enter data-ending-style:opacity-0 data-starting-style:opacity-0 motion-safe:data-ending-style:scale-95 motion-safe:data-starting-style:scale-95',
                  replayClassName(item),
                )}
                data-slot='toast-anchored'
                toast={item}>
                <Toast.Content className='pointer-events-auto'>
                  <Toast.Title data-slot='toast-title' />
                </Toast.Content>
              </Toast.Root>
            </Toast.Positioner>
          ) : null,
        )}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

type ToastManager = ReturnType<typeof Toast.createToastManager>;

const toastManager = Toast.createToastManager();
const anchoredToastManager = Toast.createToastManager();

/** Anchored toasts close sooner: they report one click, right where it happened. */
const ANCHORED_TIMEOUT = 2000;

interface ToastProviderProps {
  /** Defaults to the app-wide manager `toast` adds to; a docs stage passes its own (`makeToast`). */
  toastManager?: ToastManager;
  /** Defaults to the app-wide manager anchored toasts go to. */
  anchoredToastManager?: ToastManager;
  /** Milliseconds until a toast closes; `0` keeps it open. */
  timeout?: number;
  /** Where the stack portals to; defaults to `body`. */
  container?: HTMLElement;
  children?: ReactNode;
}

/** Renders the stack and the anchored toasts. Once per app, next to or around the page. */
function ToastProvider({
  children,
  container,
  toastManager: manager = toastManager,
  anchoredToastManager: anchoredManager = anchoredToastManager,
  timeout,
}: ToastProviderProps) {
  return (
    <Toast.Provider toastManager={manager} timeout={timeout}>
      {children}
      <Toasts container={container} />
      <Toast.Provider toastManager={anchoredManager} timeout={ANCHORED_TIMEOUT}>
        <AnchoredToasts container={container} />
      </Toast.Provider>
    </Toast.Provider>
  );
}

interface ToastOptions {
  /** Upserts the toast with this id. Defaults to the type, title and description, so a repeat replaces the toast. */
  readonly id?: string | undefined;
  readonly description?: ReactNode;
  /** Milliseconds until it closes; `0` keeps it open until dismissed. Defaults to the provider's 5000. */
  readonly timeout?: number | undefined;
  readonly action?: { readonly label: ReactNode; readonly onClick: () => void } | undefined;
  readonly anchor?: never;
  readonly side?: never;
}

interface AnchoredToastOptions {
  /** Upserts the anchored toast with this id. Defaults to the type and title. */
  readonly id?: string | undefined;
  /** The element the toast points at. `null` (a ref not attached yet) shows the toast in the stack instead. */
  readonly anchor: Element | null;
  /** Side of the anchor; flips to avoid the viewport edge. Defaults to `top`. */
  readonly side?: Toast.Positioner.Props['side'];
  /** Milliseconds until it closes; `0` keeps it open until dismissed. Defaults to 2000. */
  readonly timeout?: number | undefined;
  readonly description?: never;
  readonly action?: never;
}

interface ToastPromiseOptions<A> {
  readonly loading: ReactNode;
  /** No message closes the loading toast. */
  readonly success?: ReactNode | ((value: A) => ReactNode);
  readonly error?: ReactNode | ((error: unknown) => ReactNode);
}

/** Dedupe key: the same type, title and description show one toast. Rich titles get a fresh id. */
const dedupeId = (type: ToastType | undefined, title: ReactNode, description: ReactNode): string | undefined => {
  if (typeof title !== 'string') return undefined;
  if (description !== undefined && typeof description !== 'string') return undefined;
  return JSON.stringify([type ?? 'default', title, description ?? '']);
};

const resolve = <A,>(message: ReactNode | ((value: A) => ReactNode), value: A): ReactNode =>
  typeof message === 'function' ? message(value) : message;

/** `toast` on a given manager; a docs stage passes its own so it renders its own stack. */
function makeToast(manager: ToastManager, anchoredManager: ToastManager = anchoredToastManager) {
  const show = (
    type: ToastType | undefined,
    title: ReactNode,
    options: ToastOptions | AnchoredToastOptions = {},
  ): string => {
    const { action, anchor, description, side, timeout } = options;
    if (anchor) {
      return anchoredManager.add({
        id: options.id ?? dedupeId(type, title, undefined),
        type,
        title,
        timeout,
        positionerProps: { anchor, side, sideOffset: 6 },
      });
    }
    // Every key is set, so an upsert (loading → success) does not keep the previous description or action.
    return manager.add({
      id: options.id ?? dedupeId(type, title, description),
      type,
      title,
      description,
      timeout,
      actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
    });
  };

  type Options = ToastOptions | AnchoredToastOptions;
  return Object.assign((title: ReactNode, options?: Options) => show(undefined, title, options), {
    success: (title: ReactNode, options?: Options) => show('success', title, options),
    error: (title: ReactNode, options?: Options) => show('error', title, options),
    info: (title: ReactNode, options?: Options) => show('info', title, options),
    warning: (title: ReactNode, options?: Options) => show('warning', title, options),
    /** Stays open until updated through its id or dismissed. */
    loading: (title: ReactNode, options?: Options) => show('loading', title, options),
    /** A loading toast that turns into success or error when the promise settles. Returns the promise. */
    promise: <A,>(promise: Promise<A>, { loading, success, error }: ToastPromiseOptions<A>): Promise<A> => {
      const id = show('loading', loading);
      const settle = (type: 'success' | 'error', message: ReactNode) =>
        message === undefined || message === null ? manager.close(id) : show(type, message, { id });
      promise.then(
        (value) => settle('success', resolve(success, value)),
        (cause: unknown) => settle('error', resolve(error, cause)),
      );
      return promise;
    },
    /** Closes the toast with this id, or every toast, stacked and anchored. */
    dismiss: (id?: string) => {
      manager.close(id);
      anchoredManager.close(id);
    },
  });
}

/**
 * Shows a toast and returns its id. Pass the id back (`{ id }`) to update the toast in place, e.g. loading → success.
 */
const toast = makeToast(toastManager);

export { ToastProvider, makeToast, toast };
