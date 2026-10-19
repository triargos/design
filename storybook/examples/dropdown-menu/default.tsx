import { ArchiveIcon, CopyIcon, MoreHorizontalIcon, PencilIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

/** Actions: an icon and a label each. */
export function DropdownMenuDefault() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button type='button' intent='neutral' emphasis='raised' size='icon-sm' aria-label='Aktionen' />}>
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuLabel>Antrag 2024-118</DropdownMenuLabel>
        <DropdownMenuItem>
          <PencilIcon />
          Bearbeiten
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon />
          Duplizieren
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <ArchiveIcon />
          Archivieren
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
