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

import { DemoArea } from '../../kit/demo-area';

export function ContextMenuRadioGroupExample() {
  const [view, setView] = useState('list');
  return (
    <ContextMenu>
      <ContextMenuTrigger render={<DemoArea />}>Right-click the file</ContextMenuTrigger>
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
