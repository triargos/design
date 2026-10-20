import { IconArchive, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import { Toggle } from '~/components/ui/toggle';

/** A page header filter next to the search: the list shows archived projects while it is pressed. */
export function ToggleInAHeader() {
  const [archived, setArchived] = useState(false);
  return (
    <div className='flex w-full max-w-xl flex-wrap items-center justify-between gap-related'>
      <h2 className='text-heading'>{archived ? 'Archived projects' : 'Projects'}</h2>
      <div className='flex items-center gap-related'>
        <InputGroup className='w-56'>
          <InputGroupAddon>
            <IconSearch />
          </InputGroupAddon>
          <InputGroupInput placeholder='Search projects' aria-label='Search projects' />
        </InputGroup>
        <Toggle pressed={archived} onPressedChange={setArchived}>
          <IconArchive data-icon='inline-start' />
          Archived
        </Toggle>
      </div>
    </div>
  );
}
