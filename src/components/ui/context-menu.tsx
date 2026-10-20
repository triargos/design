import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '~/lib/utils';

/**
 * A row in the menu, highlighted by pointer or keyboard, `rounded-inner` 4px in; icons muted unless they set a color
 * (not the check or dot). `indicator` leaves the left gutter for a check or dot. `destructive`: the row and its icon
 * take the destructive hue; highlighted, its subtle fill.
 */
const contextMenuItemVariants = cva(
  "relative flex cursor-default items-center gap-2 rounded-inner py-2 text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      intent: {
        neutral: '',
        destructive:
          'text-destructive data-highlighted:bg-destructive-subtle data-highlighted:text-destructive *:[svg]:text-destructive!',
      },
      indicator: { false: 'px-2.5', true: 'pr-2.5 pl-8.5' },
    },
    compoundVariants: [
      { intent: 'neutral', indicator: false, className: "[&_svg:not([class*='text-'])]:text-muted-foreground" },
    ],
    defaultVariants: { intent: 'neutral', indicator: false },
  },
);

function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot='context-menu' {...props} />;
}

function ContextMenuTrigger(props: ContextMenuPrimitive.Trigger.Props) {
  return <ContextMenuPrimitive.Trigger data-slot='context-menu-trigger' {...props} />;
}

/** Opens at the pointer; a submenu (`ContextMenuSubContent`) opens beside its trigger. */
function ContextMenuContent({ className, ...props }: ContextMenuPrimitive.Popup.Props) {
  return (
    <ContextMenuPrimitive.Portal>
      {/* Explicit: without `side`, Base UI shifts a context menu by its own offsets. */}
      <ContextMenuPrimitive.Positioner
        className='isolate z-50 outline-none'
        align='start'
        alignOffset={4}
        side='right'
        sideOffset={0}>
        <ContextMenuPrimitive.Popup
          data-slot='context-menu-content'
          data-surface='popup'
          className={cn(
            'max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-popup bg-popover p-1 text-popover-foreground shadow-popup outline-none [--outer-inset:--spacing(1)] [--outer-radius:var(--radius-popup)]',
            'duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuGroup(props: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot='context-menu-group' {...props} />;
}

/** A plain heading: Base UI's `GroupLabel` must sit inside a `Group`, which call sites do not always use. */
function ContextMenuLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='context-menu-label'
      className={cn('px-2.5 pt-2 pb-1 text-overline text-muted-foreground', className)}
      {...props}
    />
  );
}

function ContextMenuItem({
  className,
  intent = 'neutral',
  ...props
}: ContextMenuPrimitive.Item.Props & { intent?: 'neutral' | 'destructive' }) {
  return (
    <ContextMenuPrimitive.Item
      data-slot='context-menu-item'
      data-intent={intent}
      className={cn(contextMenuItemVariants({ intent }), className)}
      {...props}
    />
  );
}

function ContextMenuSub(props: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot='context-menu-sub' {...props} />;
}

function ContextMenuSubTrigger({ className, children, ...props }: ContextMenuPrimitive.SubmenuTrigger.Props) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot='context-menu-sub-trigger'
      className={cn(
        contextMenuItemVariants(),
        'data-popup-open:bg-foreground/6 data-popup-open:text-foreground',
        className,
      )}
      {...props}>
      {children}
      <ChevronRightIcon className='ml-auto' />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent(props: ContextMenuPrimitive.Popup.Props) {
  return <ContextMenuContent data-slot='context-menu-sub-content' {...props} />;
}

function ContextMenuCheckboxItem({
  className,
  children,
  closeOnClick = true,
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot='context-menu-checkbox-item'
      closeOnClick={closeOnClick}
      className={cn(contextMenuItemVariants({ indicator: true }), className)}
      {...props}>
      <span className='pointer-events-none absolute left-2.5 flex size-4 items-center justify-center'>
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioGroup(props: ContextMenuPrimitive.RadioGroup.Props) {
  return <ContextMenuPrimitive.RadioGroup data-slot='context-menu-radio-group' {...props} />;
}

function ContextMenuRadioItem({
  className,
  children,
  closeOnClick = true,
  ...props
}: ContextMenuPrimitive.RadioItem.Props) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot='context-menu-radio-item'
      closeOnClick={closeOnClick}
      className={cn(contextMenuItemVariants({ indicator: true }), className)}
      {...props}>
      <span className='pointer-events-none absolute left-2.5 flex size-4 items-center justify-center'>
        <ContextMenuPrimitive.RadioItemIndicator>
          <CircleIcon className='size-2 fill-current' />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuSeparator({ className, ...props }: ContextMenuPrimitive.Separator.Props) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot='context-menu-separator'
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='context-menu-shortcut'
      className={cn('ml-auto text-caption tracking-widest text-faint-foreground', className)}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
