import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { modalBackdrop, modalBody, modalClose, modalFooter, modalHeader, modalShell } from '~/components/ui/modal';

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
 * A side panel in the modal shape (`components/ui/modal.ts`): `SheetHeader` and `SheetFooter` on the shell,
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
      <SheetPrimitive.Backdrop data-slot='sheet-overlay' className={modalBackdrop} />
      <SheetPrimitive.Popup
        data-slot='sheet-content'
        data-side={side}
        className={cn(
          modalShell,
          'fixed inset-y-0 z-50 h-full w-3/4 transition duration-move ease-enter data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 sm:inset-y-2 sm:h-auto sm:max-w-sm sm:rounded-dialog',
          'data-[side=right]:right-0 data-[side=right]:rounded-l-dialog data-[side=right]:data-closed:slide-out-to-right-10 data-[side=right]:data-open:slide-in-from-right-10 sm:data-[side=right]:right-2',
          'data-[side=left]:left-0 data-[side=left]:rounded-r-dialog data-[side=left]:data-closed:slide-out-to-left-10 data-[side=left]:data-open:slide-in-from-left-10 sm:data-[side=left]:left-2',
          className,
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <SheetClose render={<Button emphasis='ghost' size='icon-sm' className={modalClose} />}>
            <XIcon />
            <span className='sr-only'>Close</span>
          </SheetClose>
        )}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='sheet-header' className={cn(modalHeader, className)} {...props} />;
}

function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-body'
      data-surface='card'
      className={cn(modalBody, 'min-h-0 flex-1 overflow-y-auto', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='sheet-footer' className={cn(modalFooter, className)} {...props} />;
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
