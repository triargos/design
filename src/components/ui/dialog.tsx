import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import {
  modalBackdrop,
  modalBody,
  modalCentered,
  modalClose,
  modalFooter,
  modalHeader,
  modalShell,
} from '~/components/ui/modal';

import { cn } from '~/lib/utils';

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />;
}

interface DialogContentProps extends DialogPrimitive.Popup.Props, Pick<DialogPrimitive.Portal.Props, 'container'> {
  /** The ✕ in the corner. Off when a footer action is the way out. */
  showCloseButton?: boolean;
  /** The ✕'s accessible name. */
  closeLabel?: string;
}

/**
 * A modal: `DialogHeader` and `DialogFooter` on the shell, the content in `DialogBody`, a card (`components/ui/modal.ts`).
 * A form wraps `DialogBody` and `DialogFooter` (`className='contents'`). A confirmation is an `AlertDialog`.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = 'Close',
  container,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal data-slot='dialog-portal' container={container}>
      <DialogPrimitive.Backdrop data-slot='dialog-overlay' className={modalBackdrop} />
      <DialogPrimitive.Popup
        data-slot='dialog-content'
        className={cn(modalShell, modalCentered, 'max-w-[calc(100%-2rem)] sm:max-w-md sm:min-w-min', className)}
        {...props}>
        {children}
        {showCloseButton && (
          <DialogClose
            aria-label={closeLabel}
            render={<Button emphasis='ghost' size='icon-sm' className={modalClose} />}>
            <XIcon />
          </DialogClose>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='dialog-header' className={cn(modalHeader, className)} {...props} />;
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='dialog-body' data-surface='card' className={cn(modalBody, className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='dialog-footer' className={cn(modalFooter, className)} {...props} />;
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title data-slot='dialog-title' className={cn('text-heading text-balance', className)} {...props} />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot='dialog-description'
      className={cn(
        'text-body text-pretty text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
