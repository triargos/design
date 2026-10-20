import { IconCircleDot, IconDots, IconPencil } from '@tabler/icons-react';

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

const STATUSES = ['To do', 'In progress', 'Done'];

/** A row with a chevron opens a second list beside the first; one level only. */
export function DropdownMenuSubmenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size='icon' aria-label='Actions' />}>
        <IconDots />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuItem>
          <IconPencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconCircleDot />
            Change status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className='w-40'>
            {STATUSES.map((status) => (
              <DropdownMenuItem key={status}>{status}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
