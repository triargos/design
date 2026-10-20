import { IconCopy, IconDots, IconPencil, IconTrash } from '@tabler/icons-react';

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
      <DropdownMenuTrigger render={<Button size='icon' aria-label='Actions' />}>
        <IconDots />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuItem>
          <IconPencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconCopy />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem intent='destructive'>
          <IconTrash />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
