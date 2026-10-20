import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';
import { IconX } from '@tabler/icons-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';

import { useLocale } from '~/components/ui/locale';
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
 * A side panel in the modal shape: one popup surface, `SheetHeader` and `SheetBody` on it, `SheetFooter` a `muted`
 * band at the bottom; `SheetBody` scrolls between them. Full height and flush on small screens; from `sm` it floats 8px in, like a
 * dialog.
 */
function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  closeLabel,
  container,
  size = 'default',
  ...props
}: SheetPrimitive.Popup.Props &
  Pick<SheetPrimitive.Portal.Props, 'container'> & {
    side?: 'right' | 'left';
    /** The ✕ in the corner. Off when a footer action is the way out. */
    showCloseButton?: boolean;
    /** The ✕'s accessible name. */
    closeLabel?: string;
    /** Width from `sm` up: `default` 24rem · `lg` 28rem. Below `sm`, three quarters of the screen. */
    size?: 'default' | 'lg';
  }) {
  const { labels } = useLocale();
  return (
    <SheetPrimitive.Portal data-slot='sheet-portal' container={container}>
      <SheetPrimitive.Backdrop
        data-slot='sheet-overlay'
        className='fixed inset-0 isolate z-50 bg-black/32 duration-move ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards data-open:animate-in data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-sm'
      />
      <SheetPrimitive.Popup
        data-slot='sheet-content'
        data-surface='popup'
        data-side={side}
        data-size={size}
        className={cn(
          'flex flex-col overflow-hidden bg-popover text-body text-popover-foreground shadow-modal outline-none [--modal-inset:calc(var(--spacing-group)+var(--spacing-related))]',
          'fixed inset-y-0 z-50 h-full w-3/4 duration-move ease-enter data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0 sm:inset-y-2 sm:h-auto sm:rounded-dialog',
          { default: 'sm:max-w-sm', lg: 'sm:max-w-md' }[size],
          'data-[side=right]:right-0 data-[side=right]:rounded-l-dialog data-[side=right]:data-closed:slide-out-to-right-10 data-[side=right]:data-open:slide-in-from-right-10 sm:data-[side=right]:right-2',
          'data-[side=left]:left-0 data-[side=left]:rounded-r-dialog data-[side=left]:data-closed:slide-out-to-left-10 data-[side=left]:data-open:slide-in-from-left-10 sm:data-[side=left]:left-2',
          className,
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <SheetClose
            aria-label={closeLabel ?? labels.close}
            render={
              // Centered on the title's first line: 18px in, half the button (36px) less than the title's line (24px)
              // 24px in.
              <Button emphasis='ghost' size='icon' className='absolute top-4.5 right-4.5' />
            }>
            <IconX />
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
      className={cn(
        // `pr-14` keeps the title clear of the ✕. Without a body, the header ends the dialog.
        'flex flex-col gap-tight px-(--modal-inset) pt-(--modal-inset) pr-14 pb-[calc(var(--spacing-group)-var(--spacing-tight))]',
        'in-[[data-slot=sheet-content]:not(:has([data-slot=sheet-body]))]:pb-(--modal-inset)',
        className,
      )}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-body'
      className={cn(
        // `pt-tight` (with the header's `group − tight`) leaves room for a field's focus ring at the scroll edge.
        'flex min-h-0 flex-1 flex-col gap-group overflow-y-auto px-(--modal-inset) pt-tight pb-(--modal-inset)',
        'in-[[data-slot=sheet-content]:not(:has([data-slot=sheet-header]))]:pt-(--modal-inset)',
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
        'mt-auto flex shrink-0 flex-col-reverse gap-related border-t bg-muted px-(--modal-inset) py-group sm:flex-row sm:justify-end',
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
