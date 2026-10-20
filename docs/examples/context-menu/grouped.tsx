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
        Right-click the file
      </ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuGroup>
          <ContextMenuLabel>File</ContextMenuLabel>
          <ContextMenuItem>
            <PencilIcon />
            Rename
          </ContextMenuItem>
          <ContextMenuItem>
            <DownloadIcon />
            Download
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>Share</ContextMenuLabel>
          <ContextMenuItem>
            <CopyIcon />
            Copy link
          </ContextMenuItem>
          <ContextMenuItem>
            <ShareIcon />
            Share with the team
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
