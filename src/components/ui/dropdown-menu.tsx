import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import * as React from 'react';

import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer';
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

import { useIsMobile } from '~/hooks/use-mobile';
import { cn } from '~/lib/utils';

/**
 * Below 768px the menu opens as a bottom drawer: every part reads `IsMobileMenu` and renders its drawer version, a
 * button row instead of a Base UI menu item. Picking a row closes the drawer (`CloseMenu`), nested ones with it.
 */
const IsMobileMenu = React.createContext(false);
const CloseMenu = React.createContext<() => void>(() => {});
/** The radio group's value, for the drawer's radio rows (Base UI's menu context is not there). */
const MobileRadioGroup = React.createContext<{ value: string; onValueChange: (value: string) => void } | null>(null);

const mobileItem =
  'flex w-full items-center gap-2 rounded-control-lg bg-muted p-3 text-left font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/24 disabled:text-disabled-foreground [&>svg]:size-4 [&>svg]:shrink-0';
const mobileList = 'no-scrollbar flex min-h-0 flex-col gap-2 overflow-y-auto';

function DropdownMenu({
  children,
  ...props
}: Omit<MenuPrimitive.Root.Props, 'children'> & { children?: React.ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <IsMobileMenu value={isMobile}>
      {isMobile ? (
        <MenuDrawer>{children}</MenuDrawer>
      ) : (
        <MenuPrimitive.Root data-slot='dropdown-menu' {...props}>
          {children}
        </MenuPrimitive.Root>
      )}
    </IsMobileMenu>
  );
}

function MenuDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <CloseMenu value={() => setOpen(false)}>
      <Drawer open={open} onOpenChange={setOpen}>
        {children}
      </Drawer>
    </CloseMenu>
  );
}

function DropdownMenuTrigger({
  className,
  render,
  nativeButton,
  children,
  ...props
}: Omit<MenuPrimitive.Trigger.Props, 'render' | 'className'> & { className?: string; render?: React.ReactElement }) {
  if (React.use(IsMobileMenu)) {
    return (
      <DrawerTrigger className={className} render={render} nativeButton={nativeButton}>
        {children}
      </DrawerTrigger>
    );
  }
  return (
    <MenuPrimitive.Trigger
      data-slot='dropdown-menu-trigger'
      className={className}
      render={render}
      nativeButton={nativeButton}
      {...props}>
      {children}
    </MenuPrimitive.Trigger>
  );
}

interface DropdownMenuContentProps {
  align?: MenuPrimitive.Positioner.Props['align'];
  side?: MenuPrimitive.Positioner.Props['side'];
  /** The drawer's accessible name below 768px. */
  label?: string;
  /** For the desktop popup (its width); the drawer ignores it. */
  className?: string;
  children?: React.ReactNode;
}

function DropdownMenuContent({
  // Explicit: Base UI infers different defaults when a menu sits in another menu or a context menu.
  align = 'center',
  side = 'bottom',
  label = 'Menu',
  className,
  children,
}: DropdownMenuContentProps) {
  if (React.use(IsMobileMenu)) {
    return (
      // `className` sizes the desktop popup (`w-56`); the drawer is always full width.
      <DrawerContent className='h-max max-h-[95%] min-h-[65%] space-y-2 p-4'>
        <DrawerTitle className='sr-only'>{label}</DrawerTitle>
        <div className={mobileList}>{children}</div>
      </DrawerContent>
    );
  }
  return (
    <MenuPopup
      slot='dropdown-menu-content'
      align={align}
      alignOffset={0}
      side={side}
      sideOffset={4}
      className={className}>
      {children}
    </MenuPopup>
  );
}

