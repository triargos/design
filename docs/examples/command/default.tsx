import { IconFolder, IconInbox, IconSearch, IconSettings, IconUserPlus } from '@tabler/icons-react';
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
        <IconSearch data-icon='inline-start' />
        Search
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title='Commands' description='Find a page or an action.'>
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
      </CommandDialog>
    </>
  );
}
