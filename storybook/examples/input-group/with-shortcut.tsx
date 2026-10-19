import { SearchIcon } from 'lucide-react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import { Kbd } from '~/components/ui/kbd';

export function InputGroupWithShortcut() {
  return (
    <InputGroup className='w-80'>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder='Mitglieder suchen' />
      <InputGroupAddon align='inline-end'>
        <Kbd>⌘K</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}
