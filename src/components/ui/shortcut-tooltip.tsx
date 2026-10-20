import { type ComponentProps, Fragment, type ReactElement } from 'react';

import { Kbd, KbdGroup } from '~/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';

import { formatShortcut } from '~/lib/format-shortcut';
import { useUiStrings } from '~/lib/ui-config';

interface ShortcutTooltipProps extends Pick<ComponentProps<typeof TooltipContent>, 'side'> {
  label: string;
  /** `['N', 'C']` for a chord, `['$mod+Enter']` for a combination. */
  shortcut?: readonly string[];
  children: ReactElement;
}

export function ShortcutTooltip({ label, shortcut = [], side, children }: ShortcutTooltipProps) {
  const strings = useUiStrings();
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} className='flex items-center gap-1.5 px-2.5'>
        <span>{label}</span>
        {shortcut.length > 0 && (
          <KbdGroup aria-hidden>
            {shortcut.map((key, index) => (
              <Fragment key={`${key}-${index}`}>
                {index > 0 && <span className='text-muted-foreground'>{strings.chordSeparator}</span>}
                <Kbd className='h-4 min-w-4'>{formatShortcut(key)}</Kbd>
              </Fragment>
            ))}
          </KbdGroup>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
