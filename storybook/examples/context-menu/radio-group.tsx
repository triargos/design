import { useState } from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

export function ContextMenuRadioGroupExample() {
  const [view, setView] = useState('list');
  return (
    <ContextMenu>
      <ContextMenuTrigger className='flex h-40 w-72 items-center justify-center rounded-control-lg border border-dashed border-border text-body text-muted-foreground'>
        Right-click the file
      </ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuGroup>
          <ContextMenuLabel>View</ContextMenuLabel>
          <ContextMenuRadioGroup value={view} onValueChange={setView}>
            <ContextMenuRadioItem value='list'>List</ContextMenuRadioItem>
            <ContextMenuRadioItem value='grid'>Grid</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
