import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { IconX } from '@tabler/icons-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';

import { useLocale } from '~/components/ui/locale';
import { OverlayOpenContext, useOverlayRoot, usePreservedContent } from '~/hooks/use-overlay';
import { cn } from '~/lib/utils';

/** `sensitive`: it holds input the user would lose, so `closeOverlays` leaves it open and `hasSensitiveOverlay` is true. */
function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  actionsRef,
  sensitive = false,
  ...props
}: DialogPrimitive.Root.Props & { sensitive?: boolean }) {
  const overlay = useOverlayRoot({ open, defaultOpen, onOpenChange, actionsRef, sensitive });
  return (
    <OverlayOpenContext value={overlay.open}>
      <DialogPrimitive.Root
        data-slot='dialog'
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={overlay.onOpenChange}
        actionsRef={overlay.actionsRef}
        {...props}
      />
    </OverlayOpenContext>
  );
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
 * A modal: one popup surface, `DialogHeader` and `DialogBody` on it `modal` (`--spacing-modal`) in, `DialogFooter` a
 * `muted` band under a rule. The body scrolls when the dialog meets the screen's height. The backdrop's exit holds its
 * last frame (`fill-mode-forwards`), so it doesn't flash back to full blur while a slower popup leaves.
 * `AlertDialog` and `Sheet` share these classes.
 * A form wraps `DialogBody` and `DialogFooter` (`className='contents'`). A confirmation is an `AlertDialog`.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel,
  container,
  size = 'default',
  ...props
}: DialogContentProps) {
  const { labels } = useLocale();
  const content = usePreservedContent(children);
  return (
    <DialogPrimitive.Portal data-slot='dialog-portal' container={container}>
      <DialogPrimitive.Backdrop
        data-slot='dialog-overlay'
        className='fixed inset-0 isolate z-50 bg-black/32 duration-modal ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards data-open:animate-in data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-sm'
      />
      <DialogPrimitive.Popup
        data-slot='dialog-content'
        data-surface='popup'
        data-size={size}
        className={cn(
          'flex flex-col overflow-hidden bg-popover text-body text-popover-foreground shadow-modal outline-none',
          'fixed top-[round(50%,1px)] left-[round(50%,1px)] z-50 w-full translate-x-[round(-50%,1px)] translate-y-[round(-50%,1px)] rounded-dialog duration-modal ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-97 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-97 motion-reduce:data-closed:zoom-out-100 motion-reduce:data-open:zoom-in-100',
          // Under an open nested dialog it steps back: smaller per level, dimmed by an overlay (`after:`).
          'transition-[scale] ease-move data-nested-dialog-open:scale-[calc(1-0.04*var(--nested-dialogs))] motion-reduce:data-nested-dialog-open:scale-100',
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-black/0 after:transition-colors after:duration-modal data-nested-dialog-open:after:bg-black/8',
          'max-h-[calc(100dvh-2rem)] max-w-[calc(100%-2rem)] sm:min-w-min',
          { sm: 'sm:max-w-sm', default: 'sm:max-w-md', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }[size],
          className,
        )}
        {...props}>
        {content}
        {showCloseButton && (
          <DialogClose
            aria-label={closeLabel ?? labels.close}
            render={
              // Centered on the title's first line: `modal` in, less half the button (`control`) over the title's line.
              <Button
                emphasis='ghost'
                size='icon'
                className='absolute top-[calc(var(--spacing-modal)-(var(--spacing-control)-var(--text-heading--line-height))/2)] right-[calc(var(--spacing-modal)-(var(--spacing-control)-var(--text-heading--line-height))/2)]'
              />
            }>
            <IconX />
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
      className={cn(
        // The end padding keeps the title clear of the ✕ (its inset, its width and 2px). Without a body, the header ends
        // the dialog.
        'flex flex-col gap-tight px-modal pt-modal pr-[calc(var(--spacing-modal)+(var(--spacing-control)+var(--text-heading--line-height))/2+2px)] pb-[calc(var(--spacing-group)-var(--spacing-tight))]',
        'in-[[data-slot=dialog-content]:not(:has([data-slot=dialog-body]))]:pb-modal',
        className,
      )}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-body'
      className={cn(
        // `pt-tight` (with the header's `group − tight`) leaves room for a field's focus ring at the scroll edge.
        'flex min-h-0 flex-col gap-group overflow-y-auto px-modal pt-tight pb-modal',
        'in-[[data-slot=dialog-content]:not(:has([data-slot=dialog-header]))]:pt-modal',
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
        'flex shrink-0 flex-col-reverse gap-related border-t bg-muted px-modal py-group sm:flex-row sm:justify-end',
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
