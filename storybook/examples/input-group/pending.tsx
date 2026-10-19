import { SearchIcon } from 'lucide-react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import { Loader } from '~/components/ui/loader';

/** A `Loader` in the end addon while results load. */
export function InputGroupPending() {
  return (
    <InputGroup className='w-80'>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput defaultValue='Schmidt' aria-label='Mitglieder suchen' />
      <InputGroupAddon align='inline-end'>
        <Loader size={16} />
      </InputGroupAddon>
    </InputGroup>
  );
}
