import { IconCopy, IconDownload, IconPencil, IconShare2 } from '@tabler/icons-react';

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
            <IconPencil />
            Rename
          </ContextMenuItem>
          <ContextMenuItem>
            <IconDownload />
            Download
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuLabel>Share</ContextMenuLabel>
          <ContextMenuItem>
            <IconCopy />
            Copy link
          </ContextMenuItem>
          <ContextMenuItem>
            <IconShare2 />
            Share with the team
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
