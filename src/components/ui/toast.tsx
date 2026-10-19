import { Toast } from '@base-ui/react/toast';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, LoaderCircleIcon, TriangleAlertIcon } from 'lucide-react';
import type React from 'react';

import { buttonVariants } from '~/components/ui/button';

import { cn } from '~/lib/utils';

/**
 * Stacked toasts on Base UI (coss ui `toast`). Show them with `toast` from `~/lib/toast/toast`, which dedupes by
 * default: an `add` with an existing `id` updates that toast in place, restarts its timer and bumps `updateKey`, which
 * replays a short pulse (success, info, …) or shake (error).
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

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

function getSwipeDirection(position: ToastPosition): SwipeDirection[] {
  const vertical: SwipeDirection = position.startsWith('top') ? 'up' : 'down';
  if (position.includes('center')) return [vertical];
  if (position.includes('left')) return ['left', vertical];
  return ['right', vertical];
}

/** Two class names per animation that alternate, so every upsert restarts the keyframes. */
function upsertReplayClassName(toast: { type?: string | undefined; updateKey?: number | undefined }) {
  const key = toast.updateKey ?? 0;
  if (key <= 0) return undefined;
  const even = key % 2 === 0;
  if (toast.type === 'error') {
    return even
      ? 'animate-toast-error-even motion-reduce:animate-none'
      : 'animate-toast-error-odd motion-reduce:animate-none';
  }
  return even
    ? 'animate-toast-success-even motion-reduce:animate-none'
    : 'animate-toast-success-odd motion-reduce:animate-none';
}

const toastRootClassName = cn(
  'absolute z-[calc(9999-var(--toast-index))] h-(--toast-calc-height) w-full rounded-popup text-popover-foreground shadow-popup select-none',
  // Toasts behind the front one darken a step each; expanded, they all take the popup fill.
  'bg-[color-mix(in_srgb,var(--popover),black_calc(1%*max(0,var(--toast-index,0))))] data-expanded:bg-popover dark:bg-[color-mix(in_srgb,var(--popover),black_calc(6%*max(0,var(--toast-index,0))))] dark:data-expanded:bg-popover',
  '[transition:transform_.5s_cubic-bezier(.22,1,.36,1),opacity_.5s,height_.15s,background-color_.5s]',
  // Base positioning
  'data-[position*=right]:right-0 data-[position*=right]:left-auto',
  'data-[position*=left]:right-auto data-[position*=left]:left-0',
  'data-[position*=center]:right-0 data-[position*=center]:left-0',
  'data-[position*=top]:top-0 data-[position*=top]:bottom-auto data-[position*=top]:origin-[50%_calc(50%-50%*min(var(--toast-index,0),1))]',
  'data-[position*=bottom]:top-auto data-[position*=bottom]:bottom-0 data-[position*=bottom]:origin-[50%_calc(50%+50%*min(var(--toast-index,0),1))]',
  // Gap fill, so hovering between expanded toasts keeps them expanded
  'after:absolute after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full',
  'data-[position*=top]:after:top-full',
  'data-[position*=bottom]:after:bottom-full',
  '[--toast-calc-height:var(--toast-frontmost-height,var(--toast-height))] [--toast-gap:--spacing(3)] [--toast-peek:--spacing(3)] [--toast-scale:calc(max(0,1-(var(--toast-index)*.1)))] [--toast-shrink:calc(1-var(--toast-scale))]',
  'data-[position*=top]:[--toast-calc-offset-y:calc(var(--toast-offset-y)+var(--toast-index)*var(--toast-gap)+var(--toast-swipe-movement-y))]',
  'data-[position*=bottom]:[--toast-calc-offset-y:calc(var(--toast-offset-y)*-1+var(--toast-index)*var(--toast-gap)*-1+var(--toast-swipe-movement-y))]',
  // Stacked
  'data-[position*=top]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--toast-peek))+(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]',
  'data-[position*=bottom]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))-(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]',
  'data-limited:opacity-0',
  // Expanded
  'data-expanded:h-(--toast-height)',
  'data-position:data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-calc-offset-y))]',
  // Enter
  'motion-safe:data-[position*=top]:data-starting-style:transform-[translateY(calc(-100%-var(--toast-inset)))]',
  'motion-safe:data-[position*=bottom]:data-starting-style:transform-[translateY(calc(100%+var(--toast-inset)))]',
  'data-ending-style:opacity-0',
  // Reduced motion: fade in and out in place
  'motion-reduce:[transition:opacity_.5s,height_.15s,background-color_.5s] motion-reduce:data-starting-style:opacity-0',
  // Exit, direction-aware
  'motion-safe:data-[position*=top]:data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(-100%-var(--toast-inset)))]',
  'motion-safe:data-[position*=bottom]:data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(100%+var(--toast-inset)))]',
  'data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-100%-var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]',
  'data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]',
  'data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-100%-var(--toast-inset)))]',
  'data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]',
);

function Toasts({
  position,
  portalProps,
}: {
  position: ToastPosition;
  portalProps?: React.ComponentProps<typeof Toast.Portal> | undefined;
}) {
  const { toasts } = Toast.useToastManager();
  const swipeDirection = getSwipeDirection(position);

  return (
    <Toast.Portal data-slot='toast-portal' {...portalProps}>
      <Toast.Viewport
        className={cn(
          'fixed z-60 mx-auto flex w-[calc(100%-var(--toast-inset)*2)] max-w-90 [--toast-inset:--spacing(4)] sm:[--toast-inset:--spacing(8)]',
          'data-[position*=top]:top-(--toast-inset)',
          'data-[position*=bottom]:bottom-(--toast-inset)',
          'data-[position*=left]:left-(--toast-inset)',
          'data-[position*=right]:right-(--toast-inset)',
          'data-[position*=center]:left-1/2 data-[position*=center]:-translate-x-1/2',
        )}
        data-position={position}
        data-slot='toast-viewport'>
        {toasts.map((toast) => {
          const Icon = isToastType(toast.type) ? TOAST_ICONS[toast.type] : null;
          return (
            <Toast.Root
              key={toast.id}
              className={cn(toastRootClassName, upsertReplayClassName(toast))}
              data-position={position}
              data-slot='toast'
              swipeDirection={swipeDirection}
              toast={toast}>
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
                {toast.actionProps && (
                  <Toast.Action
                    className={buttonVariants({ size: 'sm', intent: 'neutral', emphasis: 'solid', className: 'ms-2' })}
                    data-slot='toast-action'>
                    {toast.actionProps.children}
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

export type ToastManager = ReturnType<typeof Toast.createToastManager>;

export const toastManager: ToastManager = Toast.createToastManager();

export interface ToastProviderProps extends Toast.Provider.Props {
  position?: ToastPosition;
  portalProps?: React.ComponentProps<typeof Toast.Portal>;
}

/** Renders the stack. `toastManager` defaults to the app-wide one; stories pass their own. */
export function ToastProvider({ children, position = 'bottom-right', portalProps, ...props }: ToastProviderProps) {
  return (
    <Toast.Provider toastManager={toastManager} {...props}>
      {children}
      <Toasts portalProps={portalProps} position={position} />
    </Toast.Provider>
  );
}

export { Toast as ToastPrimitive };
