import { Toast } from '@base-ui/react/toast';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, LoaderCircleIcon, TriangleAlertIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { buttonVariants } from '~/components/ui/button';

import { cn } from '~/lib/utils';

/**
 * Stacked toasts on Base UI, bottom right. `ToastProvider` renders the stack once per app; `toast(…)` shows one from
 * anywhere. `toast` dedupes: an `add` with an existing `id` updates that toast in place, restarts its timer and bumps
 * `updateKey`, which replays a short pulse (success, info, …) or shake (error).
 */
const TOAST_ICONS = {
  error: CircleAlertIcon,
  info: InfoIcon,
  loading: LoaderCircleIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
} as const;

type ToastType = keyof typeof TOAST_ICONS;

const isToastType = (type: string | undefined): type is ToastType => type !== undefined && type in TOAST_ICONS;

/**
 * A toast in the stack. Behind the front one, each darkens a step and peeks out; expanded, they spread out. `replay`
 * alternates between two class names per animation, so every upsert restarts the keyframes: a pulse, or a shake for an
 * error.
 */
const toastVariants = cva(
  [
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
  ],
  {
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
  },
);

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
              className={toastVariants({
                replay: !item.updateKey ? 'none' : item.updateKey % 2 === 0 ? 'even' : 'odd',
                kind: item.type === 'error' ? 'error' : 'other',
              })}
              data-slot='toast'
              swipeDirection={['right', 'down']}
              toast={item}>
              <Toast.Content className='pointer-events-auto flex items-center gap-2 overflow-hidden px-3.5 py-3 text-body transition-opacity duration-move data-behind:opacity-0 data-behind:not-data-expanded:pointer-events-none data-expanded:opacity-100'>
                {Icon && (
                  <div
                    className='self-start [&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg]:h-lh [&>svg]:w-4'
                    data-slot='toast-icon'>
                    <Icon className='in-data-[type=error]:text-destructive in-data-[type=info]:text-info in-data-[type=loading]:animate-spin in-data-[type=loading]:opacity-80 in-data-[type=success]:text-success in-data-[type=warning]:text-warning' />
                  </div>
                )}
                <div className='flex min-w-0 flex-1 flex-col gap-tight wrap-break-word'>
                  <Toast.Title className='font-medium' data-slot='toast-title' />
                  <Toast.Description className='text-muted-foreground' data-slot='toast-description' />
                </div>
                {item.actionProps && (
                  <Toast.Action
                    className={buttonVariants({ size: 'sm', intent: 'neutral', emphasis: 'solid', className: 'ms-2' })}
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

const toastManager = Toast.createToastManager();

interface ToastProviderProps {
  /** Defaults to the app-wide manager `toast` adds to; a docs stage passes its own (`makeToast`). */
  toastManager?: ReturnType<typeof Toast.createToastManager>;
  /** Milliseconds until a toast closes; `0` keeps it open. */
  timeout?: number;
  /** Where the stack portals to; defaults to `body`. */
  container?: HTMLElement;
  children?: ReactNode;
}

/** Renders the stack. Once per app, next to or around the page. */
export function ToastProvider({
  children,
  container,
  toastManager: manager = toastManager,
  timeout,
}: ToastProviderProps) {
  return (
    <Toast.Provider toastManager={manager} timeout={timeout}>
      {children}
      <Toasts container={container} />
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
export function makeToast(manager: ReturnType<typeof Toast.createToastManager>) {
  const show = (type: ToastType | undefined, title: ReactNode, options: ToastOptions = {}): string => {
    const { action, description, timeout } = options;
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

  return Object.assign((title: ReactNode, options?: ToastOptions) => show(undefined, title, options), {
    success: (title: ReactNode, options?: ToastOptions) => show('success', title, options),
    error: (title: ReactNode, options?: ToastOptions) => show('error', title, options),
    info: (title: ReactNode, options?: ToastOptions) => show('info', title, options),
    warning: (title: ReactNode, options?: ToastOptions) => show('warning', title, options),
    /** Stays open until updated through its id or dismissed. */
    loading: (title: ReactNode, options?: ToastOptions) => show('loading', title, options),
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
    /** Closes the toast with this id, or every toast. */
    dismiss: (id?: string) => manager.close(id),
  });
}

/**
 * Shows a toast and returns its id. Pass the id back (`{ id }`) to update the toast in place, e.g. loading → success.
 */
export const toast = makeToast(toastManager);
