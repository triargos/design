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

const STATUSES = ['To do', 'In progress', 'Done'];

/** A row with a chevron opens a second list beside the first; one level only. On touch it opens a stacked drawer. */
export function DropdownMenuSubmenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size='icon-sm' aria-label='Actions' />}>
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuItem>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CircleDotIcon />
            Change status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent label='Change status' className='w-40'>
            {STATUSES.map((status) => (
              <DropdownMenuItem key={status}>{status}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
