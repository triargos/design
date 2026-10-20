import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import * as React from 'react';

import { cn } from '~/lib/utils';

/**
 * A popup: menus, popovers, selects. Its content sits 4px in (`p-1`), so items take `rounded-inner`: concentric with
 * `rounded-popup`.
 */
export const popupSurface =
  'rounded-popup bg-popover text-popover-foreground shadow-popup [--outer-inset:--spacing(1)] [--outer-radius:var(--radius-popup)]';

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot='popover' {...props} />;
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props} />;
}

function PopoverContent({
  className,
  align,
  alignOffset,
  side,
  sideOffset = 4,
  collisionPadding,
  container,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset' | 'collisionPadding'> &
  Pick<PopoverPrimitive.Portal.Props, 'container'>) {
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className='isolate z-50'>
        <PopoverPrimitive.Popup
          data-slot='popover-content'
          data-surface='popup'
          className={cn(
            popupSurface,
            'flex w-72 origin-(--transform-origin) flex-col gap-2.5 p-2.5 text-body outline-hidden duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='popover-header' className={cn('flex flex-col gap-0.5 text-body', className)} {...props} />;
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return <PopoverPrimitive.Title data-slot='popover-title' className={cn('font-medium', className)} {...props} />;
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot='popover-description'
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger };
