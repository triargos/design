import { SlidersHorizontalIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

/** Toggles in the menu: `DropdownMenuCheckboxItem`, controlled with `checked` and `onCheckedChange`. */
export function DropdownMenuCheckbox() {
  const [columns, setColumns] = useState({ assignee: true, status: true, due: false });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button />}>
        <SlidersHorizontalIcon data-icon='inline-start' />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={columns.assignee}
            onCheckedChange={(checked) => setColumns({ ...columns, assignee: checked })}>
            Assignee
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={columns.status}
            onCheckedChange={(checked) => setColumns({ ...columns, status: checked })}>
            Status
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={columns.due}
            onCheckedChange={(checked) => setColumns({ ...columns, due: checked })}>
            Due date
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
