import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '~/lib/utils';

/** Long enough that a pointer passing over a row of icons opens nothing; short enough to feel immediate on purpose. */
const TOOLTIP_DELAY_MS = 200;

/**
 * Two appearances, compared in Storybook before one becomes the only one: `light`, a small popup (`bg-popover`), and
 * `inverted`, the neutral solid (dark on light, light on dark). Enters and exits like every popup (`duration-enter`,
 * `ease-enter`); opened by keyboard focus or dismissed (`data-instant`), it shows and hides without animation.
 */
const tooltipVariants = cva(
  'w-fit max-w-xs origin-(--transform-origin) rounded-control-sm px-2 py-1 text-caption text-balance shadow-popup duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-instant:duration-0 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
  {
    variants: {
      appearance: {
        light: 'bg-popover text-popover-foreground',
        inverted: 'bg-neutral-solid text-neutral-solid-foreground',
      },
    },
    defaultVariants: { appearance: 'light' },
  },
);

/** Whether a `TooltipProvider` is above; a `Tooltip` without one brings its own, so the delay is 200ms everywhere. */
const HasTooltipProvider = React.createContext(false);

/**
 * Shares the delay across the tooltips inside it: once one is open, its neighbours open at once. Wrap a toolbar or a
 * nav in one; set `delay` to change it for all of them.
 */
function TooltipProvider({ delay = TOOLTIP_DELAY_MS, ...props }: TooltipPrimitive.Provider.Props) {
  return (
    <HasTooltipProvider value={true}>
      <TooltipPrimitive.Provider data-slot='tooltip-provider' delay={delay} {...props} />
    </HasTooltipProvider>
  );
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  const root = <TooltipPrimitive.Root data-slot='tooltip' {...props} />;
  return React.use(HasTooltipProvider) ? root : <TooltipProvider>{root}</TooltipProvider>;
}

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />;
}

function TooltipContent({
  className,
  side = 'top',
  sideOffset = 6,
  align,
  alignOffset,
  appearance,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'> &
  VariantProps<typeof tooltipVariants>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className='isolate z-50'>
        <TooltipPrimitive.Popup
          data-slot='tooltip-content'
          className={cn(tooltipVariants({ appearance }), className)}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
