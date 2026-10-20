import { IconFolder, IconInbox, IconSettings, IconUserPlus } from '@tabler/icons-react';

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
              <IconInbox />
              Inbox
              <CommandShortcut>G I</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <IconFolder />
              Projects
              <CommandShortcut>G P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading='Actions'>
            <CommandItem>
              <IconUserPlus />
              Invite member
            </CommandItem>
            <CommandItem>
              <IconSettings />
              Settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
