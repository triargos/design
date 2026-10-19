import { ArrowUpDownIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

/** One of a few, chosen in the menu: `DropdownMenuRadioGroup`. */
export function DropdownMenuRadioGroupExample() {
  const [sort, setSort] = useState('newest');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type='button' intent='neutral' emphasis='raised' size='sm' />}>
        <ArrowUpDownIcon data-icon='inline-start' />
        Sortieren
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sortieren nach</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value='newest'>Neueste zuerst</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='oldest'>Älteste zuerst</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='name'>Name</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
