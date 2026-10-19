import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { modalBackdrop, modalBody, modalClose, modalFooter, modalHeader, modalShell } from '~/components/ui/modal';

import { cn } from '~/lib/utils';

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot='sheet' {...props} />;
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot='sheet-trigger' {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot='sheet-close' {...props} />;
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot='sheet-portal' {...props} />;
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return <SheetPrimitive.Backdrop data-slot='sheet-overlay' className={cn(modalBackdrop, className)} {...props} />;
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
  container,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: 'right' | 'left';
  showCloseButton?: boolean;
  /** Where the portal mounts; default `body`. */
  container?: SheetPrimitive.Portal.Props['container'];
}) {
  return (
    <SheetPortal container={container}>
      <SheetOverlay />
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
          <SheetPrimitive.Close
            data-slot='sheet-close'
            render={<Button intent='neutral' emphasis='ghost' size='icon-sm' className={modalClose} />}>
            <XIcon />
            <span className='sr-only'>Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='sheet-header' className={cn(modalHeader, className)} {...props} />;
}

function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-body'
      data-modal='body'
      data-surface='card'
      className={cn(modalBody, 'min-h-0 flex-1 overflow-y-auto', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='sheet-footer' data-modal='footer' className={cn(modalFooter, className)} {...props} />;
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
