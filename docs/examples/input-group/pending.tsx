import { IconSearch } from '@tabler/icons-react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import { Spinner } from '~/components/ui/spinner';

/** A `Spinner` in the end addon while results load. */
export function InputGroupPending() {
  return (
    <InputGroup className='w-80'>
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
      <InputGroupInput defaultValue='Chen' aria-label='Search members' />
      <InputGroupAddon align='inline-end'>
        <Spinner size={16} />
      </InputGroupAddon>
    </InputGroup>
  );
}
