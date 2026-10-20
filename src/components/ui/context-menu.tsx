import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import * as React from 'react';

import { popupSurface } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

const itemBaseClassName =
  "relative flex cursor-default items-center gap-2 rounded-inner py-2 text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
/** Items and submenu triggers: icons muted unless they set a color; `data-inset` lines the text up with the gutter. */
const itemClassName = `${itemBaseClassName} px-2.5 data-inset:pl-8.5 [&_svg:not([class*='text-'])]:text-muted-foreground`;
/** Checkbox and radio items: the indicator sits in the left gutter. */
const indicatorItemClassName = `${itemBaseClassName} pr-2.5 pl-8.5`;
/**
 * - `default`: a row with a check in the left gutter.
 * - `icon`: an icon-only toggle for a row of toggles; checked shows as a soft fill instead of a check. Give it an
 *   `aria-label`.
 */
const checkboxItemVariants = cva('', {
  variants: {
    variant: {
      default: indicatorItemClassName,
      icon: "relative flex h-9 flex-1 cursor-default items-center justify-center rounded-inner text-muted-foreground outline-hidden select-none data-checked:bg-foreground/8 data-checked:text-foreground data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    },
  },
  defaultVariants: { variant: 'default' },
});
const indicatorClassName = 'pointer-events-none absolute left-2.5 flex size-4 items-center justify-center';

function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot='context-menu' {...props} />;
}

function ContextMenuTrigger(props: ContextMenuPrimitive.Trigger.Props) {
  return <ContextMenuPrimitive.Trigger data-slot='context-menu-trigger' {...props} />;
}

function ContextMenuContent({
  className,
  // Explicit: without `side`, Base UI shifts a context menu by its own offsets.
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
            'max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto p-1 duration-enter ease-enter outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
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

/** A plain heading: Base UI's `GroupLabel` must sit inside a `Group`, which call sites do not use. */
function ContextMenuLabel({ className, inset, ...props }: React.ComponentProps<'div'> & { inset?: boolean }) {
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
        itemClassName,
        'data-[intent=destructive]:text-destructive data-[intent=destructive]:data-highlighted:bg-destructive-subtle data-[intent=destructive]:data-highlighted:text-destructive data-[intent=destructive]:*:[svg]:text-destructive!',
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSub(props: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot='context-menu-sub' {...props} />;
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot='context-menu-sub-trigger'
      data-inset={inset}
      className={cn(itemClassName, 'data-popup-open:bg-foreground/6 data-popup-open:text-foreground', className)}
      {...props}>
      {children}
      <ChevronRightIcon className='ml-auto' />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent(props: React.ComponentProps<typeof ContextMenuContent>) {
  return <ContextMenuContent data-slot='context-menu-sub-content' {...props} />;
}

function ContextMenuCheckboxItem({
  className,
  children,
  closeOnClick = true,
  variant = 'default',
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props & VariantProps<typeof checkboxItemVariants>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot='context-menu-checkbox-item'
      closeOnClick={closeOnClick}
      className={cn(checkboxItemVariants({ variant }), className)}
      {...props}>
      {variant === 'default' && (
        <span className={indicatorClassName}>
          <ContextMenuPrimitive.CheckboxItemIndicator>
            <CheckIcon className='size-4' />
          </ContextMenuPrimitive.CheckboxItemIndicator>
        </span>
      )}
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
      className={cn(indicatorItemClassName, className)}
      {...props}>
      <span className={indicatorClassName}>
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
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
