import { Command as CommandPrimitive } from 'cmdk';
import { IconSearch } from '@tabler/icons-react';
import * as React from 'react';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

import { cn } from '~/lib/utils';

/**
 * Rows sit `--spacing-list-inset` in (`CommandList`'s padding), so `rounded-inner` is the surface's radius less that inset: the
 * popup's inline, the dialog's in `CommandDialog`.
 */
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot='command'
      className={cn(
        'flex size-full flex-col overflow-hidden bg-transparent text-popover-foreground [--outer-inset:var(--spacing-list-inset)] [--outer-radius:var(--radius-popup)] in-data-[slot=dialog-content]:[--outer-radius:var(--radius-dialog)]',
        className,
      )}
      {...props}
    />
  );
}

/** The palette: a `Command` as the dialog's only content, 42rem wide (`lg`), with no header, footer or close button. */
function CommandDialog({
  title,
  description,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  /** The dialog's accessible name; not shown. */
  title: string;
  /** Read after the title; not shown. */
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog {...props}>
      <DialogContent size='lg' className='top-[12dvh] max-h-[76dvh] translate-y-0' showCloseButton={false}>
        <DialogHeader className='sr-only'>
          <DialogTitle>{title}</DialogTitle>
          {description !== undefined && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogBody className='gap-0 overflow-hidden p-0'>{children}</DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    // A bare row over a rule, not a field: the search is the palette's header. The icon lines up with the rows' text.
    <div
      data-slot='command-input-wrapper'
      className='flex h-(--command-input-height) shrink-0 items-center gap-(--command-input-gap) border-b px-[calc(var(--spacing-list-inset)+var(--spacing-row-pad-x))]'>
      <IconSearch aria-hidden className='size-icon shrink-0 text-muted-foreground' />
      <CommandPrimitive.Input
        data-slot='command-input'
        className={cn(
          'h-full w-full min-w-0 bg-transparent text-body outline-hidden placeholder:text-faint-foreground disabled:cursor-not-allowed disabled:text-disabled-foreground',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot='command-list'
      className={cn(
        'no-scrollbar max-h-96 scroll-py-list-inset overflow-x-hidden overflow-y-auto p-list-inset outline-none',
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot='command-empty'
      className={cn('py-(--command-empty-pad-y) text-center text-body', className)}
      {...props}
    />
  );
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot='command-group'
      className={cn(
        // Headings as menu labels: `caption`, medium, sentence case.
        'overflow-hidden text-foreground [[cmdk-group]:not([hidden])~&:not([cmdk-separator]+&)]:pt-list-inset **:[[cmdk-group-heading]]:px-row-pad-x **:[[cmdk-group-heading]]:py-(--command-heading-pad-y) **:[[cmdk-group-heading]]:text-caption **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot='command-separator'
      className={cn('-mx-list-inset my-list-inset h-px bg-border', className)}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot='command-item'
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-row-gap rounded-inner px-row-pad-x py-[calc((var(--spacing-control-lg)-var(--text-control--line-height))/2)] text-control outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:text-disabled-foreground data-[selected=true]:bg-highlight data-[selected=true]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon data-[selected=true]:*:[svg]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='command-shortcut'
      className={cn(
        'ml-auto text-caption tracking-widest text-muted-foreground group-data-[selected=true]/command-item:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A muted band under the list, aligned with the search row: a result count (`useCommandState` from `cmdk`) and key
 * hints. `Kbd`s on it are raised, so they read on the fill. Copy is the caller's.
 */
function CommandFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='command-footer'
      className={cn(
        'flex h-(--command-footer-height) shrink-0 items-center justify-between gap-group border-t bg-muted px-[calc(var(--spacing-list-inset)+var(--spacing-row-pad-x))] text-caption text-muted-foreground',
        '**:data-[slot=kbd]:bg-card **:data-[slot=kbd]:shadow-raised dark:**:data-[slot=kbd]:bg-foreground/10',
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
