import { IconCopy, IconPencil } from '@tabler/icons-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

import { DemoArea } from '../../kit/demo-area';

/** The same menu, opened with a right click (long press on touch) where the pointer is. Only ever a shortcut. */
export function ContextMenuDefault() {
  return (
    <ContextMenu>
      <ContextMenuTrigger render={<DemoArea />}>Right-click the file</ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuItem>
          <IconPencil />
          Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <IconCopy />
          Copy link
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
