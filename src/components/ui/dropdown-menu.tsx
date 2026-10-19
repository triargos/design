import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import * as React from 'react';

import {
  MobileDropdownMenu,
  MobileDropdownMenuContent,
  MobileDropdownMenuItem,
  MobileDropdownMenuSub,
  MobileDropdownMenuSubContent,
  MobileDropdownMenuSubTrigger,
  MobileDropdownMenuTrigger,
} from '~/components/ui/mobile-dropdown-menu';
import { popupSurface } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener('change', onChange);
    setValue(result.matches);

    return () => result.removeEventListener('change', onChange);
  }, [query]);

  return value;
}

type DropdownMenuContextType = {
  isDesktop: boolean;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('useDropdownMenuContext must be used within a DropdownMenu');
  }
  return context;
}

/** Below 768px the menu renders as a bottom drawer; parts that also render there take string class names. */
type WithStringClassName<Props> = Omit<Props, 'className'> & { className?: string };

function DropdownMenu({
  children,
  ...props
}: Omit<MenuPrimitive.Root.Props, 'children'> & { children?: React.ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <DropdownMenuContext.Provider value={{ isDesktop }}>
      {isDesktop ? (
        <MenuPrimitive.Root data-slot='dropdown-menu' {...props}>
          {children}
        </MenuPrimitive.Root>
      ) : (
        <MobileDropdownMenu>{children}</MobileDropdownMenu>
      )}
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  className,
  render,
  nativeButton,
  children,
  ...props
}: WithStringClassName<Omit<MenuPrimitive.Trigger.Props, 'render'>> & { render?: React.ReactElement }) {
  const { isDesktop } = useDropdownMenuContext();
  if (isDesktop) {
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
  return (
    <MobileDropdownMenuTrigger className={className} render={render} nativeButton={nativeButton}>
      {children}
    </MobileDropdownMenuTrigger>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot='dropdown-menu-group' {...props} />;
}

function DropdownMenuSub({
  children,
  ...props
}: Omit<MenuPrimitive.SubmenuRoot.Props, 'children'> & { children?: React.ReactNode }) {
  const { isDesktop } = useDropdownMenuContext();
  if (isDesktop) {
    return (
      <MenuPrimitive.SubmenuRoot data-slot='dropdown-menu-sub' {...props}>
        {children}
      </MenuPrimitive.SubmenuRoot>
    );
  }
  return <MobileDropdownMenuSub>{children}</MobileDropdownMenuSub>;
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot='dropdown-menu-radio-group' {...props} />;
}

const itemClassName =
  "relative flex cursor-default items-center gap-2 rounded-inner px-2.5 py-2 text-control outline-hidden select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const mobileItemClassName = '[&>svg]:size-4';
/** `intent='destructive'`: the item and its icon take the destructive hue; highlighted, its subtle fill. */
const destructiveItemClassName =
  'text-destructive data-highlighted:bg-destructive-subtle data-highlighted:text-destructive *:[svg]:text-destructive!';

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: WithStringClassName<MenuPrimitive.SubmenuTrigger.Props> & {
  inset?: boolean;
}) {
  const { isDesktop } = useDropdownMenuContext();
  if (isDesktop) {
    return (
      <MenuPrimitive.SubmenuTrigger
        data-slot='dropdown-menu-sub-trigger'
        className={cn(
          itemClassName,
          'data-popup-open:bg-foreground/6 data-popup-open:text-foreground',
          inset && 'pl-8.5',
          className,
        )}
        {...props}>
        {children}
        <ChevronRightIcon className='ml-auto' />
      </MenuPrimitive.SubmenuTrigger>
    );
  }
  return (
    <MobileDropdownMenuSubTrigger className={cn(mobileItemClassName, className)}>
      {children}
    </MobileDropdownMenuSubTrigger>
  );
}

const contentClassName =
  'z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto p-1 duration-enter ease-enter outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2';

type DropdownMenuContentProps = WithStringClassName<MenuPrimitive.Popup.Props> &
  Pick<MenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>;

function DropdownMenuContent({
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { isDesktop } = useDropdownMenuContext();
  if (isDesktop) {
    return (
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          className='isolate z-50 outline-none'
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}>
          <MenuPrimitive.Popup
            data-slot='dropdown-menu-content'
            data-surface='popup'
            className={cn(popupSurface, contentClassName, className)}
            {...props}>
            {children}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    );
  }
  return <MobileDropdownMenuContent className={className}>{children}</MobileDropdownMenuContent>;
}

function DropdownMenuSubContent({
  align = 'start',
  alignOffset = -4,
  side = 'right',
  sideOffset = 0,
  className,
  children,
  ...props
}: DropdownMenuContentProps) {
  const { isDesktop } = useDropdownMenuContext();
  if (isDesktop) {
    return (
      <DropdownMenuContent
        data-slot='dropdown-menu-sub-content'
        className={className}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        {...props}>
        {children}
      </DropdownMenuContent>
    );
  }
  return <MobileDropdownMenuSubContent>{children}</MobileDropdownMenuSubContent>;
}

function DropdownMenuItem({
  className,
  inset,
  intent = 'neutral',
  children,
  onClick,
  ...props
}: WithStringClassName<MenuPrimitive.Item.Props> & {
  inset?: boolean;
  intent?: 'neutral' | 'destructive';
}) {
  const { isDesktop } = useDropdownMenuContext();
  const intentClassName = intent === 'destructive' && destructiveItemClassName;
  if (isDesktop) {
    return (
      <MenuPrimitive.Item
        data-slot='dropdown-menu-item'
        data-intent={intent}
        className={cn(itemClassName, 'group', inset && 'pl-8.5', intentClassName, className)}
        onClick={onClick}
        {...props}>
        {children}
      </MenuPrimitive.Item>
    );
  }
  return (
    <MobileDropdownMenuItem className={cn(mobileItemClassName, 'group', intentClassName, className)} onClick={onClick}>
      {children}
    </MobileDropdownMenuItem>
  );
}

const indicatorItemClassName =
  'relative flex cursor-default items-center rounded-inner py-2 pr-2.5 pl-8.5 text-control outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:text-disabled-foreground data-highlighted:bg-foreground/6 data-highlighted:text-foreground';

function DropdownMenuCheckboxItem({
  className,
  children,
  closeOnClick = true,
  ...props
}: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot='dropdown-menu-checkbox-item'
      className={cn(indicatorItemClassName, className)}
      closeOnClick={closeOnClick}
      {...props}>
      <span className='absolute left-2.5 flex size-4 items-center justify-center'>
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon className='size-4' />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({ className, children, closeOnClick = true, ...props }: MenuPrimitive.RadioItem.Props) {
  return (
    <MenuPrimitive.RadioItem
      data-slot='dropdown-menu-radio-item'
      className={cn(indicatorItemClassName, className)}
      closeOnClick={closeOnClick}
      {...props}>
      <span className='absolute left-2.5 flex size-4 items-center justify-center'>
        <MenuPrimitive.RadioItemIndicator>
          <CircleIcon className='size-2 fill-current' />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  );
}

/** Plain heading: Base UI's GroupLabel must sit inside a Group, which call sites do not use. */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<'div'> & {
  inset?: boolean;
}) {
  return (
    <div
      data-slot='dropdown-menu-label'
      className={cn('px-2.5 py-1.5 text-body font-medium', inset && 'pl-8.5', className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot='dropdown-menu-separator'
      className={cn('-mx-2 my-4 h-px sm:my-1 sm:bg-border', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='dropdown-menu-shortcut'
      className={cn('ml-auto text-caption tracking-widest text-faint-foreground', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
