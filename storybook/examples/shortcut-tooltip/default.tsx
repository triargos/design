import { InboxIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { ShortcutTooltip } from '~/components/ui/shortcut-tooltip';

/** Names a control and its shortcut; chords read “dann”. */
export function ShortcutTooltipDefault() {
  return (
    <ShortcutTooltip label='Posteingang' shortcut={['G', 'I']}>
      <Button type='button' intent='neutral' emphasis='ghost' size='icon-sm' aria-label='Posteingang'>
        <InboxIcon />
      </Button>
    </ShortcutTooltip>
  );
}
