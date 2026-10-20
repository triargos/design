import { Fragment, type ReactElement } from 'react';

import { Kbd, KbdGroup } from '~/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

import { formatShortcut } from '~/lib/format-shortcut';

interface ShortcutTooltipProps {
  label: string;
  /** `['G', 'P']` for a chord, `['$mod+Enter']` for a combination. */
  shortcut?: readonly string[];
  /** Between the keys of a chord: `G then P`. */
  chordSeparator?: string;
  children: ReactElement;
}

/** A `Tooltip` that names a control and its keyboard shortcut. */
export function ShortcutTooltip({ label, shortcut = [], chordSeparator = 'then', children }: ShortcutTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent className='flex items-center gap-1.5 px-2.5'>
        <span>{label}</span>
        {shortcut.length > 0 && (
          <KbdGroup aria-hidden>
            {shortcut.map((key, index) => (
              <Fragment key={`${key}-${index}`}>
                {index > 0 && <span className='text-muted-foreground'>{chordSeparator}</span>}
                <Kbd className='h-4 min-w-4'>{formatShortcut(key)}</Kbd>
              </Fragment>
            ))}
          </KbdGroup>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
