import { IconSearch } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import { ShortcutTooltip } from '~/components/ui/shortcut-tooltip';

/** Keys pressed together: `$mod` prints ⌘ on a Mac and Ctrl elsewhere. */
export function ShortcutTooltipCombination() {
  return (
    <div className='flex items-center gap-2'>
      <ShortcutTooltip label='Search' shortcut={['$mod+K']}>
        <Button emphasis='ghost' size='icon' aria-label='Search'>
          <IconSearch />
        </Button>
      </ShortcutTooltip>
      <ShortcutTooltip label='Save invoice' shortcut={['$mod+Enter']}>
        <Button intent='primary'>Save</Button>
      </ShortcutTooltip>
      <ShortcutTooltip label='Export tasks' shortcut={['$mod+Shift+E']}>
        <Button>Export</Button>
      </ShortcutTooltip>
    </div>
  );
}
