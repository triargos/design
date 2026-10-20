import { FolderIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Kbd, KbdGroup } from '~/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

/** A control's name and its shortcut: `Kbd`s in the tooltip, a chord reads “G then P”. */
export function TooltipWithShortcut() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button emphasis='ghost' size='icon' aria-label='Projects' />}>
        <FolderIcon />
      </TooltipTrigger>
      <TooltipContent className='flex items-center gap-1.5 px-2.5'>
        Projects
        <KbdGroup aria-hidden>
          <Kbd className='h-4 min-w-4'>G</Kbd>
          <span className='text-muted-foreground'>then</span>
          <Kbd className='h-4 min-w-4'>P</Kbd>
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  );
}
