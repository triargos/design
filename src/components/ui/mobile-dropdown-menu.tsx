import type { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { ComponentProps, ReactNode, createContext, useContext, useState } from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
  NestedDrawerRoot,
} from '~/components/ui/drawer.tsx';

import { cn } from '~/lib/utils';

type MobileDrawerContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MobileDrawerContext = createContext<MobileDrawerContextType | undefined>(undefined);

function useMobileDrawerContext() {
  const context = useContext(MobileDrawerContext);
  if (!context) {
    throw new Error('useMobileDrawerContext must be used within a MobileDrawer');
  }
  return context;
}

const MobileDropdownMenu = ({ children }: { children?: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <MobileDrawerContext.Provider value={{ open, setOpen }}>
      <Drawer open={open} onOpenChange={setOpen}>
        {children}
      </Drawer>
    </MobileDrawerContext.Provider>
  );
};
const MobileDropdownMenuTrigger = DrawerTrigger;
const MobileDropdownMenuContent = ({ className, children }: ComponentProps<typeof DrawerContent>) => {
  return (
    <DrawerContent className={cn('h-max max-h-[95%] min-h-[65%] space-y-2 p-4', className)}>
      <div className={'sr-only'}>
        <DrawerTitle>Dropdown menu</DrawerTitle>
        <DrawerDescription>Select options from the dropdown menu</DrawerDescription>
      </div>
      <div className='scrollbar-hide flex min-h-0 flex-col gap-2 overflow-y-auto'>{children}</div>
    </DrawerContent>
  );
};

const MobileDropdownMenuSub = ({ children }: { children?: ReactNode }) => (
  <NestedDrawerRoot>{children}</NestedDrawerRoot>
);
const MobileDropdownMenuSubTrigger = ({ className, ...props }: ComponentProps<typeof DrawerTrigger>) => {
  return (
    <DrawerTrigger
      {...props}
      className={cn('flex w-full items-center gap-2 rounded-control-lg bg-muted p-3 text-left font-medium', className)}
    />
  );
};
const MobileDropdownMenuSubContent = ({ children }: { children?: ReactNode }) => {
  return (
    <DrawerContent className='h-max max-h-[95%] min-h-[55%] space-y-2 p-2'>
      <div className={'sr-only'}>
        <DrawerTitle>Sub Dropdown</DrawerTitle>
        <DrawerDescription>Select options from the sub dropdown menu</DrawerDescription>
      </div>
      <div className='scrollbar-hide flex min-h-0 flex-col gap-2 overflow-y-auto'>{children}</div>
    </DrawerContent>
  );
};

interface MobileDropdownMenuItemProps {
  className?: string;
  children?: ReactNode;
  onClick?: MenuPrimitive.Item.Props['onClick'];
}

const MobileDropdownMenuItem = ({ className, children, onClick }: MobileDropdownMenuItemProps) => {
  const { setOpen } = useMobileDrawerContext();

  return (
    <div
      role={'menuitem'}
      tabIndex={-1}
      onClick={(event) => {
        // Menu item handlers expect Base UI's event shape; there is no Base UI handler to prevent here.
        onClick?.(Object.assign(event, { preventBaseUIHandler: () => {} }));
        setOpen(false);
      }}
      className={cn('flex w-full items-center gap-2 rounded-control-lg bg-muted p-3 text-left font-medium', className)}>
      {children}
    </div>
  );
};

export {
  MobileDropdownMenu,
  MobileDropdownMenuContent,
  MobileDropdownMenuItem,
  MobileDropdownMenuSub,
  MobileDropdownMenuSubContent,
  MobileDropdownMenuSubTrigger,
  MobileDropdownMenuTrigger,
};
