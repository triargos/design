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
        Rechtsklick auf die Datei
      </ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuItem>
          <PencilIcon />
          Umbenennen
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <FolderInputIcon />
            Verschieben nach
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className='w-40'>
            <ContextMenuItem>Zeugnisse</ContextMenuItem>
            <ContextMenuItem>Elternbriefe</ContextMenuItem>
            <ContextMenuItem>Archiv</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
