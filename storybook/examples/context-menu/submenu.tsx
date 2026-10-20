import { FolderInputIcon, PencilIcon } from 'lucide-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

export function ContextMenuSubmenu() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className='flex h-40 w-72 items-center justify-center rounded-control-lg border border-dashed border-border text-body text-muted-foreground'>
        Right-click the file
      </ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuItem>
          <PencilIcon />
          Rename
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <FolderInputIcon />
            Move to
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className='w-40'>
            <ContextMenuItem>Contracts</ContextMenuItem>
            <ContextMenuItem>Invoices</ContextMenuItem>
            <ContextMenuItem>Archive</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
