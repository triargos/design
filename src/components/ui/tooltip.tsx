import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { cn } from '~/lib/utils';

/**
 * Shares the delay across the tooltips inside it: once one is open, its neighbours open at once. Wrap a toolbar or a
 * nav in one.
 */
function TooltipProvider(props: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot='tooltip-provider' {...props} />;
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot='tooltip' {...props} />;
}

/**
 * Opens after 200ms: long enough that a pointer passing over a row of icons opens nothing, short enough to feel
 * immediate on purpose.
 */
function TooltipTrigger({ delay = 200, ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' delay={delay} {...props} />;
}

/**
 * A small popup (`bg-popover`). Enters and exits like every popup (`duration-enter`, `ease-enter`); opened by keyboard
 * focus or dismissed (`data-instant`), it shows and hides without animation.
 */
function TooltipContent({
  className,
  side = 'top',
  align,
  container,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, 'align' | 'side'> &
  Pick<TooltipPrimitive.Portal.Props, 'container'>) {
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Positioner align={align} side={side} sideOffset={6} className='isolate z-50'>
        <TooltipPrimitive.Popup
          data-slot='tooltip-content'
          className={cn(
            'w-fit max-w-xs origin-(--transform-origin) rounded-control-sm bg-popover px-2 py-1 text-caption text-balance text-popover-foreground shadow-popup duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-instant:duration-0 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
            // Reduced motion: fade only, no zoom and no slide.
            'motion-reduce:data-closed:zoom-out-100 motion-reduce:data-open:zoom-in-100 motion-reduce:data-open:slide-in-from-top-0 motion-reduce:data-open:slide-in-from-left-0',
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