function MenuPopup({
  slot,
  className,
  children,
  ...position
}: Pick<MenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'> & {
  slot: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className='isolate z-50 outline-none' {...position}>
        <MenuPrimitive.Popup data-slot={slot} data-surface='popup' className={cn(menuContent, className)}>
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

interface DropdownMenuItemProps {
  intent?: 'neutral' | 'destructive';
  disabled?: boolean;
  /** Picking it closes the menu. */
  closeOnClick?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  children?: React.ReactNode;
}

function DropdownMenuItem({
  intent = 'neutral',
  disabled,
  closeOnClick = true,
  onClick,
  className,
  children,
}: DropdownMenuItemProps) {
  const close = React.use(CloseMenu);
  const intentClassName = intent === 'destructive' && menuItemDestructive;
  if (React.use(IsMobileMenu)) {
    return (
      <button
        type='button'
        disabled={disabled}
        className={cn(mobileItem, intentClassName, className)}
        onClick={(event) => {
          onClick?.(event);
          if (closeOnClick) close();
        }}>
        {children}
      </button>
    );
  }
  return (
    <MenuPrimitive.Item
      data-slot='dropdown-menu-item'
      data-intent={intent}
      disabled={disabled}
      closeOnClick={closeOnClick}
      onClick={onClick}
      className={cn(menuItem, intentClassName, className)}>
      {children}
    </MenuPrimitive.Item>
  );
}

interface DropdownMenuCheckboxItemProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Toggling it closes the menu. */
  closeOnClick?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function DropdownMenuCheckboxItem({
  checked,
  onCheckedChange,
  disabled,
  closeOnClick = true,
  className,
  children,
}: DropdownMenuCheckboxItemProps) {
  const close = React.use(CloseMenu);
  if (React.use(IsMobileMenu)) {
    return (
      <button
        type='button'
        role='checkbox'
        aria-checked={checked}
        disabled={disabled}
        className={cn(mobileItem, className)}
        onClick={() => {
          onCheckedChange?.(!checked);
          if (closeOnClick) close();
        }}>
        {children}
        {checked && <CheckIcon className='ml-auto' />}
      </button>
    );
  }
  return (
    <MenuPrimitive.CheckboxItem
      data-slot='dropdown-menu-checkbox-item'
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      closeOnClick={closeOnClick}
      className={cn(menuIndicatorItem, className)}>
      <span className={menuIndicator}>
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children?: React.ReactNode;
}) {
  if (React.use(IsMobileMenu)) {
    return (
      <MobileRadioGroup value={{ value, onValueChange }}>
        <div role='radiogroup' className='flex flex-col gap-2'>
          {children}
        </div>
      </MobileRadioGroup>
    );
  }
  return (
    <MenuPrimitive.RadioGroup data-slot='dropdown-menu-radio-group' value={value} onValueChange={onValueChange}>
      {children}
    </MenuPrimitive.RadioGroup>
  );
}

function DropdownMenuRadioItem({
  value,
  disabled,
  closeOnClick = true,
  className,
  children,
}: {
  value: string;
  disabled?: boolean;
  /** Picking it closes the menu. */
  closeOnClick?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const close = React.use(CloseMenu);
  const group = React.use(MobileRadioGroup);
  if (React.use(IsMobileMenu)) {
    const checked = group?.value === value;
    return (
      <button
        type='button'
        role='radio'
        aria-checked={checked}
        disabled={disabled}
        className={cn(mobileItem, className)}
        onClick={() => {
          group?.onValueChange(value);
          if (closeOnClick) close();
        }}>
        {children}
        {checked && <CircleIcon className='ml-auto size-2! fill-current' />}
      </button>
    );
  }
  return (
    <MenuPrimitive.RadioItem
      data-slot='dropdown-menu-radio-item'
      value={value}
      disabled={disabled}
      closeOnClick={closeOnClick}
      className={cn(menuIndicatorItem, className)}>
      <span className={menuIndicator}>
        <MenuPrimitive.RadioItemIndicator>
          <CircleIcon className='size-2 fill-current' />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

function DropdownMenuGroup({ className, children }: { className?: string; children?: React.ReactNode }) {
  if (React.use(IsMobileMenu)) {
    return (
      <div role='group' className={cn('flex flex-col gap-2', className)}>
        {children}
      </div>
    );
  }
  return (
    <MenuPrimitive.Group data-slot='dropdown-menu-group' className={className}>
      {children}
    </MenuPrimitive.Group>
  );
}

/** A plain heading: Base UI's `GroupLabel` must sit inside a `Group`, which call sites do not always use. */
function DropdownMenuLabel({ className, ...props }: React.ComponentProps<'div'>) {
  const isMobile = React.use(IsMobileMenu);
  return (
    <div
      data-slot='dropdown-menu-label'
      className={cn(isMobile ? 'px-3 pt-1 text-body font-medium text-muted-foreground' : menuLabel, className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  if (React.use(IsMobileMenu)) return <div role='separator' className={cn('mx-3 h-px bg-border', className)} />;
  return <MenuPrimitive.Separator data-slot='dropdown-menu-separator' className={cn(menuSeparator, className)} />;
}

/** The item's keyboard shortcut. Hidden in the drawer: a touch screen has no keyboard to press it on. */
function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  if (React.use(IsMobileMenu)) return null;
  return <span data-slot='dropdown-menu-shortcut' className={cn(menuShortcut, className)} {...props} />;
}

/** One level of submenu: beside the menu on desktop, a drawer stacked on the menu's below 768px. */
function DropdownMenuSub({ children }: { children?: React.ReactNode }) {
  if (React.use(IsMobileMenu)) return <Drawer>{children}</Drawer>;
  return <MenuPrimitive.SubmenuRoot data-slot='dropdown-menu-sub'>{children}</MenuPrimitive.SubmenuRoot>;
}

function DropdownMenuSubTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  if (React.use(IsMobileMenu)) {
    return (
      <DrawerTrigger className={cn(mobileItem, className)}>
        {children}
        <ChevronRightIcon className='ml-auto text-muted-foreground' />
      </DrawerTrigger>
    );
  }
  return (
    <MenuPrimitive.SubmenuTrigger data-slot='dropdown-menu-sub-trigger' className={cn(menuSubTrigger, className)}>
      {children}
      <ChevronRightIcon className='ml-auto' />
    </MenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  label = 'Menu',
  className,
  children,
}: Omit<DropdownMenuContentProps, 'align' | 'side'>) {
  if (React.use(IsMobileMenu)) {
    return (
      <DrawerContent className='h-max max-h-[95%] min-h-[55%] space-y-2 p-2'>
        <DrawerTitle className='sr-only'>{label}</DrawerTitle>
        <div className={mobileList}>{children}</div>
      </DrawerContent>
    );
  }
  return (
    <MenuPopup
      slot='dropdown-menu-sub-content'
      align='start'
      alignOffset={-4}
      side='right'
      sideOffset={0}
      className={className}>
      {children}
    </MenuPopup>
  );
}

export {
  DropdownMenu,
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
