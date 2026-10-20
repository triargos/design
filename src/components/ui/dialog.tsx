import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';

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
  /** Width from `sm` up: `sm` 24rem · `default` 28rem · `lg` 42rem · `xl` 56rem. Below `sm`, the screen minus 2rem. */
  size?: 'sm' | 'default' | 'lg' | 'xl';
}

/**
 * A modal: `DialogHeader` and `DialogFooter` on the shell (`--shell`, as on a `Card`; restyle it through
 * `--modal-shell`), the content in `DialogBody`, a card 4px in with concentric corners. The backdrop's exit holds its
 * last frame (`fill-mode-forwards`), so it doesn't flash back to full blur while a slower popup leaves.
 * `AlertDialog` and `Sheet` share these classes.
 * A form wraps `DialogBody` and `DialogFooter` (`className='contents'`). A confirmation is an `AlertDialog`.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = 'Close',
  container,
  size = 'default',
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal data-slot='dialog-portal' container={container}>
      <DialogPrimitive.Backdrop
        data-slot='dialog-overlay'
        className='fixed inset-0 isolate z-50 bg-black/10 duration-modal ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards data-open:animate-in data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-xs'
      />
      <DialogPrimitive.Popup
        data-slot='dialog-content'
        data-size={size}
        className={cn(
          'flex flex-col bg-(--modal-shell) p-1 text-body text-popover-foreground shadow-modal outline-none [--modal-shell:var(--shell)] [--outer-inset:--spacing(1)] [--outer-radius:var(--radius-dialog)]',
          'fixed top-[round(50%,1px)] left-[round(50%,1px)] z-50 w-full translate-x-[round(-50%,1px)] translate-y-[round(-50%,1px)] rounded-dialog duration-modal ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 motion-reduce:data-closed:zoom-out-100 motion-reduce:data-open:zoom-in-100',
          'max-w-[calc(100%-2rem)] sm:min-w-min',
          { sm: 'sm:max-w-sm', default: 'sm:max-w-md', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }[size],
          className,
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <DialogClose
            aria-label={closeLabel}
            render={
              <Button
                emphasis='ghost'
                size='icon'
                className='absolute top-3 right-3 rounded-inner [--outer-inset:--spacing(3)]'
              />
            }>
            <XIcon />
          </DialogClose>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-header'
      className={cn('flex flex-col gap-tight pt-3 pr-11 pb-3 pl-[calc(var(--spacing-group)+1px)]', className)}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-body'
      data-surface='card'
      className={cn(
        'flex flex-col gap-group rounded-inner border border-(--edge) bg-card bg-clip-padding p-group text-card-foreground',
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn(
        'flex flex-col-reverse gap-related px-[calc(var(--spacing-group)+1px)] pt-3 pb-3 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
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
