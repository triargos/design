import { CalendarXIcon, InboxIcon, SearchIcon, SettingsIcon, UserPlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { Kbd, KbdGroup } from '~/components/ui/kbd';

/** The palette: `CommandDialog` around a `Command`, opened with ⌘K or its button. */
export function CommandDefault() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
  return (
    <>
      <Button type='button' intent='neutral' emphasis='raised' onClick={() => setOpen(true)}>
        <SearchIcon data-icon='inline-start' />
        Suchen
        <KbdGroup className='ml-2'>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title='Befehle' description='Seite oder Aktion suchen'>
        <Command>
          <CommandInput placeholder='Seite oder Aktion suchen' />
          <CommandList>
            <CommandEmpty>Keine Treffer</CommandEmpty>
            <CommandGroup heading='Seiten'>
              <CommandItem>
                <InboxIcon />
                Posteingang
                <CommandShortcut>G I</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <CalendarXIcon />
                Abwesenheiten
                <CommandShortcut>G A</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading='Aktionen'>
              <CommandItem>
                <UserPlusIcon />
                Mitglied einladen
              </CommandItem>
              <CommandItem>
                <SettingsIcon />
                Einstellungen
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
