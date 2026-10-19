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

/** Toggles that stay in the menu: `DropdownMenuCheckboxItem`. */
export function DropdownMenuCheckbox() {
  const [columns, setColumns] = useState({ class: true, status: true, submitted: false });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type='button' intent='neutral' emphasis='raised' size='sm' />}>
        <SlidersHorizontalIcon data-icon='inline-start' />
        Spalten
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sichtbare Spalten</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={columns.class}
            onCheckedChange={(checked) => setColumns({ ...columns, class: checked })}>
            Klasse
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={columns.status}
            onCheckedChange={(checked) => setColumns({ ...columns, status: checked })}>
            Status
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={columns.submitted}
            onCheckedChange={(checked) => setColumns({ ...columns, submitted: checked })}>
            Eingereicht am
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
