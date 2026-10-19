import { SearchIcon } from 'lucide-react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';

/** The group owns surface, focus and invalid; addons sit on the field’s 14px padding line. */
export function InputGroupWithIcon() {
  return (
    <InputGroup className='w-80'>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder='Mitglieder suchen' />
    </InputGroup>
  );
}
