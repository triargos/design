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

/** One of a few, chosen in the menu: `DropdownMenuRadioGroup`, controlled with `value` and `onValueChange`. */
export function DropdownMenuRadioGroupExample() {
  const [sort, setSort] = useState('newest');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size='sm' />}>
        <ArrowUpDownIcon data-icon='inline-start' />
        Sort
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value='newest'>Newest first</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='oldest'>Oldest first</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='name'>Name</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
