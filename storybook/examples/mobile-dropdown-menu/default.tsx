import { CircleDotIcon, CopyIcon, MoreHorizontalIcon, PencilIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  MobileDropdownMenu,
  MobileDropdownMenuContent,
  MobileDropdownMenuItem,
  MobileDropdownMenuSub,
  MobileDropdownMenuSubContent,
  MobileDropdownMenuSubTrigger,
  MobileDropdownMenuTrigger,
} from '~/components/ui/mobile-dropdown-menu';

/**
 * A dropdown menu as a drawer, for touch. DropdownMenu switches to it on its own below md; use it directly only for a
 * menu that is always a drawer. A submenu opens a nested drawer.
 */
export function MobileDropdownMenuDefault() {
  return (
    <MobileDropdownMenu>
      <MobileDropdownMenuTrigger
        render={<Button type='button' intent='neutral' emphasis='raised' size='icon' aria-label='Aktionen' />}>
        <MoreHorizontalIcon />
      </MobileDropdownMenuTrigger>
      <MobileDropdownMenuContent>
        <MobileDropdownMenuItem>
          <PencilIcon className='size-4' />
          Bearbeiten
        </MobileDropdownMenuItem>
        <MobileDropdownMenuItem>
          <CopyIcon className='size-4' />
          Duplizieren
        </MobileDropdownMenuItem>
        <MobileDropdownMenuSub>
          <MobileDropdownMenuSubTrigger>
            <CircleDotIcon className='size-4' />
            Status ändern
          </MobileDropdownMenuSubTrigger>
          <MobileDropdownMenuSubContent>
            <MobileDropdownMenuItem>Offen</MobileDropdownMenuItem>
            <MobileDropdownMenuItem>In Prüfung</MobileDropdownMenuItem>
            <MobileDropdownMenuItem>Erledigt</MobileDropdownMenuItem>
          </MobileDropdownMenuSubContent>
        </MobileDropdownMenuSub>
      </MobileDropdownMenuContent>
    </MobileDropdownMenu>
  );
}
