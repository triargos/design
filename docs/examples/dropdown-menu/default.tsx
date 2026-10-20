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
      <DropdownMenuTrigger render={<Button size='icon' aria-label='Actions' />}>
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuLabel>Website redesign</DropdownMenuLabel>
        <DropdownMenuItem>
          <PencilIcon />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <ArchiveIcon />
          Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
