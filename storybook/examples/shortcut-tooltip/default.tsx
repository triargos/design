import { FolderIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { ShortcutTooltip } from '~/components/ui/shortcut-tooltip';

/** Names a control and its shortcut; a chord reads “G then P”. */
export function ShortcutTooltipDefault() {
  return (
    <ShortcutTooltip label='Projects' shortcut={['G', 'P']}>
      <Button emphasis='ghost' size='icon-sm' aria-label='Projects'>
        <FolderIcon />
      </Button>
    </ShortcutTooltip>
  );
}
