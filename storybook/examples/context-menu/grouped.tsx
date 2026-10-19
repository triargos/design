import { CopyIcon, DownloadIcon, PencilIcon, ShareIcon } from 'lucide-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

export function ContextMenuGrouped() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className='flex h-40 w-72 items-center justify-center rounded-control-lg border border-dashed border-border text-body text-muted-foreground'>
        Rechtsklick auf die Datei
      </ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuGroup>
          <ContextMenuLabel>Datei</ContextMenuLabel>
          <ContextMenuItem>
            <PencilIcon />
            Umbenennen
          </ContextMenuItem>
          <ContextMenuItem>
            <DownloadIcon />
            Herunterladen
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>Teilen</ContextMenuLabel>
          <ContextMenuItem>
            <CopyIcon />
            Link kopieren
          </ContextMenuItem>
          <ContextMenuItem>
            <ShareIcon />
            Mit Eltern teilen
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
