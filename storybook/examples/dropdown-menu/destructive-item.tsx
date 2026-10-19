import { CopyIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

/** `intent='destructive'`, last, after a separator. */
export function DropdownMenuDestructiveItem() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button type='button' intent='neutral' emphasis='raised' size='icon-sm' aria-label='Aktionen' />}>
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuItem>
          <PencilIcon />
          Bearbeiten
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon />
          Duplizieren
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem intent='destructive'>
          <Trash2Icon />
          Löschen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
