import { useState } from 'react';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

import { DemoArea } from '../../kit/demo-area';

export function ContextMenuCheckbox() {
  const [members, setMembers] = useState(true);
  const [guests, setGuests] = useState(false);
  return (
    <ContextMenu>
      <ContextMenuTrigger render={<DemoArea />}>Right-click the file</ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuGroup>
          <ContextMenuLabel>Visible to</ContextMenuLabel>
          <ContextMenuCheckboxItem checked={members} onCheckedChange={setMembers}>
            Members
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={guests} onCheckedChange={setGuests}>
            Guests
          </ContextMenuCheckboxItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
