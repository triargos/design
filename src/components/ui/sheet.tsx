import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';

import { cn } from '~/lib/utils';

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot='sheet' {...props} />;
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot='sheet-trigger' {...props} />;
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot='sheet-close' {...props} />;
}

/**
 * A side panel in the modal shape: `SheetHeader` and `SheetFooter` on the shell,
 * `SheetBody` a scrolling card between them. Full height and flush on small screens; from `sm` it floats 8px in, like a
 * dialog.
 */
function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  closeLabel = 'Close',
  container,
  ...props
}: SheetPrimitive.Popup.Props &
  Pick<SheetPrimitive.Portal.Props, 'container'> & {
    side?: 'right' | 'left';
    /** The ✕ in the corner. Off when a footer action is the way out. */
    showCloseButton?: boolean;
    /** The ✕'s accessible name. */
    closeLabel?: string;
  }) {
  return (
    <SheetPrimitive.Portal data-slot='sheet-portal' container={container}>
      <SheetPrimitive.Backdrop
        data-slot='sheet-overlay'
        className='fixed inset-0 isolate z-50 bg-black/10 duration-modal ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards data-open:animate-in data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-xs'
      />
      <SheetPrimitive.Popup
        data-slot='sheet-content'
        data-side={side}
        className={cn(
          'flex flex-col bg-(--modal-shell) p-1 text-body text-popover-foreground shadow-modal outline-none [--modal-shell:var(--shell)] [--outer-inset:--spacing(1)] [--outer-radius:var(--radius-dialog)]',
          'fixed inset-y-0 z-50 h-full w-3/4 transition duration-move ease-enter data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 sm:inset-y-2 sm:h-auto sm:max-w-sm sm:rounded-dialog',
          'data-[side=right]:right-0 data-[side=right]:rounded-l-dialog data-[side=right]:data-closed:slide-out-to-right-10 data-[side=right]:data-open:slide-in-from-right-10 sm:data-[side=right]:right-2',
          'data-[side=left]:left-0 data-[side=left]:rounded-r-dialog data-[side=left]:data-closed:slide-out-to-left-10 data-[side=left]:data-open:slide-in-from-left-10 sm:data-[side=left]:left-2',
          className,
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <SheetClose
            render={
              <Button
                emphasis='ghost'
                size='icon-sm'
                className='absolute top-3 right-3 rounded-inner [--outer-inset:--spacing(3)]'
              />
            }>
            <XIcon />
            <span className='sr-only'>Close</span>
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
      className={cn('flex flex-col gap-tight pt-3 pr-11 pb-3 pl-[calc(var(--spacing-group)+1px)]', className)}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-body'
      data-surface='card'
      className={cn(
        'flex flex-col gap-group rounded-inner border border-(--edge) bg-card bg-clip-padding p-group text-card-foreground',
        'min-h-0 flex-1 overflow-y-auto',
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
        'flex flex-col-reverse gap-related px-[calc(var(--spacing-group)+1px)] pt-3 pb-3 sm:flex-row sm:justify-end',
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

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
