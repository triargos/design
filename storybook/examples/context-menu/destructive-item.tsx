import { PencilIcon, Trash2Icon } from 'lucide-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

export function ContextMenuDestructiveItem() {
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
        <ContextMenuSeparator />
        <ContextMenuItem intent='destructive'>
          <Trash2Icon />
          Löschen
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
