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

import { cn } from '~/lib/utils';

/** `CommandGroup heading`, `CommandSeparator`, `CommandShortcut`. */
export function CommandGrouped() {
  return (
    <div className={cn('rounded-popup bg-popover text-popover-foreground shadow-popup', 'w-96 overflow-hidden')}>
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
