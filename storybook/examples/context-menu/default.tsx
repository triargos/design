import { CopyIcon, PencilIcon } from 'lucide-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

/** The same menu, opened with a right click (long press on touch) where the pointer is. Only ever a shortcut. */
export function ContextMenuDefault() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className='flex h-40 w-72 items-center justify-center rounded-control-lg border border-dashed border-border text-body text-muted-foreground'>
        Rechtsklick auf die Datei
      </ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuItem>
          <PencilIcon />
          Umbenennen
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <CopyIcon />
          Link kopieren
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
