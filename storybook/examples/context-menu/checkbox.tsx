import { useState } from 'react';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

export function ContextMenuCheckbox() {
  const [members, setMembers] = useState(true);
  const [guests, setGuests] = useState(false);
  return (
    <ContextMenu>
      <ContextMenuTrigger className='flex h-40 w-72 items-center justify-center rounded-control-lg border border-dashed border-border text-body text-muted-foreground'>
        Right-click the file
      </ContextMenuTrigger>
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
