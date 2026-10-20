import { popupItem, popupMotion, popupSurface } from '~/components/ui/popover';

/** The parts `DropdownMenu` and `ContextMenu` share: one menu, opened from a button or with a right click. */

export const menuContent = `${popupSurface} ${popupMotion} max-h-(--available-height) min-w-32 overflow-x-hidden overflow-y-auto p-1 outline-none`;

export const menuItem = `${popupItem} px-2.5`;

/** `intent='destructive'`: the item and its icon take the destructive hue; highlighted, its subtle fill. */
export const menuItemDestructive =
  'text-destructive data-highlighted:bg-destructive-subtle data-highlighted:text-destructive *:[svg]:text-destructive!';

/** A submenu trigger stays highlighted while its submenu is open. */
export const menuSubTrigger = `${menuItem} data-popup-open:bg-foreground/6 data-popup-open:text-foreground`;

/** Checkbox and radio items: the check or dot sits in the left gutter (`menuIndicator`). */
export const menuIndicatorItem = `${popupItem} pr-2.5 pl-8.5`;

export const menuIndicator = 'pointer-events-none absolute left-2.5 flex size-4 items-center justify-center';

export const menuLabel = 'px-2.5 py-1.5 text-body font-medium';

export const menuSeparator = '-mx-1 my-1 h-px bg-border';

export const menuShortcut = 'ml-auto text-caption tracking-widest text-faint-foreground';
