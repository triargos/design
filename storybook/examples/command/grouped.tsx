import { CalendarXIcon, InboxIcon, SettingsIcon, UserPlusIcon } from 'lucide-react';

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
    </div>
  );
}
