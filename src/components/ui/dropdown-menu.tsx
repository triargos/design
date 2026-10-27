import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { cva } from 'class-variance-authority';
import { IconCheck, IconChevronRight, IconCircle } from '@tabler/icons-react';
import * as React from 'react';

import { cn } from '~/lib/utils';

/**
 * A row in the menu, highlighted by pointer or keyboard, `rounded-inner` (`popup-inset` in); icons muted unless they set
 * a color (not the check or dot). `indicator` leaves the left gutter for a check or dot. `destructive`: the row and its
 * icon take the destructive hue; highlighted, its subtle fill.
 */
const dropdownMenuItemVariants = cva(
  "relative flex cursor-default items-center gap-row-gap rounded-inner py-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon",
  {
    variants: {
      intent: {
        neutral: '',
        destructive:
          'text-destructive data-highlighted:bg-destructive-subtle data-highlighted:text-destructive *:[svg]:text-destructive!',
      },
      indicator: {
        false: 'px-menu-item-pad',
        true: 'pr-menu-item-pad pl-[calc(var(--spacing-menu-item-pad)+var(--spacing-icon)+var(--spacing-row-gap))]',
      },
    },
    compoundVariants: [
      { intent: 'neutral', indicator: false, className: "[&_svg:not([class*='text-'])]:text-muted-foreground" },
    ],
    defaultVariants: { intent: 'neutral', indicator: false },
  },
);

/**
 * The `data-slot` prefix of the parts inside a menu: `ContextMenuContent` renders these same parts as `context-menu-*`.
 */
const MenuSlotContext = React.createContext<'dropdown-menu' | 'context-menu'>('dropdown-menu');

/** The menu popup; `ContextMenuContent` shares it. */
const menuPopupClassName = cn(
  'max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-popup bg-popover p-popup-inset text-popover-foreground shadow-popup outline-none [--outer-inset:var(--spacing-popup-inset)] [--outer-radius:var(--radius-popup)]',
  'duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  // Reduced motion: fade only, no zoom and no slide.
  'motion-reduce:data-closed:zoom-out-100 motion-reduce:data-open:zoom-in-100 motion-reduce:data-open:slide-in-from-top-0 motion-reduce:data-open:slide-in-from-left-0',
);

function DropdownMenu(props: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot='dropdown-menu' {...props} />;
}

function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot='dropdown-menu-trigger' {...props} />;
}

type DropdownMenuContentProps = MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'> &
  Pick<MenuPrimitive.Portal.Props, 'container'>;

function DropdownMenuContent({
  className,
  // Explicit: Base UI infers different defaults when a menu sits in another menu or a context menu.
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  container,
  ...props
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal container={container}>
      <MenuPrimitive.Positioner
        className='isolate z-50 outline-none'
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}>
        <MenuPrimitive.Popup
          data-slot='dropdown-menu-content'
          data-surface='popup'
          className={cn(menuPopupClassName, className)}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup(props: MenuPrimitive.Group.Props) {
  const slot = React.use(MenuSlotContext);
  return <MenuPrimitive.Group data-slot={`${slot}-group`} {...props} />;
}

/** A plain heading: Base UI's `GroupLabel` must sit inside a `Group`, which call sites do not always use. */
function DropdownMenuLabel({ className, ...props }: React.ComponentProps<'div'>) {
  const slot = React.use(MenuSlotContext);
  return (
    <div
      data-slot={`${slot}-label`}
      className={cn(
        'px-menu-item-pad pt-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/2)] pb-[calc((var(--spacing-menu-item)-var(--text-control--line-height))/4)] text-caption font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

/** A link item: `render={<a href='…' />}`. */
function DropdownMenuItem({
  className,
  intent = 'neutral',
  ...props
}: MenuPrimitive.Item.Props & { intent?: 'neutral' | 'destructive' }) {
  const slot = React.use(MenuSlotContext);
  return (
    <MenuPrimitive.Item
      data-slot={`${slot}-item`}
      data-intent={intent}
      className={cn(dropdownMenuItemVariants({ intent }), className)}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  closeOnClick = true,
  ...props
}: MenuPrimitive.CheckboxItem.Props) {
  const slot = React.use(MenuSlotContext);
  return (
    <MenuPrimitive.CheckboxItem
      data-slot={`${slot}-checkbox-item`}
      closeOnClick={closeOnClick}
      className={cn(dropdownMenuItemVariants({ indicator: true }), className)}
      {...props}>
      <span className='pointer-events-none absolute left-menu-item-pad flex size-icon items-center justify-center'>
        <MenuPrimitive.CheckboxItemIndicator>
          <IconCheck />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup(props: MenuPrimitive.RadioGroup.Props) {
  const slot = React.use(MenuSlotContext);
  return <MenuPrimitive.RadioGroup data-slot={`${slot}-radio-group`} {...props} />;
}

function DropdownMenuRadioItem({ className, children, closeOnClick = true, ...props }: MenuPrimitive.RadioItem.Props) {
  const slot = React.use(MenuSlotContext);
  return (
    <MenuPrimitive.RadioItem
      data-slot={`${slot}-radio-item`}
      closeOnClick={closeOnClick}
      className={cn(dropdownMenuItemVariants({ indicator: true }), className)}
      {...props}>
      <span className='pointer-events-none absolute left-menu-item-pad flex size-icon items-center justify-center'>
        <MenuPrimitive.RadioItemIndicator>
          <IconCircle className='size-2 fill-current' />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  const slot = React.use(MenuSlotContext);
  return (
    <MenuPrimitive.Separator
      data-slot={`${slot}-separator`}
      className={cn('-mx-popup-inset my-popup-inset h-px bg-border', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  const slot = React.use(MenuSlotContext);
  return (
    <span
      data-slot={`${slot}-shortcut`}
      className={cn('ml-auto text-caption tracking-widest text-faint-foreground', className)}
      {...props}
    />
  );
}

function DropdownMenuSub(props: MenuPrimitive.SubmenuRoot.Props) {
  const slot = React.use(MenuSlotContext);
  return <MenuPrimitive.SubmenuRoot data-slot={`${slot}-sub`} {...props} />;
}

function DropdownMenuSubTrigger({ className, children, ...props }: MenuPrimitive.SubmenuTrigger.Props) {
  const slot = React.use(MenuSlotContext);
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot={`${slot}-sub-trigger`}
      className={cn(
        dropdownMenuItemVariants(),
        'data-popup-open:bg-foreground/6 data-popup-open:text-foreground',
        className,
      )}
      {...props}>
      {children}
      <IconChevronRight className='ml-auto' />
    </MenuPrimitive.SubmenuTrigger>
  );
}

/** Beside its trigger, aligned with the first row. */
function DropdownMenuSubContent({
  align = 'start',
  alignOffset = -4,
  side = 'right',
  sideOffset = 0,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      data-slot='dropdown-menu-sub-content'
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  MenuSlotContext,
  menuPopupClassName,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
