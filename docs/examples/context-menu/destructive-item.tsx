import { IconPencil, IconTrash } from '@tabler/icons-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

import { DemoArea } from '../../kit/demo-area';

export function ContextMenuDestructiveItem() {
  return (
    <ContextMenu>
      <ContextMenuTrigger render={<DemoArea />}>Right-click the file</ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuItem>
          <IconPencil />
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem intent='destructive'>
          <IconTrash />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
