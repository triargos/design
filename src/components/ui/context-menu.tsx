import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
import { type VariantProps, cva } from 'class-variance-authority';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import * as React from 'react';

import { popupSurface } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot='context-menu' {...props} />;
}

function ContextMenuPortal({ ...props }: ContextMenuPrimitive.Portal.Props) {
  return <ContextMenuPrimitive.Portal data-slot='context-menu-portal' {...props} />;
}

function ContextMenuTrigger({ ...props }: ContextMenuPrimitive.Trigger.Props) {
  return <ContextMenuPrimitive.Trigger data-slot='context-menu-trigger' {...props} />;
}

function ContextMenuContent({
  className,
  align = 'start',
  alignOffset = 4,
  side = 'right',
  sideOffset = 0,
  ...props
}: ContextMenuPrimitive.Popup.Props &
  Pick<ContextMenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        className='isolate z-50 outline-none'
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}>
        <ContextMenuPrimitive.Popup
          data-slot='context-menu-content'
          data-surface='popup'
          className={cn(
            popupSurface,
            'z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto p-1 duration-enter ease-enter outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuGroup({ ...props }: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot='context-menu-group' {...props} />;
}

/** Plain heading: Base UI's GroupLabel must sit inside a Group, which call sites do not use. */
function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<'div'> & {
  inset?: boolean;
}) {
  return (
    <div
      data-slot='context-menu-label'
      data-inset={inset}
      className={cn('px-2.5 py-1.5 text-body font-medium text-foreground data-inset:pl-8.5', className)}
      {...props}
    />
  );
}

function ContextMenuItem({
  className,
  inset,
  intent = 'neutral',
  ...props
}: ContextMenuPrimitive.Item.Props & {
  inset?: boolean;
  intent?: 'neutral' | 'destructive';
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot='context-menu-item'
      data-inset={inset}
      data-intent={intent}
      className={cn(
        "group/context-menu-item relative flex cursor-default items-center gap-2 rounded-inner px-2.5 py-2 text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground data-inset:pl-8.5 data-[intent=destructive]:text-destructive data-[intent=destructive]:data-highlighted:bg-destructive-subtle data-[intent=destructive]:data-highlighted:text-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[intent=destructive]:*:[svg]:text-destructive!",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSub({ ...props }: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot='context-menu-sub' {...props} />;
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot='context-menu-sub-trigger'
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-inner px-2.5 py-2 text-control outline-hidden select-none data-highlighted:bg-foreground/6 data-highlighted:text-foreground data-inset:pl-8.5 data-popup-open:bg-foreground/6 data-popup-open:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}>
      {children}
      <ChevronRightIcon className='ml-auto' />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent({ ...props }: React.ComponentProps<typeof ContextMenuContent>) {
  return <ContextMenuContent data-slot='context-menu-sub-content' side='right' {...props} />;
}

/**
 * - `default`: a row with a check in the left gutter.
 * - `icon`: an icon-only toggle for a row of toggles; checked shows as a soft fill instead of a check. Give it an
 *   `aria-label`.
 */
const contextMenuCheckboxItemVariants = cva(
  "relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'gap-2 rounded-inner py-2 pr-2.5 pl-8.5 text-control',
        icon: 'h-9 flex-1 justify-center rounded-inner text-muted-foreground data-checked:bg-foreground/8 data-checked:text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  closeOnClick = true,
  variant = 'default',
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props & VariantProps<typeof contextMenuCheckboxItemVariants>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot='context-menu-checkbox-item'
      closeOnClick={closeOnClick}
      className={cn(contextMenuCheckboxItemVariants({ variant }), className)}
      checked={checked}
      {...props}>
      {variant === 'default' && (
        <span className='pointer-events-none absolute left-2.5 flex size-4 items-center justify-center'>
          <ContextMenuPrimitive.CheckboxItemIndicator>
            <CheckIcon className='size-4' />
          </ContextMenuPrimitive.CheckboxItemIndicator>
        </span>
      )}
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioGroup({ ...props }: ContextMenuPrimitive.RadioGroup.Props) {
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
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-inner py-2 pr-2.5 pl-8.5 text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
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
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
