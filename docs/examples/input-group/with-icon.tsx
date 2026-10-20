import { IconSearch } from '@tabler/icons-react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';

/** The group owns surface, focus and invalid; addons sit on the field’s 12px padding line. */
export function InputGroupWithIcon() {
  return (
    <InputGroup className='w-80'>
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
      <InputGroupInput placeholder='Search members' aria-label='Search members' />
    </InputGroup>
  );
}
