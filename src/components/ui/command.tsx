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
 * Rows sit 8px in (`CommandList`'s `p-2`), so `rounded-inner` is the surface's radius less 8px: 8px inline (a popup's 16px,
 * like a card's content), 12px in `CommandDialog` (the dialog's 20px).
 */
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot='command'
      className={cn(
        'flex size-full flex-col overflow-hidden bg-transparent text-popover-foreground [--outer-inset:--spacing(2)] [--outer-radius:var(--radius-popup)] in-data-[slot=dialog-content]:[--outer-radius:var(--radius-dialog)]',
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
    <div data-slot='command-input-wrapper' className='flex h-12 shrink-0 items-center gap-2.5 border-b px-5'>
      <IconSearch aria-hidden className='size-4 shrink-0 text-muted-foreground' />
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
      className={cn('no-scrollbar max-h-96 scroll-py-2 overflow-x-hidden overflow-y-auto p-2 outline-none', className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot='command-empty'
      className={cn('py-6 text-center text-body', className)}
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
        'overflow-hidden text-foreground [[cmdk-group]:not([hidden])~&:not([cmdk-separator]+&)]:pt-2 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:pt-1.5 **:[[cmdk-group-heading]]:pb-1.5 **:[[cmdk-group-heading]]:text-caption **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground',
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
      className={cn('-mx-2 my-2 h-px bg-border', className)}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot='command-item'
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-inner px-3 py-2.5 text-control outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:text-disabled-foreground data-[selected=true]:bg-foreground/6 data-[selected=true]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[selected=true]:*:[svg]:text-foreground",
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
        'flex h-11 shrink-0 items-center justify-between gap-4 border-t bg-muted px-5 text-caption text-muted-foreground',
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
