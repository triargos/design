import { IconChecklist, IconFolder, IconUsers } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import { ShortcutTooltip } from '~/components/ui/shortcut-tooltip';
import { TooltipProvider } from '~/components/ui/tooltip';

const LINKS = [
  { label: 'Projects', shortcut: ['G', 'P'], icon: <IconFolder /> },
  { label: 'Tasks', shortcut: ['G', 'T'], icon: <IconChecklist /> },
  { label: 'Members', shortcut: ['G', 'M'], icon: <IconUsers /> },
];

/** Keys pressed one after the other: one entry per step, “G then P”. */
export function ShortcutTooltipChord() {
  return (
    <TooltipProvider>
      <div className='flex items-center gap-0.5 text-muted-foreground'>
        {LINKS.map(({ label, shortcut, icon }) => (
          <ShortcutTooltip key={label} label={label} shortcut={shortcut}>
            <Button emphasis='ghost' size='icon' aria-label={label}>
              {icon}
            </Button>
          </ShortcutTooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
