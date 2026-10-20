import { FolderIcon, InboxIcon, SettingsIcon, UserPlusIcon } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '~/components/ui/command';
import { popupSurface } from '~/components/ui/popover';

import { cn } from '~/lib/utils';

/** `CommandGroup heading`, `CommandSeparator`, `CommandShortcut`. */
export function CommandGrouped() {
  return (
    <div className={cn(popupSurface, 'w-96 overflow-hidden')}>
      <Command>
        <CommandInput placeholder='Search pages and actions' />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading='Pages'>
            <CommandItem>
              <InboxIcon />
              Inbox
              <CommandShortcut>G I</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <FolderIcon />
              Projects
              <CommandShortcut>G P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading='Actions'>
            <CommandItem>
              <UserPlusIcon />
              Invite member
            </CommandItem>
            <CommandItem>
              <SettingsIcon />
              Settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
