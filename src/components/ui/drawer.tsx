import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import * as React from 'react';

import { cn } from '~/lib/utils';

function Drawer(props: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot='drawer' {...props} />;
}

function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot='drawer-trigger' {...props} />;
}

function DrawerClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot='drawer-close' {...props} />;
}

/** A touch bottom sheet. A `Drawer` rendered inside another drawer's popup nests in it (Base UI does it on its own). */
function DrawerContent({
  className,
  children,
  container,
  ...props
}: DrawerPrimitive.Popup.Props & Pick<DrawerPrimitive.Portal.Props, 'container'>) {
  return (
    <DrawerPrimitive.Portal data-slot='drawer-portal' container={container}>
      <DrawerPrimitive.Backdrop
        data-slot='drawer-overlay'
        className='fixed inset-0 z-50 bg-black/10 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-sheet ease-sheet data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0'
      />
      <DrawerPrimitive.Viewport data-slot='drawer-viewport' className='fixed inset-0 z-50 flex items-end'>
        <DrawerPrimitive.Popup
          data-slot='drawer-content'
          className={cn(
            'relative mt-24 flex h-auto w-full flex-col rounded-t-dialog bg-background shadow-modal outline-none',
            'transition-transform duration-sheet ease-sheet data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*var(--transition-duration-sheet))] data-swiping:duration-0',
            'data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]',
            '[--nested-progress:max(0,calc(var(--nested-drawers,0)-clamp(0,var(--drawer-swipe-progress,0),1)))]',
            'origin-top [transform:translateY(calc(var(--drawer-swipe-movement-y,0px)-16px*var(--nested-progress)))_scale(calc(1-0.04*var(--nested-progress)))] data-nested-drawer-swiping:duration-0',
            // Extend the sheet below the viewport so dragging it up shows no gap.
            "after:absolute after:inset-x-0 after:top-full after:h-[200%] after:bg-inherit after:content-['']",
            className,
          )}
          {...props}>
          <div aria-hidden className='mx-auto mt-2 h-1.5 w-[40px] shrink-0 rounded-full bg-muted' />
          <DrawerPrimitive.Content className='flex min-h-0 flex-1 flex-col'>{children}</DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='drawer-header' className={cn('flex flex-col gap-tight p-group', className)} {...props} />;
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot='drawer-footer' className={cn('mt-auto flex flex-col gap-related p-group', className)} {...props} />
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title data-slot='drawer-title' className={cn('text-heading text-balance', className)} {...props} />
  );
}

function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot='drawer-description'
      className={cn('text-body text-pretty text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Wraps the page, so an open drawer scales `DrawerIndent` back over `DrawerIndentBackground`. */
const DrawerProvider = DrawerPrimitive.Provider;

function DrawerIndentBackground({ className, ...props }: DrawerPrimitive.IndentBackground.Props) {
  return (
    <DrawerPrimitive.IndentBackground
      data-slot='drawer-indent-background'
      className={cn('pointer-events-none fixed inset-0 data-active:bg-black', className)}
      {...props}
    />
  );
}

function DrawerIndent({ className, ...props }: DrawerPrimitive.Indent.Props) {
  return (
    <DrawerPrimitive.Indent
      data-slot='drawer-indent'
      className={cn(
        // Same surface as <body>, so the page looks unchanged until it scales.
        'relative origin-top bg-sidebar transition-[transform,border-radius] ease-sheet',
        '[--indent-progress:calc(1-clamp(0,var(--drawer-swipe-progress,0),1))]',
        // Track the finger without easing while a drawer is being swiped (progress > 0).
        '[transition-duration:calc(var(--transition-duration-sheet)*(1-clamp(0,calc(var(--drawer-swipe-progress,0)*100000),1)))]',
        'data-active:overflow-hidden data-active:rounded-t-[calc(8px*var(--indent-progress))]',
        'data-active:[transform:translateY(calc((env(safe-area-inset-top)+14px)*var(--indent-progress)))_scale(calc(1-0.065*var(--indent-progress)))]',
        className,
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerProvider,
  DrawerIndentBackground,
  DrawerIndent,
};
