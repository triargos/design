import type { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { type ComponentProps, type ReactNode, createContext, use, useState } from 'react';

import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer';

import { cn } from '~/lib/utils';

/** Picking an item closes the menu's drawer, nested ones with it. */
const CloseMenuContext = createContext<() => void>(() => {});

const itemClassName = 'flex w-full items-center gap-2 rounded-control-lg bg-muted p-3 text-left font-medium';

function MobileDropdownMenu({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CloseMenuContext value={() => setOpen(false)}>
      <Drawer open={open} onOpenChange={setOpen}>
        {children}
      </Drawer>
    </CloseMenuContext>
  );
}

const MobileDropdownMenuTrigger = DrawerTrigger;

/** The drawer's name for screen readers and its scrolling item list. */
function MenuDrawerBody({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <>
      <div className='sr-only'>
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
      </div>
      <div className='scrollbar-hide flex min-h-0 flex-col gap-2 overflow-y-auto'>{children}</div>
    </>
  );
}

function MobileDropdownMenuContent({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <DrawerContent className={cn('h-max max-h-[95%] min-h-[65%] space-y-2 p-4', className)}>
      <MenuDrawerBody title='Dropdown menu' description='Select options from the dropdown menu'>
        {children}
      </MenuDrawerBody>
    </DrawerContent>
  );
}

/** A submenu is a drawer nested in the menu's. */
const MobileDropdownMenuSub = Drawer;

function MobileDropdownMenuSubTrigger({ className, ...props }: ComponentProps<typeof DrawerTrigger>) {
  return <DrawerTrigger {...props} className={cn(itemClassName, className)} />;
}

function MobileDropdownMenuSubContent({ children }: { children?: ReactNode }) {
  return (
    <DrawerContent className='h-max max-h-[95%] min-h-[55%] space-y-2 p-2'>
      <MenuDrawerBody title='Sub Dropdown' description='Select options from the sub dropdown menu'>
        {children}
      </MenuDrawerBody>
    </DrawerContent>
  );
}

function MobileDropdownMenuItem({
  className,
  children,
  onClick,
}: Pick<MenuPrimitive.Item.Props, 'onClick' | 'children'> & { className?: string }) {
  const close = use(CloseMenuContext);
  return (
    <div
      role='menuitem'
      tabIndex={-1}
      onClick={(event) => {
        // Menu item handlers expect Base UI's event shape; there is no Base UI handler to prevent here.
        onClick?.(Object.assign(event, { preventBaseUIHandler: () => {} }));
        close();
      }}
      className={cn(itemClassName, className)}>
      {children}
    </div>
  );
}

export {
  MobileDropdownMenu,
  MobileDropdownMenuContent,
  MobileDropdownMenuItem,
  MobileDropdownMenuSub,
  MobileDropdownMenuSubContent,
  MobileDropdownMenuSubTrigger,
  MobileDropdownMenuTrigger,
};
