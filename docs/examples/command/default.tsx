import { FolderIcon, InboxIcon, SearchIcon, SettingsIcon, UserPlusIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '~/components/ui/command';

/**
 * The palette: `CommandDialog` around a `Command`. An app also opens it with ⌘K (this site's search does, so the
 * example only has its button).
 */
export function CommandDefault() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <SearchIcon data-icon='inline-start' />
        Search
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title='Commands' description='Find a page or an action.'>
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
      </CommandDialog>
    </>
  );
}
