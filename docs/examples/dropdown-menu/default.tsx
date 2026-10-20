import { IconArchive, IconCopy, IconDots, IconPencil } from '@tabler/icons-react';

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
        <IconDots />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-56'>
        <DropdownMenuLabel>Website redesign</DropdownMenuLabel>
        <DropdownMenuItem>
          <IconPencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconCopy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <IconArchive />
          Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
