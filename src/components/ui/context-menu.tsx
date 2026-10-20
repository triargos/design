import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import * as React from 'react';

import {
  menuContent,
  menuIndicator,
  menuIndicatorItem,
  menuItem,
  menuItemDestructive,
  menuLabel,
  menuSeparator,
  menuShortcut,
  menuSubTrigger,
} from '~/components/ui/menu';

import { cn } from '~/lib/utils';

/** Items and submenu triggers: icons muted unless they set a color. */
const mutedIcons = "[&_svg:not([class*='text-'])]:text-muted-foreground";

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
          className={cn(menuContent, className)}
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
  return <div data-slot='context-menu-label' className={cn(menuLabel, 'text-foreground', className)} {...props} />;
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
      className={cn(menuItem, mutedIcons, intent === 'destructive' && menuItemDestructive, className)}
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
      className={cn(menuSubTrigger, mutedIcons, className)}
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
      className={cn(menuIndicatorItem, className)}
      {...props}>
      <span className={menuIndicator}>
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
      className={cn(menuIndicatorItem, className)}
      {...props}>
      <span className={menuIndicator}>
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
      className={cn(menuSeparator, className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot='context-menu-shortcut' className={cn(menuShortcut, className)} {...props} />;
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
