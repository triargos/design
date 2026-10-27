import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';

import {
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem,
  DropdownMenuGroup as ContextMenuGroup,
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuRadioGroup as ContextMenuRadioGroup,
  DropdownMenuRadioItem as ContextMenuRadioItem,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuShortcut as ContextMenuShortcut,
  DropdownMenuSub as ContextMenuSub,
  DropdownMenuSubTrigger as ContextMenuSubTrigger,
  MenuSlotContext,
  menuPopupClassName,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';

/** A `DropdownMenu` that opens at the pointer: its rows are the dropdown's, as `context-menu-*` slots. */
function ContextMenu(props: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot='context-menu' {...props} />;
}

function ContextMenuTrigger(props: ContextMenuPrimitive.Trigger.Props) {
  return <ContextMenuPrimitive.Trigger data-slot='context-menu-trigger' {...props} />;
}

/** Opens at the pointer; a submenu (`ContextMenuSubContent`) opens beside its trigger. */
function ContextMenuContent({
  className,
  container,
  ...props
}: ContextMenuPrimitive.Popup.Props & Pick<ContextMenuPrimitive.Portal.Props, 'container'>) {
  return (
    <MenuSlotContext value='context-menu'>
      <ContextMenuPrimitive.Portal container={container}>
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
            className={cn(menuPopupClassName, className)}
            {...props}
          />
        </ContextMenuPrimitive.Positioner>
      </ContextMenuPrimitive.Portal>
    </MenuSlotContext>
  );
}

function ContextMenuSubContent(props: ContextMenuPrimitive.Popup.Props) {
  return <ContextMenuContent data-slot='context-menu-sub-content' {...props} />;
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
