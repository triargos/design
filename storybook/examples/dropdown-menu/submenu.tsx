import { CircleDotIcon, MoreHorizontalIcon, PencilIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

const STATUSES = [
  { value: 'open', label: 'Offen' },
  { value: 'review', label: 'In Prüfung' },
  { value: 'done', label: 'Erledigt' },
] as const;

/** A row with a chevron opens a second list beside the first; one level only. On touch it opens in place. */
export function DropdownMenuSubmenu() {
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CircleDotIcon />
            Status ändern
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className='w-40'>
            {STATUSES.map((status) => (
              <DropdownMenuItem key={status.value}>{status.label}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
