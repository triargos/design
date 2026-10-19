import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { useAnimate, useReducedMotion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { modalBackdrop, modalBody, modalClose, modalFooter, modalHeader, modalShell } from '~/components/ui/modal';

import { cn } from '~/lib/utils';

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot='dialog-close' {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return <DialogPrimitive.Backdrop data-slot='dialog-overlay' className={cn(modalBackdrop, className)} {...props} />;
}

/**
 * A modal: `DialogHeader` and `DialogFooter` on the shell, the content in `DialogBody`, a card (`components/ui/modal.ts`).
 * A form wraps `DialogBody` and `DialogFooter` (`className='contents'`). A confirmation is an `AlertDialog`.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  container,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  /** Where the portal mounts; default `body`. */
  container?: DialogPrimitive.Portal.Props['container'];
}) {
  return (
    <DialogPortal container={container}>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot='dialog-content'
        className={cn(
          modalShell,
          'group/dialog fixed top-[round(50%,1px)] left-[round(50%,1px)] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[round(-50%,1px)] translate-y-[round(-50%,1px)] rounded-dialog duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 sm:max-w-sm sm:min-w-min',
          className,
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot='dialog-close'
            render={<Button intent='neutral' emphasis='ghost' size='icon-sm' className={modalClose} />}>
            <XIcon />
            <span className='sr-only'>Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='dialog-header' className={cn(modalHeader, className)} {...props} />;
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-body'
      data-modal='body'
      data-surface='card'
      className={cn(modalBody, className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
}) {
  return (
    <div data-slot='dialog-footer' data-modal='footer' className={cn(modalFooter, className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button intent='neutral' emphasis='raised' />}>Close</DialogPrimitive.Close>
      )}
    </div>
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

/**
 * Acknowledge an action without closing the dialog (e.g. "save and add another"): the whole popup
 * squishes and springs back. Pass `scope` as the {@link DialogContent} ref. The popup centers with
 * the `translate` property, so the inline `transform` this sets does not displace it.
 */
function useDialogAcknowledge() {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduceMotion = useReducedMotion() ?? false;

  const acknowledge = React.useCallback(() => {
    if (reduceMotion || scope.current === null) return;
    animate(scope.current, { scale: 0.95 }, { duration: 0.06, ease: 'easeOut' }).then(() => {
      animate(scope.current, { scale: 1 }, { type: 'spring', stiffness: 700, damping: 28, mass: 0.8 });
    });
  }, [animate, reduceMotion, scope]);

  return { scope, acknowledge };
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  useDialogAcknowledge,
};
