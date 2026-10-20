import { ArchiveIcon, CircleCheckIcon, Trash2Icon, XIcon } from 'lucide-react';

import { BottomFloatMenu, BottomFloatMenuItem } from '~/components/ui/bottom-float-menu';
import { Button } from '~/components/ui/button';

/**
 * Direct actions on a selection, read by weight: the count as text, the actions raised, the destructive one subtle
 * (its confirmation is where the solid fill belongs), and clear as a quiet ✕ at the end. Too wide, the bar wraps.
 */
export function BottomFloatMenuDefault() {
  return (
    <BottomFloatMenu show label='Selection'>
      <span className='ps-4 pe-1 tabular-nums'>3 selected</span>
      <BottomFloatMenuItem>
        <Button>
          <CircleCheckIcon data-icon='inline-start' />
          Mark done
        </Button>
      </BottomFloatMenuItem>
      <BottomFloatMenuItem>
        <Button>
          <ArchiveIcon data-icon='inline-start' />
          Archive
        </Button>
      </BottomFloatMenuItem>
      <BottomFloatMenuItem>
        <Button intent='destructive' emphasis='subtle'>
          <Trash2Icon data-icon='inline-start' />
          Delete
        </Button>
      </BottomFloatMenuItem>
      <BottomFloatMenuItem>
        <Button emphasis='ghost' size='icon-lg' aria-label='Clear selection'>
          <XIcon />
        </Button>
      </BottomFloatMenuItem>
    </BottomFloatMenu>
  );
}
