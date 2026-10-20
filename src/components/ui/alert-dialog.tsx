import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import * as React from 'react';

import { Button, type ButtonProps } from '~/components/ui/button';

import { cn } from '~/lib/utils';

function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot='alert-dialog' {...props} />;
}

function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot='alert-dialog-trigger' {...props} />;
}

/**
 * A confirmation in the modal shape: the header holds the question on the popup surface, the footer is a `muted` band
 * with the actions. `size='sm'`: centered, the two actions in equal columns.
 */
function AlertDialogContent({
  className,
  size = 'default',
  container,
  ...props
}: AlertDialogPrimitive.Popup.Props &
  Pick<AlertDialogPrimitive.Portal.Props, 'container'> & {
    /** `sm`: narrower and centered, the two actions in equal columns. */
    size?: 'default' | 'sm';
  }) {
  return (
    <AlertDialogPrimitive.Portal data-slot='alert-dialog-portal' container={container}>
      <AlertDialogPrimitive.Backdrop
        data-slot='alert-dialog-overlay'
        className='fixed inset-0 isolate z-50 bg-black/32 duration-modal ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards data-open:animate-in data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-sm'
      />
      <AlertDialogPrimitive.Popup
        data-slot='alert-dialog-content'
        data-surface='popup'
        data-size={size}
        className={cn(
          'flex flex-col overflow-hidden bg-popover text-body text-popover-foreground shadow-modal outline-none [--modal-inset:calc(var(--spacing-group)+var(--spacing-related))]',
          'fixed top-[round(50%,1px)] left-[round(50%,1px)] z-50 w-full translate-x-[round(-50%,1px)] translate-y-[round(-50%,1px)] rounded-dialog duration-modal ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-97 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-97 motion-reduce:data-closed:zoom-out-100 motion-reduce:data-open:zoom-in-100',
          // Under an open nested dialog it steps back: smaller per level, dimmed by an overlay (`after:`).
          'transition-[scale] ease-move data-nested-dialog-open:scale-[calc(1-0.04*var(--nested-dialogs))] motion-reduce:data-nested-dialog-open:scale-100',
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-black/0 after:transition-colors after:duration-modal data-nested-dialog-open:after:bg-black/8',
          'group/alert-dialog-content max-w-xs data-[size=default]:sm:max-w-sm',
          className,
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-header'
      className={cn(
        'p-(--modal-inset)',
        'grid grid-rows-[auto_1fr] place-items-center gap-tight text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]',
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-footer'
      className={cn(
        'flex flex-col-reverse gap-related border-t bg-muted px-(--modal-inset) py-group sm:flex-row sm:justify-end',
        'group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2',
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogMedia({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-media'
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-control-lg bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot='alert-dialog-title'
      className={cn(
        'text-heading text-balance sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2',
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogDescription({ className, ...props }: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot='alert-dialog-description'
      className={cn(
        'text-body text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** The confirming action; it does not close the dialog by itself, so a pending request can keep it open. */
function AlertDialogAction(props: ButtonProps) {
  return <Button data-slot='alert-dialog-action' {...props} />;
}

/** Always `neutral`/`raised`; `size` matches a smaller action. */
function AlertDialogCancel({ size, ...props }: AlertDialogPrimitive.Close.Props & Pick<ButtonProps, 'size'>) {
  return <AlertDialogPrimitive.Close data-slot='alert-dialog-cancel' render={<Button size={size} />} {...props} />;
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
};
